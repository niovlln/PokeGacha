// supabase/functions/forfeit/index.ts
// Match-end / disconnect handling. Three modes, all ending the match cleanly:
//
//   { matchId, mode: "concede" }      → caller gives up; opponent wins.
//   { matchId, mode: "claim" }        → caller asserts the opponent disconnected.
//                                        Server INDEPENDENTLY verifies the opponent's
//                                        heartbeat is stale (>20s) before awarding the
//                                        win to the caller. Anti-cheat: never trust the
//                                        client's claim blindly.
//   { matchId, mode: "close" }        → caller's tab is closing (sendBeacon); treated
//                                        like concede (best-effort; heartbeat is backup).
//
// On success the match is set status='finished', winner=<survivor>, end_reason set.
// Both clients observe this via Realtime/poll, show the result, then it gets cleaned up.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STALE_MS = 20 * 1000; // a heartbeat older than this = disconnected

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  const authHeader = req.headers.get("Authorization") || "";
  let token = authHeader.replace(/^Bearer\s+/i, "");

  let body: any;
  try { body = await req.json(); } catch { body = {}; }
  // sendBeacon (tab-close) can't set headers, so accept the token in the body too.
  if (!token && body && body.accessToken) token = body.accessToken;

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: token ? `Bearer ${token}` : "" } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser(token || undefined);
  if (userErr || !userData?.user) return json({ ok: false, error: "unauthorized" }, 401);
  const me = userData.user.id;

  const { matchId, mode } = body || {};
  if (!matchId || !mode) return json({ ok: false, error: "bad_request" }, 400);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: match, error: mErr } = await admin.from("matches").select("*").eq("id", matchId).single();
  if (mErr || !match) return json({ ok: false, error: "match_not_found" }, 404);

  // Already over? Nothing to do (idempotent).
  if (match.status === "finished") return json({ ok: true, alreadyOver: true, winner: match.winner });

  let mySide: "a" | "b" | null = null;
  if (match.player_a === me) mySide = "a";
  else if (match.player_b === me) mySide = "b";
  if (!mySide) return json({ ok: false, error: "not_a_participant" }, 403);
  const foeSide = mySide === "a" ? "b" : "a";

  // Heartbeat ping: just stamp my own last_seen and return (cheap liveness signal).
  if (mode === "ping") {
    const col = mySide === "a" ? "last_seen_a" : "last_seen_b";
    await admin.from("matches").update({ [col]: new Date().toISOString() }).eq("id", matchId);
    // Also report the opponent's last_seen so the client can decide whether to claim.
    const foeSeen = foeSide === "a" ? match.last_seen_a : match.last_seen_b;
    return json({ ok: true, ping: true, foeLastSeen: foeSeen, status: match.status });
  }

  // Cleanup: delete a FINISHED match (called by a participant after they've seen the
  // result). Only deletes if already finished, so it can't nuke a live game.
  if (mode === "cleanup") {
    if (match.status === "finished") {
      await admin.from("matches").delete().eq("id", matchId).eq("status", "finished");
    }
    return json({ ok: true, cleaned: true });
  }

  let winner: "a" | "b";
  let endReason: string;

  if (mode === "concede" || mode === "close") {
    // I give up → opponent wins.
    winner = foeSide;
    endReason = mode === "close" ? "disconnect" : "forfeit";
  } else if (mode === "claim") {
    // I assert my opponent disconnected. VERIFY their heartbeat is actually stale.
    const foeSeen = foeSide === "a" ? match.last_seen_a : match.last_seen_b;
    const foeSeenMs = foeSeen ? new Date(foeSeen).getTime() : 0;
    const age = Date.now() - foeSeenMs;
    if (foeSeenMs && age < STALE_MS) {
      // Opponent is actually still alive — reject the claim.
      return json({ ok: false, error: "opponent_alive", ageMs: age }, 409);
    }
    // Opponent's heartbeat is stale (or never set) → I win by disconnect.
    winner = mySide;
    endReason = "disconnect";
  } else {
    return json({ ok: false, error: "bad_mode" }, 400);
  }

  // End the match. Guard so we only finish a match that's still in progress.
  const { error: wErr } = await admin
    .from("matches")
    .update({ status: "finished", winner, end_reason: endReason })
    .eq("id", matchId)
    .neq("status", "finished");
  if (wErr) return json({ ok: false, error: "end_failed", detail: wErr.message }, 500);

  return json({ ok: true, finished: true, winner, endReason });
});
