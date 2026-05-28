// supabase/functions/pvp-turn/index.ts
// Phase 4c (updated for 4c-2) — Authoritative PvP turn referee, match-aware.
//
// Now reads the AUTHORITATIVE state from the matches table (not the client), so a
// client cannot tamper with HP/status between turns. Simultaneous turns (Option A):
// each player submits their actions; the server stores them in `pending` and only
// resolves the turn once BOTH players have submitted.
//
// Request: { matchId: string, actions: Action[] }   // the CALLER's actions only
//   Action: { side:'a'|'b', actorIdx, moveKey, targetSide:'a'|'b', targetIdx }
// Auth: caller's JWT required. The caller may only submit actions for THEIR OWN side.
//
// Response while waiting:  { ok:true, resolved:false, waiting:'opponent' }
// Response after resolve:  { ok:true, resolved:true, state, log, over, winner, turnNumber }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { resolveTurn, makeRNG, sanitizeInstance, moveData, getPoke, applyReplacement } from "./engine.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

function battlerMovesetLegal(b: any): boolean {
  if (!b || !getPoke(b.speciesId)) return false;
  const clean = sanitizeInstance(b.speciesId, { moves: (b.moves || []).map((m: any) => m.key || m), ability: b.ability });
  const claimed = (b.moves || []).map((m: any) => m.key || m).filter(Boolean);
  return claimed.every((k: string) => clean.moves.includes(k));
}

// Validate the actions a single player submitted for their own side.
function validateActions(state: any, side: "a" | "b", actions: any[]): string | null {
  if (!Array.isArray(actions)) return "bad_actions";
  for (const act of actions) {
    if (!act || act.side !== side) return "wrong_side";              // can only act for own side
    // Switch action: validate the bench slot holds a living Pokémon.
    if (act.type === "switch") {
      const benchK = side === "a" ? "benchA" : "benchB";
      const bench = state[benchK] || [];
      const incoming = bench[act.benchIdx];
      if (!incoming || incoming.fainted) return "bad_switch";
      const slot = state[side]?.[act.actorIdx];
      if (!slot) return "bad_actor";
      continue;
    }
    // Move action.
    const actor = state[side]?.[act.actorIdx];
    if (!actor || actor.fainted) return "bad_actor";
    const knows = (actor.moves || []).some((m: any) => (m.key || m) === act.moveKey);
    if (!knows) return "illegal_move";
    if (!moveData(act.moveKey)) return "unknown_move";
    if (act.targetSide !== "a" && act.targetSide !== "b") return "bad_target_side";
  }
  return null;
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
  const { matchId, actions, replace } = body || {};
  if (!matchId) return json({ ok: false, error: "bad_request" }, 400);
  if (!replace && !Array.isArray(actions)) return json({ ok: false, error: "bad_request" }, 400);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  // Load the authoritative match.
  const { data: match, error: mErr } = await admin.from("matches").select("*").eq("id", matchId).single();
  if (mErr || !match) return json({ ok: false, error: "match_not_found" }, 404);
  if (match.status !== "active") return json({ ok: false, error: "match_not_active" }, 409);

  // Which side is the caller?
  let mySide: "a" | "b" | null = null;
  if (match.player_a === me) mySide = "a";
  else if (match.player_b === me) mySide = "b";
  if (!mySide) return json({ ok: false, error: "not_a_participant" }, 403);

  const state = match.state;

  // ---- A1 faint-replacement branch: caller sends in a bench Pokémon to fill an empty slot.
  // Request: { matchId, replace: { actorIdx, benchIdx } }
  if (replace) {
    const pend = match.pending || {};
    const needRep = pend.needReplace || { a: [], b: [] };
    const mine = needRep[mySide] || [];
    if (!mine.includes(replace.actorIdx)) return json({ ok: false, error: "no_replacement_needed" }, 409);

    const repLog = applyReplacement(state, mySide, replace.actorIdx, replace.benchIdx);
    if (!repLog.length) return json({ ok: false, error: "bad_replacement" }, 422);

    // Remove this slot from the needed list.
    needRep[mySide] = mine.filter((i: number) => i !== replace.actorIdx);
    const stillNeeded = (needRep.a && needRep.a.length) || (needRep.b && needRep.b.length);

    const { error: rErr } = await admin.from("matches").update({
      state,
      pending: stillNeeded ? { a: null, b: null, needReplace: needRep } : { a: null, b: null },
      last_log: repLog,
    }).eq("id", matchId);
    if (rErr) return json({ ok: false, error: "save_replacement_failed", detail: rErr.message }, 500);

    return json({ ok: true, replaced: true, state, log: repLog, needReplace: needRep });
  }

  // Anti-cheat: re-validate both teams' movesets against legal pools.
  for (const side of ["a", "b"] as const)
    for (const b of state[side]) if (b && !battlerMovesetLegal(b)) return json({ ok: false, error: "illegal_moveset" }, 422);

  // Validate the caller's actions for their own side.
  const vErr = validateActions(state, mySide, actions);
  if (vErr) return json({ ok: false, error: vErr }, 422);

  // Store this player's actions into `pending`. If they already submitted, don't resubmit.
  const pending = match.pending || { a: null, b: null };
  if (pending[mySide]) return json({ ok: true, resolved: false, waiting: "self_already_submitted" });
  pending[mySide] = actions;

  const otherSide = mySide === "a" ? "b" : "a";

  // If the opponent hasn't submitted yet → just save pending and wait.
  if (!pending[otherSide]) {
    const { error: upErr } = await admin.from("matches").update({ pending }).eq("id", matchId);
    if (upErr) return json({ ok: false, error: "save_pending_failed", detail: upErr.message }, 500);
    return json({ ok: true, resolved: false, waiting: "opponent" });
  }

  // ---- Both players submitted → RESOLVE the simultaneous turn ----
  const allActions = [...(pending.a || []), ...(pending.b || [])];
  const seed = ((Number(match.seed) >>> 0) ^ ((match.turn_number + 1) * 0x9e3779b1)) >>> 0;
  const rng = makeRNG(seed);

  let result;
  try { result = resolveTurn(state, allActions, rng); }
  catch (e) { return json({ ok: false, error: "resolve_failed", detail: String(e) }, 500); }

  const finished = result.over;
  const needRep = result.needReplace || { a: [], b: [] };
  const anyReplace = (needRep.a && needRep.a.length) || (needRep.b && needRep.b.length);
  const { error: wErr } = await admin.from("matches").update({
    state,
    // If replacements are needed, stash them in pending so clients can fill empty slots
    // before the next turn (A1 end-of-turn replacement). Otherwise clear pending.
    pending: anyReplace ? { a: null, b: null, needReplace: needRep } : { a: null, b: null },
    turn_number: match.turn_number + 1,
    last_log: result.log,
    status: finished ? "finished" : "active",
    winner: finished ? result.winner : null,
  }).eq("id", matchId);
  if (wErr) return json({ ok: false, error: "save_result_failed", detail: wErr.message }, 500);

  return json({
    ok: true,
    resolved: true,
    state,
    log: result.log,
    over: result.over,
    winner: result.winner,
    needReplace: needRep,
    turnNumber: match.turn_number + 1,
  });
});