// supabase/functions/find-match/index.ts
// Phase 4c-2 — Matchmaking. Pairs two waiting players into an authoritative match.
//
// Flow (called by an authenticated player with their chosen team):
//   1. Look for another player already in the matchmaking_queue.
//   2. If found → build BOTH teams authoritatively (server builds the battlers from
//      species + sanitized instances), create a `matches` row with the initial state,
//      remove both players from the queue, return { matched:true, matchId, side }.
//   3. If nobody waiting → upsert this player into the queue, return { matched:false }.
//
// Uses the service-role key so it can write `matches` (which has no client-write RLS).
//
// Request: { team: [{ speciesId, instance:{moves,ability} }, ...] }   // 1–2 Pokémon
// Auth: requires the caller's JWT (Authorization: Bearer <access_token>).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sanitizeInstance } from "./engine.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

// Strip transient/derived fields the client shouldn't dictate; keep only what we need
// to rebuild authoritatively. We rebuild battlers from {speciesId, instance} server-side.
function normalizeTeam(team: any): Array<{ speciesId: number; instance: any }> {
  if (!Array.isArray(team)) return [];
  return team.slice(0, 6).map((pk: any) => ({
    speciesId: parseInt(pk?.speciesId),
    instance: { moves: (pk?.instance?.moves || []).slice(0, 4), ability: pk?.instance?.ability ?? null },
  })).filter((pk) => Number.isFinite(pk.speciesId));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Identify the caller from their JWT.
  const authHeader = req.headers.get("Authorization") || "";
  const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json({ ok: false, error: "unauthorized" }, 401);
  const me = userData.user.id;

  let body: any;
  try { body = await req.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }
  const myTeam = normalizeTeam(body?.team);
  if (!myTeam.length) return json({ ok: false, error: "empty_team" }, 400);

  // Service-role client bypasses RLS to manage queue + matches.
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  // 0. Housekeeping: delete this player's OLD matches so the table doesn't accumulate.
  //    - Any 'finished' match involving me is safe to delete (both players are done).
  //    - Any match older than 10 minutes that's still 'picking'/'active' is an
  //      abandoned/disconnected game — clean it up too.
  try {
    const staleBefore = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    await admin.from("matches").delete()
      .or(`player_a.eq.${me},player_b.eq.${me}`)
      .or(`status.eq.finished,created_at.lt.${staleBefore}`);
  } catch (e) { /* non-fatal */ }

  // 1. Find the oldest waiting opponent (not me).
  const { data: waiting, error: qErr } = await admin
    .from("matchmaking_queue")
    .select("user_id, team, created_at")
    .neq("user_id", me)
    .order("created_at", { ascending: true })
    .limit(1);
  if (qErr) return json({ ok: false, error: "queue_read_failed", detail: qErr.message }, 500);

  if (waiting && waiting.length) {
    const opp = waiting[0];
    const oppTeam = normalizeTeam(opp.team);
    if (!oppTeam.length) {
      // Opponent had a bad team; drop them from queue and let caller wait.
      await admin.from("matchmaking_queue").delete().eq("user_id", opp.user_id);
      await admin.from("matchmaking_queue").upsert({ user_id: me, team: myTeam });
      return json({ ok: true, matched: false });
    }

    // Store BOTH players' full teams (the up-to-6 they brought). The battle state is
    // NOT built yet — that happens in submit-picks once both have chosen their 4.
    // player_a = opponent (waited first), player_b = me.
    if (!oppTeam.length || !myTeam.length) return json({ ok: false, error: "team_build_failed" }, 422);

    const seed = Math.floor(Math.random() * 0x7fffffff);
    const deadline = new Date(Date.now() + 60 * 1000).toISOString(); // 60s picking timer

    // Create the match in 'picking' status.
    const { data: match, error: insErr } = await admin
      .from("matches")
      .insert({
        player_a: opp.user_id,
        player_b: me,
        seed,
        turn_number: 0,
        state: null,                 // built once both pick
        pending: { a: null, b: null },
        team_a: oppTeam,             // raw picks {speciesId, instance}
        team_b: myTeam,
        picks_a: null,
        picks_b: null,
        picking_deadline: deadline,
        status: "picking",
      })
      .select("id")
      .single();
    if (insErr) return json({ ok: false, error: "match_create_failed", detail: insErr.message }, 500);

    // Remove BOTH players from the queue.
    await admin.from("matchmaking_queue").delete().in("user_id", [opp.user_id, me]);

    return json({ ok: true, matched: true, matchId: match.id, side: "b", seed, status: "picking" });
  }

  // 2. Nobody waiting → join the queue.
  const { error: upErr } = await admin.from("matchmaking_queue").upsert({ user_id: me, team: myTeam });
  if (upErr) return json({ ok: false, error: "queue_join_failed", detail: upErr.message }, 500);
  return json({ ok: true, matched: false });
});