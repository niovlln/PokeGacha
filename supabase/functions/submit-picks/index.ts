// supabase/functions/submit-picks/index.ts
// Phase #2 — Server-side simultaneous, hidden picking phase with a 60s timer.
//
// After find-match creates a match in 'picking' status (with each player's full team
// stored in team_a/team_b), each player privately submits the 4 Pokémon they want to
// deploy. Picks are hidden from the opponent. When BOTH have submitted — OR the
// picking_deadline has passed — the server builds the authoritative battle state
// (auto-picking the first 4 for any no-show) and flips the match to 'active'.
//
// Request: { matchId: string, picks: number[] }   // species ids, subset of MY team, up to 4
// Auth: caller's JWT.
// Response: { ok:true, waiting:true } while waiting for opponent,
//           { ok:true, started:true } once the battle has been built.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildTeam } from "./engine.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

// Validate that the player's picks are a subset of the team they brought, dedupe, cap 4.
// Returns the ordered list of {speciesId, instance} to deploy (first 2 active, next 2 bench).
function resolvePicks(team: any[], pickedIds: any[]): any[] {
  const ids = Array.isArray(pickedIds) ? [...new Set(pickedIds.map((n) => parseInt(n)))] : [];
  const chosen = ids
    .map((id) => team.find((pk: any) => parseInt(pk.speciesId) === id))
    .filter(Boolean)
    .slice(0, 4);
  // If the player picked nothing valid, auto-pick the first 4 of their team.
  if (!chosen.length) return team.slice(0, 4);
  return chosen;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  const authHeader = req.headers.get("Authorization") || "";
  const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json({ ok: false, error: "unauthorized" }, 401);
  const me = userData.user.id;

  let body: any;
  try { body = await req.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }
  const { matchId, picks } = body || {};
  if (!matchId || !Array.isArray(picks)) return json({ ok: false, error: "bad_request" }, 400);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: match, error: mErr } = await admin.from("matches").select("*").eq("id", matchId).single();
  if (mErr || !match) return json({ ok: false, error: "match_not_found" }, 404);

  // If the match already started (both picked, or someone else triggered the build), done.
  if (match.status === "active" || match.status === "finished") return json({ ok: true, started: true });
  if (match.status !== "picking") return json({ ok: false, error: "not_picking" }, 409);

  let mySide: "a" | "b" | null = null;
  if (match.player_a === me) mySide = "a";
  else if (match.player_b === me) mySide = "b";
  if (!mySide) return json({ ok: false, error: "not_a_participant" }, 403);

  const myTeam = mySide === "a" ? (match.team_a || []) : (match.team_b || []);
  const myResolved = resolvePicks(myTeam, picks);

  // Store MY picks (private — opponent never receives this). Use .select() so we get
  // the committed row back (read-your-write), guaranteeing my pick is visible.
  const pickCol = mySide === "a" ? "picks_a" : "picks_b";
  const { data: afterMine, error: upErr } = await admin
    .from("matches").update({ [pickCol]: myResolved }).eq("id", matchId).select().single();
  if (upErr) return json({ ok: false, error: "save_picks_failed", detail: upErr.message }, 500);

  // Decide whether to build. Start from the row returned by my own write (which
  // definitely contains my pick), then re-read once to pick up the opponent's pick
  // if it landed. We OR-merge so a read-replica lag can't drop my own pick and make
  // BOTH players think they're still waiting (the deadlock that left one stuck).
  let m2 = afterMine;
  const { data: fresh } = await admin.from("matches").select("*").eq("id", matchId).single();
  if (fresh) {
    m2 = fresh;
    // Guarantee my just-written pick is reflected even under replica lag.
    if (!m2[pickCol]) m2[pickCol] = myResolved;
  }
  if (!m2 || m2.status !== "picking") return json({ ok: true, started: true });

  const deadlinePassed = m2.picking_deadline && new Date(m2.picking_deadline).getTime() <= Date.now();
  const bothPicked = m2.picks_a && m2.picks_b;

  if (!bothPicked && !deadlinePassed) {
    // Still waiting on the opponent and there's time left.
    return json({ ok: true, waiting: true });
  }

  // ---- Build the battle: both picked, OR the timer expired (auto-pick no-shows) ----
  const picksA = m2.picks_a || resolvePicks(m2.team_a || [], []); // auto first-4 if missing
  const picksB = m2.picks_b || resolvePicks(m2.team_b || [], []);

  // Build the battle: first 2 picks are ACTIVE (on field), next 2 are BENCH (reserves
  // for the switching feature). The engine fights with the active pair; bench Pokémon
  // are carried in state.benchA/benchB until switching (Group B) is built.
  const activeA = buildTeam(picksA.slice(0, 2), 50);
  const activeB = buildTeam(picksB.slice(0, 2), 50);
  const benchA = buildTeam(picksA.slice(2, 4), 50);
  const benchB = buildTeam(picksB.slice(2, 4), 50);
  if (!activeA.length || !activeB.length) return json({ ok: false, error: "team_build_failed" }, 422);

  const state = { a: activeA, b: activeB, benchA, benchB };

  // Flip to active. Guard against a race: only update if still 'picking'.
  const { error: startErr } = await admin
    .from("matches")
    .update({ state, status: "active", picks_a: picksA, picks_b: picksB })
    .eq("id", matchId)
    .eq("status", "picking");
  if (startErr) return json({ ok: false, error: "start_failed", detail: startErr.message }, 500);

  return json({ ok: true, started: true });
});
