// js/pvponline.js — Phase 4c-3: online PvP battle (Realtime + authoritative server).
// Coexists with the local CPU battle (battleui.js) — this is a separate flow.
//
// Per-perspective rendering: the server stores canonical sides 'a' and 'b'. Each
// player sees THEMSELVES on the near side (bottom-left) regardless of which canonical
// side they are. POV.mySide tells us which canonical side "I" am.

const PVP = {
  matchId: null,
  mySide: null,      // 'a' | 'b' (which canonical side I am)
  foeSide: null,
  seed: null,
  state: null,       // canonical { a:[...], b:[...] }
  turnNumber: 0,
  channel: null,     // Realtime subscription
  submitting: false,
  awaitingResolve: false,
  over: false,
  searching: false,
  _animating: false, // a turn's log/animation is currently playing
  pendingActions: [], // my actions being assembled this turn
};

// ---- Perspective helpers ----
function pvpNear() { return (PVP.state && PVP.state[PVP.mySide]) || []; }   // my active team
function pvpFar()  { return (PVP.state && PVP.state[PVP.foeSide]) || []; }   // opponent active team
function pvpBench() { return (PVP.state && PVP.state[PVP.mySide === "a" ? "benchA" : "benchB"]) || []; } // my bench

// ---- Entry: Find Match (sends full active team; picking happens AFTER match found) ----
async function findOnlineMatch() {
  if (typeof sb === "undefined" || !currentUser) { toast(t("pvp_login_required")); return; }
  const teamIds = (G.teams && G.teams[G.activeTeam] || []).filter(id => G.collection[id] && G.collection[id].count > 0);
  if (teamIds.length < 1) { toast(t("pvp_need_team")); return; }

  PVP._teamIds = teamIds;
  _pvpEntered = false;
  // Reset stale per-match flags from any previous match, so a finished match's
  // PVP.over=true can't suppress this match's Realtime/poll updates (which would
  // leave us stuck on the picking "waiting" veil after both players confirm).
  PVP.over = false;
  PVP.awaitingResolve = false;
  PVP._animating = false;
  PVP._waitingForOpponentReplace = false;
  PVP._lastReplaceSig = null;
  PVP._targeting = null;
  PVP.turnNumber = 0;
  const team = teamIds.map(id => ({
    speciesId: id,
    instance: (G.collection[id] && G.collection[id].instances && G.collection[id].instances[0]) || buildDefaultLoadout(id),
  }));

  document.getElementById("battleOverlay").classList.add("open");
  PVP.searching = true;
  PVP._searchStartedAt = Date.now() - 3000; // small grace window for clock skew
  renderSearching(t("pvp_searching"));

  try {
    const { data, error } = await sb.functions.invoke("find-match", { body: { team } });
    if (error || !data || !data.ok) { renderSearching(t("pvp_error")); PVP.searching = false; return; }
    if (data.matched) {
      showMatchFoundThen(data.matchId, data.side, { a: data.nameA, b: data.nameB });
    } else {
      waitForMatchAsPlayerA();
    }
  } catch (e) {
    renderSearching(t("pvp_error")); PVP.searching = false;
  }
}

// ===================== PICKING PHASE (after match found, hidden, 60s timer) =====================
// Each player privately picks 4 from the team they brought. Neither sees the other's
// picks. When both submit (or 60s elapses), the server builds the battle.
const PVP_PICK = { picks: [], pool: [], timer: null, deadline: 0 };

function enterPickingPhase(matchId, side) {
  PVP.matchId = matchId;
  PVP.mySide = side;
  PVP.foeSide = side === "a" ? "b" : "a";
  // Clear stale flags from a previous match so updates aren't suppressed here.
  PVP.over = false;
  PVP.awaitingResolve = false;
  PVP._animating = false;
  PVP._waitingForOpponentReplace = false;
  PVP._lastReplaceSig = null;
  PVP._targeting = null;
  PVP.turnNumber = 0;
  _pvpEntered = false;
  PVP_PICK.picks = [];
  PVP_PICK.pool = (PVP._teamIds || []).slice();
  PVP_PICK.deadline = Date.now() + 60 * 1000;
  PVP_PICK.submitted = false;

  // Listen for the match flipping to 'active' (both picked / timeout → battle built).
  subscribeToMatch(matchId);

  renderPickPhase();
  startPickCountdown();
}

function startPickCountdown() {
  if (PVP_PICK.timer) clearInterval(PVP_PICK.timer);
  PVP_PICK.timer = setInterval(() => {
    const left = Math.max(0, Math.ceil((PVP_PICK.deadline - Date.now()) / 1000));
    const el = document.getElementById("pickTimer");
    if (el) el.textContent = left + "s";
    if (left <= 0) {
      clearInterval(PVP_PICK.timer); PVP_PICK.timer = null;
      // Auto-submit whatever is chosen (server auto-picks first 4 if empty).
      if (!PVP_PICK.submitted) submitPicks();
    }
  }, 250);
}

function renderPickPhase() {
  const stage = document.getElementById("battleStage");
  const log = document.getElementById("battleLog");
  const controls = document.getElementById("battleControls");
  log.innerHTML = "";
  const need = Math.min(4, PVP_PICK.pool.length);
  const left = Math.max(0, Math.ceil((PVP_PICK.deadline - Date.now()) / 1000));
  stage.innerHTML = `
    <div class="battle-setup">
      <div class="pick-timer-row">
        <span class="pick-timer-label">${t("pvp_pick_timer")}</span>
        <span class="pick-timer" id="pickTimer">${left}s</span>
      </div>
      <div class="battle-setup-title">${t("pvp_pick_deploy")} <span style="color:var(--gold)">(${PVP_PICK.picks.length}/${need})</span></div>
      <div class="pick-hint">${t("pvp_pick_hint")}</div>
      <div class="battle-pick-grid">
        ${PVP_PICK.pool.map(id => {
          const p = getPoke(id); if (!p) return "";
          const sel = PVP_PICK.picks.includes(parseInt(id));
          const order = PVP_PICK.picks.indexOf(parseInt(id));
          const role = order < 0 ? "" : (order < 2 ? t("role_active") : t("role_bench"));
          return `<div class="battle-pick${sel ? " sel" : ""}" onclick="togglePickDeploy(${p.id})">
            ${sel ? `<div class="pick-badge">${order + 1}</div>` : ""}
            ${sel ? `<div class="pick-role">${role}</div>` : ""}
            <img class="sprite" src="${spriteStatic(p.id)}" width="56" height="56" loading="lazy">
            <div class="pick-name">${p.name}</div>
          </div>`;
        }).join("")}
      </div>
    </div>`;
  controls.innerHTML = `
    <button class="battle-start-btn" ${PVP_PICK.picks.length < need ? "disabled" : ""} onclick="submitPicks()">
      ${PVP_PICK.picks.length < need ? t("pvp_pick_more", { n: need - PVP_PICK.picks.length }) : t("pvp_confirm_picks")}
    </button>
    <button class="battle-cancel-btn" onclick="forfeitPvp()">${svgIcon("back","currentColor",13)} ${t("pvp_forfeit")}</button>`;
}

function togglePickDeploy(id) {
  if (PVP_PICK.submitted) return;
  id = parseInt(id);
  const i = PVP_PICK.picks.indexOf(id);
  if (i >= 0) PVP_PICK.picks.splice(i, 1);
  else { if (PVP_PICK.picks.length >= 4) { toast(t("pvp_max_four")); return; } PVP_PICK.picks.push(id); }
  renderPickPhase();
}

// Submit my picks privately. The opponent never sees them.
async function submitPicks() {
  if (PVP_PICK.submitted) return;
  PVP_PICK.submitted = true;
  if (PVP_PICK.timer) { clearInterval(PVP_PICK.timer); PVP_PICK.timer = null; }

  // Show a "waiting for opponent" veil (hides any pick info).
  document.getElementById("battleStage").innerHTML =
    `<div class="battle-setup"><div class="battle-setup-title">${t("pvp_waiting_pick")}</div>
     <div style="text-align:center;margin-top:20px">${svgIcon("hourglass","var(--gold)",34)}</div></div>`;
  document.getElementById("battleControls").innerHTML =
    `<button class="battle-cancel-btn" onclick="forfeitPvp()">${svgIcon("back","currentColor",13)} ${t("pvp_forfeit")}</button>`;

  try {
    const { data, error } = await sb.functions.invoke("submit-picks", {
      body: { matchId: PVP.matchId, picks: PVP_PICK.picks },
    });
    if (error || !data || !data.ok) { pushPvpLog(t("pvp_error")); return; }
    if (data.started) {
      // Both picked already (or we triggered the build) → battle is ready.
      enterMatch(PVP.matchId, PVP.mySide);
    } else {
      // data.waiting → normally the Realtime UPDATE (status→active) triggers enterMatch.
      // Safety net: in case both clients raced and each saw the other as "not yet
      // picked" (read-after-write lag), neither built the battle. Re-call submit-picks
      // a couple of times so one of them re-reads with both picks present and builds it.
      startPickWaitWatchdog();
    }
  } catch (e) {
    pushPvpLog(t("pvp_error"));
  }
}

// Watchdog for the picking "waiting" state: re-checks the match and, if it's somehow
// still in 'picking' after both players confirmed, re-submits to force the build.
function startPickWaitWatchdog() {
  if (PVP._pickWatchdog) clearInterval(PVP._pickWatchdog);
  let tries = 0;
  PVP._pickWatchdog = setInterval(async () => {
    // Stop once we've entered battle, left, or the match changed.
    if (_pvpEntered || PVP.over || !PVP.matchId) { clearInterval(PVP._pickWatchdog); PVP._pickWatchdog = null; return; }
    tries++;
    try {
      const { data: m } = await sb.from("matches").select("id,status,state").eq("id", PVP.matchId).single();
      if (m && m.status === "active" && m.state) {
        clearInterval(PVP._pickWatchdog); PVP._pickWatchdog = null;
        enterMatch(PVP.matchId, PVP.mySide);
        return;
      }
      if (m && m.status === "picking") {
        // Still picking — re-submit my picks so the server re-evaluates "both picked"
        // (closes the rare deadlock where both initial submits missed each other).
        await sb.functions.invoke("submit-picks", { body: { matchId: PVP.matchId, picks: PVP_PICK.picks } });
      }
    } catch (e) {}
    if (tries >= 6) { clearInterval(PVP._pickWatchdog); PVP._pickWatchdog = null; }
  }, 1500);
}

// If we're waiting in queue, an opponent calling find-match will create a match with
// us as player_a. Listen for that insert via Realtime.
function waitForMatchAsPlayerA() {
  let resolved = false;
  const enter = (m) => {
    if (resolved || !m || !PVP.searching) return;
    resolved = true;
    PVP.searching = false;
    if (PVP._pollTimer) { clearInterval(PVP._pollTimer); PVP._pollTimer = null; }
    try { sb.removeChannel(ch); } catch (e) {}
    showMatchFoundThen(m.id, "a");
  };

  // 1. Realtime: listen for a match where I'm player_a.
  const ch = sb.channel("waiting-" + currentUser.id)
    .on("postgres_changes",
      { event: "INSERT", schema: "public", table: "matches", filter: `player_a=eq.${currentUser.id}` },
      (payload) => enter(payload.new))
    .subscribe(async (status) => {
      // 2. Once subscribed, do an immediate CATCH-UP query: a match may have been
      // created in the gap between joining the queue and this subscription going live.
      if (status === "SUBSCRIBED") await catchUpMatch(enter);
    });
  PVP._waitChannel = ch;

  // 3. Polling fallback: every 2.5s, check for a match directly. This guarantees we
  // find the match even if the Realtime INSERT event was missed for any reason.
  if (PVP._pollTimer) clearInterval(PVP._pollTimer);
  PVP._pollTimer = setInterval(() => {
    if (!PVP.searching) { clearInterval(PVP._pollTimer); PVP._pollTimer = null; return; }
    catchUpMatch(enter);
  }, 2500);
}

// Look for an existing match where I'm player_a and the battle hasn't ended.
async function catchUpMatch(enter) {
  try {
    const since = new Date(PVP._searchStartedAt || Date.now()).toISOString();
    const { data, error } = await sb
      .from("matches")
      .select("id, status, created_at")
      .eq("player_a", currentUser.id)
      .in("status", ["picking", "active"])
      .gte("created_at", since)               // only matches from THIS search session
      .order("created_at", { ascending: false })
      .limit(1);
    if (!error && data && data.length) enter(data[0]);
  } catch (e) {}
}

// ---- Match Found popup, then enter ----
// names: { a, b } usernames from the match row (player_a / player_b).
async function showMatchFoundThen(matchId, side, names) {
  PVP.searching = false;
  if (PVP._waitChannel) { try { sb.removeChannel(PVP._waitChannel); } catch (e) {} PVP._waitChannel = null; }

  // Resolve both usernames. If not passed in (e.g. the waiting player), read them
  // off the match row, which find-match stamped with name_a / name_b.
  let nameA = names && names.a, nameB = names && names.b;
  if ((!nameA || !nameB) && typeof sb !== "undefined") {
    try {
      const { data } = await sb.from("matches").select("name_a,name_b").eq("id", matchId).single();
      if (data) { nameA = nameA || data.name_a; nameB = nameB || data.name_b; }
    } catch (e) {}
  }
  // My name vs the opponent's, oriented to MY side.
  const myName = side === "a" ? nameA : nameB;
  const foeName = side === "a" ? nameB : nameA;

  const overlay = document.getElementById("matchFoundPopup");
  if (overlay) {
    const left = document.getElementById("mfNameLeft");
    const right = document.getElementById("mfNameRight");
    if (left) left.textContent = myName || t("you") || "You";
    if (right) right.textContent = foeName || t("opponent") || "Opponent";
    const vs = document.getElementById("mfVs");
    if (vs) vs.textContent = t("match_vs");
    overlay.classList.remove("play");
    overlay.classList.add("open");
    // Force reflow so removing/adding .play restarts the animation cleanly.
    void overlay.offsetWidth;
    overlay.classList.add("play");
    setTimeout(() => {
      overlay.classList.remove("open");
      overlay.classList.remove("play");
      enterPickingPhase(matchId, side);
    }, 2400);
  } else {
    enterPickingPhase(matchId, side);
  }
}

// ---- Enter a match: load state, subscribe to updates, render ----
let _pvpEntered = false;
async function enterMatch(matchId, side) {
  if (_pvpEntered && PVP.matchId === matchId) return; // guard against double-entry (HTTP + Realtime)
  PVP.matchId = matchId;
  PVP.mySide = side;
  PVP.foeSide = side === "a" ? "b" : "a";
  PVP.over = false;
  PVP.awaitingResolve = false;
  PVP.pendingActions = [];
  // Clear transient per-match flags so a previous match's state can't leak in.
  PVP._lastReplaceSig = null;
  PVP._waitingForOpponentReplace = false;
  if (PVP._replaceWatch) { clearInterval(PVP._replaceWatch); PVP._replaceWatch = null; }
  PVP._targeting = null;
  PVP._animating = false;

  // Load the authoritative match row.
  const { data: m, error } = await sb.from("matches").select("*").eq("id", matchId).single();
  if (error || !m) { renderSearching(t("pvp_error")); return; }
  if (m.status === "picking" || !m.state) return; // battle not built yet; wait for Realtime
  _pvpEntered = true;

  // Stop the picking countdown / watchdog if still running.
  if (PVP_PICK.timer) { clearInterval(PVP_PICK.timer); PVP_PICK.timer = null; }
  if (PVP._pickWatchdog) { clearInterval(PVP._pickWatchdog); PVP._pickWatchdog = null; }

  PVP.state = m.state;
  PVP.turnNumber = m.turn_number;
  PVP.seed = m.seed;

  // Ensure we're subscribed (we already subscribed during picking, but safe to re-affirm).
  subscribeToMatch(matchId);

  renderPvpStage();
  promptPvpMove();   // opens the move picker (battle log shows once a turn resolves)
}

// Explicit forfeit during a live match (picking or battle): tell the server I concede,
// then clean up. The opponent will see the finish via Realtime/poll.
async function forfeitPvp() {
  if (PVP.matchId && !PVP.over) {
    try { await sb.functions.invoke("forfeit", { body: { matchId: PVP.matchId, mode: "concede" } }); } catch (e) {}
  }
  quitPvp();
}

function subscribeToMatch(matchId) {
  if (PVP.channel) { try { sb.removeChannel(PVP.channel); } catch (e) {} PVP.channel = null; }

  let attempts = 0;
  const open = () => {
    PVP.channel = sb.channel("match-" + matchId + "-" + Date.now())
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${matchId}` },
        (payload) => onMatchUpdate(payload.new))
      .subscribe((status) => {
        // If the channel errors or times out, retry a few times with a fresh channel.
        if ((status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") && attempts < 3) {
          attempts++;
          try { sb.removeChannel(PVP.channel); } catch (e) {}
          setTimeout(open, 600 * attempts);
        }
      });
  };
  open();

  // Polling fallback: regardless of Realtime health, poll the match row so a client
  // whose subscription is silently dead still advances (picking->active, turns, replaces).
  startMatchPoll(matchId);

  // Heartbeat: stamp liveness every 5s and watch the opponent's heartbeat.
  startHeartbeat(matchId);
}

// Backstop for the "waiting for opponent to send in" state: if a Realtime/poll
// update is ever missed, this re-reads the match and releases me as soon as the
// opponent's replacement is in (no more outstanding need on their side), so the
// battle can never get permanently stuck waiting for a send-in.
function startReplaceWatchdog() {
  if (PVP._replaceWatch) clearInterval(PVP._replaceWatch);
  PVP._replaceWatch = setInterval(async () => {
    if (!PVP._waitingForOpponentReplace || PVP.over || !PVP.matchId) {
      clearInterval(PVP._replaceWatch); PVP._replaceWatch = null; return;
    }
    if (PVP._animating) return; // let any in-progress animation settle first
    try {
      const { data: m } = await sb.from("matches").select("turn_number,status,state,pending,last_log,winner").eq("id", PVP.matchId).single();
      if (!m) return;
      // A new turn or a finish supersedes the wait — let onMatchUpdate handle it.
      if (m.turn_number > PVP.turnNumber || m.status === "finished") { onMatchUpdate(m); return; }
      const need = (m.pending && m.pending.needReplace) || { a: [], b: [] };
      const myNeed = (need[PVP.mySide] || []);
      const theirNeed = (need[PVP.foeSide] || []);
      if (myNeed.length) {
        // It's actually MY replacement that's outstanding — show the picker.
        clearInterval(PVP._replaceWatch); PVP._replaceWatch = null;
        PVP._waitingForOpponentReplace = false;
        if (m.state) PVP.state = m.state;
        renderPvpStage();
        promptReplacement(myNeed);
      } else if (!theirNeed.length) {
        // Opponent has finished sending in — release me to move.
        clearInterval(PVP._replaceWatch); PVP._replaceWatch = null;
        PVP._waitingForOpponentReplace = false;
        if (m.state) PVP.state = m.state;
        renderPvpStage();
        promptPvpMove();
      }
    } catch (e) {}
  }, 2000);
}

// ---- Heartbeat / disconnect detection ----
function startHeartbeat(matchId) {
  if (PVP._heartbeat) clearInterval(PVP._heartbeat);
  PVP._claimingDisconnect = false;
  // Capture the access token once for the tab-close beacon (sendBeacon can't read it live).
  try { sb.auth.getSession().then(r => { PVP._accessToken = r?.data?.session?.access_token || null; }); } catch (e) {}
  const beat = async () => {
    if (PVP.over || PVP.matchId !== matchId) { clearInterval(PVP._heartbeat); PVP._heartbeat = null; return; }
    try {
      const { data, error } = await sb.functions.invoke("forfeit", { body: { matchId, mode: "ping" } });
      if (error || !data || !data.ok) return;
      if (data.status === "finished") return; // match ended elsewhere; onMatchUpdate handles it
      // Is my opponent's heartbeat stale (>20s)? If so, claim the win by disconnect.
      const foeSeen = data.foeLastSeen ? new Date(data.foeLastSeen).getTime() : 0;
      // Only claim if the opponent has stamped at least once AND it's now stale — this
      // avoids false-claiming at the very start before they've had a chance to ping.
      if (foeSeen && (Date.now() - foeSeen) > 20000 && !PVP._claimingDisconnect) {
        PVP._claimingDisconnect = true;
        const res = await sb.functions.invoke("forfeit", { body: { matchId, mode: "claim" } });
        if (res?.data?.ok && res.data.finished) {
          // I won by disconnect; the match row update will flow through onMatchUpdate.
        } else {
          PVP._claimingDisconnect = false; // claim rejected (opponent alive) — keep playing
        }
      }
    } catch (e) {}
  };
  beat(); // immediate first stamp
  PVP._heartbeat = setInterval(beat, 5000);

  // Tab-close forfeit: best-effort beacon as the page unloads. The heartbeat is the
  // guarantee — if this beacon doesn't make it, the opponent detects the stale
  // heartbeat within ~20s and claims the win anyway.
  registerCloseForfeit(matchId);
}

function registerCloseForfeit(matchId) {
  if (PVP._closeHandler) window.removeEventListener("pagehide", PVP._closeHandler);
  PVP._closeHandler = () => {
    if (PVP.over || PVP.matchId !== matchId) return;
    try {
      const token = PVP._accessToken;
      const url = SUPABASE_URL + "/functions/v1/forfeit";
      const payload = JSON.stringify({ matchId, mode: "close", accessToken: token });
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    } catch (e) {}
  };
  window.addEventListener("pagehide", PVP._closeHandler);
}

// Poll the match row every 2s and feed it through onMatchUpdate, which is idempotent
// (guards on turn_number / status / _pvpEntered, so re-processing the same row is safe).
function startMatchPoll(matchId) {
  if (PVP._matchPoll) clearInterval(PVP._matchPoll);
  PVP._matchPoll = setInterval(async () => {
    if (PVP.over || PVP.matchId !== matchId) { clearInterval(PVP._matchPoll); PVP._matchPoll = null; return; }
    try {
      const { data, error } = await sb.from("matches").select("*").eq("id", matchId).single();
      if (!error && data) onMatchUpdate(data);
    } catch (e) {}
  }, 2000);
}

// ---- Realtime: a match row changed (opponent submitted, or turn resolved) ----
function onMatchUpdate(m) {
  if (!m || m.id !== PVP.matchId) return;
  if (PVP.over) return; // battle already concluded; ignore late updates

  const finished = m.status === "finished";

  // A new turn resolved (server's turn_number advanced past ours). Animate it —
  // if this same update also marks the match finished, the animation ends in endPvp,
  // so the final KO plays out before the result shows.
  if (m.turn_number > PVP.turnNumber) {
    PVP.turnNumber = m.turn_number;
    PVP.awaitingResolve = false;
    // A new turn invalidates any prior replacement signature — this turn's
    // send-ins must be processed fresh (otherwise an identical-looking send-in
    // from a later turn gets skipped and the waiting player is stuck forever).
    PVP._lastReplaceSig = null;
    const newState = m.state;
    const log = m.last_log || [];
    const needReplace = (m.pending && m.pending.needReplace) || { a: [], b: [] };
    animatePvpTurn(newState, log, finished, m.winner, needReplace);
    return;
  }

  // Match ended with NO new turn to animate (forfeit, disconnect, timeout, or a
  // finish we've already animated past). Show the result directly, once — but not
  // while a turn is still animating; that playback ends the battle itself.
  if (finished) {
    if (PVP._animating) return; // the in-progress animation will call endPvp
    PVP.state = (m.state && m.state.a && m.state.b) ? m.state : PVP.state;
    endPvp(m.winner, m.end_reason);
    return;
  }

  // Picking phase just completed → battle built → enter it.
  if (m.status === "active" && !_pvpEntered) {
    enterMatch(m.id, PVP.mySide);
    return;
  }

  // A faint-replacement happened (same turn_number, but a Pokémon was sent in).
  // This is usually the OPPONENT sending in their new active Pokémon — sync our view
  // so it appears on the field and becomes targetable. Don't disturb my own input if
  // I'm the one who still needs to replace.
  const lastLog = m.last_log || [];
  const isReplacement = lastLog.length && lastLog.every(e => e.t === "sendin");
  if (isReplacement && m.state && m.state.a && m.state.b) {
    // Don't process a replacement update while a turn is still animating — let the
    // animation finish (it ends by prompting/waiting based on needReplace itself).
    if (PVP._animating) return;
    // Idempotency: polling may deliver the same replacement row repeatedly. Build a
    // signature and skip if we've already processed this exact replacement.
    const sig = JSON.stringify(lastLog) + "|" + (m.pending ? JSON.stringify(m.pending.needReplace) : "");
    if (PVP._lastReplaceSig === sig) return;
    PVP._lastReplaceSig = sig;

    PVP.state = m.state;
    const myNeed = (m.pending && m.pending.needReplace && m.pending.needReplace[PVP.mySide]) || [];
    // Re-render the battlefield with the updated state (the new mon now shows).
    renderPvpStage();
    if (myNeed.length) {
      // I still owe a replacement — go straight to the bench picker.
      PVP._waitingForOpponentReplace = false;
      if (PVP._replaceWatch) { clearInterval(PVP._replaceWatch); PVP._replaceWatch = null; }
      promptReplacement(myNeed);
    } else if (PVP._waitingForOpponentReplace && !PVP.awaitingResolve && !PVP._targeting && !PVP.over) {
      // I was waiting for the opponent to send in, and they have — now it's my move.
      PVP._waitingForOpponentReplace = false;
      if (PVP._replaceWatch) { clearInterval(PVP._replaceWatch); PVP._replaceWatch = null; }
      promptPvpMove();
    }
    return;
  }
}

// ---- Rendering (per-perspective: near = my side, far = foe) ----
function renderPvpStage(keepVisibleNames) {
  if (!PVP.state || !PVP.state.a || !PVP.state.b) return; // nothing to render yet
  let u = 0;
  [...PVP.state.a, ...PVP.state.b].forEach(b => { if (b) b._uid = u++; });
  const keep = keepVisibleNames instanceof Set ? keepVisibleNames : null;
  // Show Pokémon still in the fight. During a turn animation we also keep any
  // battler that faints THIS turn so its faint-fade can play before removal.
  const show = b => b && (!b.fainted || (keep && keep.has(b.name)));
  const near = pvpNear().filter(show);
  const far  = pvpFar().filter(show);
  const stage = document.getElementById("battleStage");
  stage.innerHTML = `
    <div class="battlefield">
      <div class="field-row foes">
        <div class="field-plates">${far.map(b => hpPlate(b, "foe")).join("")}</div>
        <div class="field-mons">${far.map(b => battlerSprite(b, "foe")).join("")}</div>
      </div>
      <div class="field-row allies">
        <div class="field-mons">${near.map(b => battlerSprite(b, "player")).join("")}</div>
        <div class="field-plates">${near.map(b => hpPlate(b, "player")).join("")}</div>
      </div>
    </div>`;
}

function pushPvpLog(text, fresh) {
  const log = document.getElementById("battleLog");
  if (!log) return;
  // `fresh` starts a NEW action's log: clear the box so only the current
  // Pokémon's action shows (it doesn't merge with the previous one).
  if (fresh) log.innerHTML = "";
  const div = document.createElement("div");
  div.className = "log-line";
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

// ---- Bottom-box mode toggle: move picker vs. battle log -------------------
// The picker (move buttons / prompts) and the log share one container. Show the
// log only while a resolved turn animates; otherwise show the picker.
function showBattleLog(clear) {
  const bottom = document.getElementById("battleBottom");
  if (bottom) bottom.classList.add("show-log");
  if (clear) { const log = document.getElementById("battleLog"); if (log) log.innerHTML = ""; }
}
function showBattlePicker() {
  const bottom = document.getElementById("battleBottom");
  if (bottom) bottom.classList.remove("show-log");
}

function renderSearching(msg) {
  document.getElementById("battleStage").innerHTML =
    `<div class="battle-setup"><div class="battle-setup-title">${msg}</div>
     <div style="text-align:center;margin-top:20px">${svgIcon("search","var(--gold)",34)}</div></div>`;
  document.getElementById("battleLog").innerHTML = "";
  document.getElementById("battleControls").innerHTML =
    `<button class="battle-cancel-btn" onclick="quitPvp()">${svgIcon("back","currentColor",13)} ${t("cancel")}</button>`;
}

// ---- My move selection (only for MY living Pokémon) ----
function promptPvpMove() {
  if (PVP.over) return;
  showBattlePicker();        // turn over — show the move picker again
  PVP.pendingActions = [];
  promptPvpActor(0);
}

// Detect a B2 forced-action lock on my active Pokémon. Returns null if free to choose.
// The engine is authoritative and overrides the submitted move; the client just shows
// the right banner and submits a valid known key so the turn can resolve.
function pvpLockInfo(actor) {
  if (!actor) return null;
  const firstFoe = pvpFar().findIndex(b => b && !b.fainted);
  const targetIdx = firstFoe >= 0 ? firstFoe : 0;
  const knownFirst = (actor.moves[0] && (actor.moves[0].key || actor.moves[0])) || "tackle";
  const moveName = (k) => (moveData(k) || {}).name || k;
  if (actor._trapped && actor._trapped.turns > 0) {
    return { text: t("pvp_locked_trapped", { who: actor.name }), forcedKey: knownFirst, targetIdx };
  }
  if (actor._bide && actor._bide.turns > 0) {
    const k = (actor.moves.find(m => { const md = moveData(m.key || m); return md && md.effect === "bide"; }) || {}).key || knownFirst;
    return { text: t("pvp_locked_bide", { who: actor.name }), forcedKey: k, targetIdx };
  }
  if (actor._charging) {
    return { text: t("pvp_locked_charge", { who: actor.name, move: moveName(actor._charging.moveKey) }), forcedKey: actor._charging.moveKey, targetIdx };
  }
  if (actor._lockMove && actor._lockMove.turns > 0) {
    return { text: t("pvp_locked_move", { who: actor.name, move: moveName(actor._lockMove.moveKey) }), forcedKey: actor._lockMove.moveKey, targetIdx };
  }
  return null;
}

function promptPvpActor(actorIdx) {
  const near = pvpNear();
  while (actorIdx < near.length && (!near[actorIdx] || near[actorIdx].fainted)) actorIdx++;
  if (actorIdx >= near.length) { submitPvpTurn(); return; }

  const actor = near[actorIdx];
  clearActiveActor();
  const activeMon = document.getElementById("fieldmon-" + actor._uid);
  if (activeMon) activeMon.classList.add("active-actor");

  const controls = document.getElementById("battleControls");

  // ---- Locked states (B2): the engine forces this Pokémon's action this turn. ----
  const lock = pvpLockInfo(actor);
  if (lock) {
    controls.innerHTML = `
      <div class="move-prompt pvp-locked">${lock.text}</div>
      <button class="battle-move-btn pvp-continue" onclick="commitPvpMove(${actorIdx}, '${lock.forcedKey}', '${PVP.foeSide}', ${lock.targetIdx})">
        <span class="bmb-name">${t("pvp_continue")}</span>
      </button>
      <button class="battle-forfeit-link" onclick="confirmForfeitPvp()">${t("pvp_forfeit")}</button>`;
    PVP._curActor = actorIdx;
    return;
  }

  const bench = pvpBench();
  const canSwitch = bench.some(b => b && !b.fainted);
  controls.innerHTML = `
    <div class="move-prompt">${t("choose_move_for")} <b>${actor.name}</b></div>
    <div class="move-buttons">
      ${actor.moves.map(m => {
        const md = moveData(m.key) || m;
        const col = TC[md.type] || "#888";
        return `<button class="battle-move-btn" style="border-color:${col}" onclick="choosePvpMove(${actorIdx}, '${m.key}')">
          <span class="bmb-name">${md.name}</span>
          <span class="bmb-meta"><span class="tbadge" style="background:${col};font-size:8px">${md.type}</span> ${md.power > 0 ? "P" + md.power : "—"}</span>
        </button>`;
      }).join("")}
    </div>
    ${canSwitch ? `<button class="battle-switch-btn" onclick="choosePvpSwitch(${actorIdx})">${svgIcon("loop","currentColor",14)} ${t("pvp_switch")}</button>` : ""}
    <button class="battle-forfeit-link" onclick="confirmForfeitPvp()">${t("pvp_forfeit")}</button>`;
  PVP._curActor = actorIdx;
}

// Two-tap confirm so a misclick doesn't throw the match.
function confirmForfeitPvp() {
  const btn = document.querySelector(".battle-forfeit-link");
  if (!btn) { forfeitPvp(); return; }
  if (btn.dataset.confirm === "1") { forfeitPvp(); return; }
  btn.dataset.confirm = "1";
  btn.textContent = t("pvp_forfeit_confirm");
  setTimeout(() => { if (btn) { btn.dataset.confirm = ""; btn.textContent = t("pvp_forfeit"); } }, 3000);
}

// Choose to switch this active Pokémon out: pick a living bench Pokémon to send in.
function choosePvpSwitch(actorIdx) {
  const bench = pvpBench();
  const options = bench.map((b, i) => ({ b, i })).filter(o => o.b && !o.b.fainted);
  if (!options.length) { toast(t("pvp_no_bench")); return; }
  const controls = document.getElementById("battleControls");
  controls.innerHTML = `
    <div class="move-prompt">${t("pvp_switch_to")}</div>
    <div class="move-buttons">
      ${options.map(o => `<button class="battle-move-btn" onclick="commitPvpSwitch(${actorIdx}, ${o.i})">
        <span class="bmb-name">${o.b.name}</span>
        <span class="bmb-meta">HP ${o.b.hp}/${o.b.maxHp}</span>
      </button>`).join("")}
    </div>
    <button class="battle-cancel-btn" onclick="promptPvpActor(${actorIdx})">${svgIcon("back","currentColor",13)} ${t("cancel")}</button>`;
}

function commitPvpSwitch(actorIdx, benchIdx) {
  PVP.pendingActions.push({ type: "switch", side: PVP.mySide, actorIdx, benchIdx });
  promptPvpActor(actorIdx + 1);
}

// Status-move effects that act on the USER or its own side — these need no target
// prompt (we auto-target the user's own slot). Everything else that's a status move
// (Disable, String Shot, Thunder Wave, Sleep Powder, Growl, etc.) targets a FOE.
const SELF_STATUS_EFFECTS = new Set([
  "atk_up", "atk_up2", "def_up", "def_up2", "spd_up2", "spdef_up2", "atk_spatk_up",
  "crit_up", "evasion_up", "evasion_up2", "heal50", "rest", "reflect", "lightscreen",
  "mist", "haze", "substitute", "conversion", "transform", "noop", "recharge",
  "bide", "counter", "mimic", "metronome", "mirror",
]);

// Returns 'self' (acts on the user — no target needed) or 'foe' (needs a foe target).
function moveTargetKind(md) {
  if (!md) return "foe";
  const effs = Array.isArray(md.effect) ? md.effect : [md.effect];
  // Damaging moves always target a foe.
  if (md.power > 0) return "foe";
  // Among 0-power moves: self/own-side buffs are 'self'; the rest hit a foe.
  if (effs.some(e => e && SELF_STATUS_EFFECTS.has(e))) return "self";
  return "foe";
}

function choosePvpMove(actorIdx, moveKey) {
  const md = moveData(moveKey) || {};
  const kind = moveTargetKind(md);

  // Self / own-side moves (buffs, heals, screens) auto-target the user's own slot.
  if (kind === "self") {
    commitPvpMove(actorIdx, moveKey, PVP.mySide, actorIdx);
    return;
  }

  // Foe-targeting moves (damage AND status like Disable/String Shot/Thunder Wave):
  // gather living foes; if only one, auto-target it, otherwise prompt for which foe.
  const foes = [];
  pvpFar().forEach((b, i) => { if (b && !b.fainted) foes.push({ side: PVP.foeSide, idx: i, b, kind: "foe" }); });
  if (!foes.length) { commitPvpMove(actorIdx, moveKey, PVP.foeSide, 0); return; } // safety
  if (foes.length === 1) { commitPvpMove(actorIdx, moveKey, foes[0].side, foes[0].idx); return; }
  enterPvpTargetMode(actorIdx, moveKey, foes);
}

function enterPvpTargetMode(actorIdx, moveKey, targets) {
  PVP._targeting = { actorIdx, moveKey };
  const md = moveData(moveKey) || {};
  targets.forEach(tg => {
    const mon = document.getElementById("fieldmon-" + tg.b._uid);
    if (mon) { mon.classList.add("targetable"); mon.onclick = () => pickPvpTarget(tg.side, tg.idx); }
  });
  const controls = document.getElementById("battleControls");
  controls.innerHTML = `
    <div class="move-prompt">${t("tap_target")} <b>${md.name}</b></div>
    <div class="move-buttons">
      ${targets.map(tg => `<button class="battle-move-btn target-btn glow ${tg.kind}" onclick="pickPvpTarget('${tg.side}', ${tg.idx})">
        <span class="bmb-name">${tg.b.name}</span>
        <span class="bmb-meta">${tg.kind === "ally" ? t("tgt_ally") : t("tgt_foe")} · HP ${tg.b.hp}/${tg.b.maxHp}</span>
      </button>`).join("")}
    </div>
    <button class="battle-cancel-btn" onclick="promptPvpActor(${actorIdx})">${svgIcon("back","currentColor",13)} ${t("cancel")}</button>`;
}

function pickPvpTarget(side, idx) {
  if (!PVP._targeting) return;
  const { actorIdx, moveKey } = PVP._targeting;
  PVP._targeting = null;
  document.querySelectorAll(".field-mon.targetable").forEach(el => { el.classList.remove("targetable"); el.onclick = null; });
  commitPvpMove(actorIdx, moveKey, side, idx);
}

function commitPvpMove(actorIdx, moveKey, targetSide, targetIdx) {
  // Action uses MY canonical side.
  PVP.pendingActions.push({ side: PVP.mySide, actorIdx, moveKey, targetSide, targetIdx });
  promptPvpActor(actorIdx + 1);
}

// ---- Submit my actions to the authoritative referee ----
async function submitPvpTurn() {
  clearActiveActor();
  PVP.awaitingResolve = true;
  document.getElementById("battleControls").innerHTML =
    `<div class="move-prompt">${t("pvp_waiting_opponent")}</div>`;

  try {
    const { data, error } = await sb.functions.invoke("pvp-turn", {
      body: { matchId: PVP.matchId, actions: PVP.pendingActions },
    });
    if (error || !data || !data.ok) {
      pushPvpLog(t("pvp_error"));
      PVP.awaitingResolve = false;
      promptPvpMove();
      return;
    }
    // If the server resolved immediately (opponent already had actions in), animate now.
    // Otherwise we wait for the Realtime UPDATE to deliver the resolved turn.
    if (data.resolved) {
      // The Realtime UPDATE will also fire; guard against double-animation via turnNumber.
      if (data.turnNumber > PVP.turnNumber) {
        PVP.turnNumber = data.turnNumber;
        PVP.awaitingResolve = false;
        animatePvpTurn(data.state, data.log, data.over, data.winner, data.needReplace);
      }
    }
    // if !data.resolved → waiting for opponent; Realtime onMatchUpdate handles it.
  } catch (e) {
    pushPvpLog(t("pvp_error"));
    PVP.awaitingResolve = false;
    promptPvpMove();
  }
}

// ---- Animate a resolved turn (server log) from my perspective ----
function animatePvpTurn(newState, log, finished, winner, needReplace) {
  PVP.state = newState;
  PVP._animating = true;   // block finish-updates from preempting this playback
  const events = (log || []).slice();
  // Both players have picked — flip the bottom box from the move picker to the
  // battle log, which now fills line-by-line in sync with the attack animations.
  showBattleLog(true);
  // Battlers that faint this turn should start visible, then fade on their event.
  const faintNames = new Set(events.filter(e => e.t === "faint").map(e => e.who));

  // ---- HP drain setup ----
  // The state we render is POST-turn (final HP). To animate bars draining hit by
  // hit, reconstruct each battler's PRE-turn HP by reversing the log's HP deltas,
  // then track a running "display HP" we step forward as events play.
  const all = [...(newState.a || []), ...(newState.b || []), ...(newState.benchA || []), ...(newState.benchB || [])].filter(Boolean);
  const byName = {};
  all.forEach(b => { byName[b.name] = b; b._displayHp = b.hp; });
  // Walk the log to find total delta per battler, then set start = final - delta.
  const delta = {};
  for (const e of events) {
    if (!e.who) continue;
    // Substitute-absorbed hits (sub:1) don't reduce the Pokémon's real HP.
    if (e.t === "damage" && !e.sub) delta[e.who] = (delta[e.who] || 0) - (e.amt || 0);
    else if (e.t === "heal") delta[e.who] = (delta[e.who] || 0) + (e.amt || 0);
    else if (e.t === "recoil" || e.t === "residual") delta[e.who] = (delta[e.who] || 0) - (e.amt || 0);
  }
  for (const name in byName) {
    const b = byName[name];
    const d = delta[name] || 0;
    // start = final - d, clamped to [0, max]. (final = b.hp already.)
    b._displayHp = Math.max(0, Math.min(b.maxHp, b.hp - d));
  }

  // Render the post-turn lineup once up front (keeping this-turn faints visible).
  // This assigns each battler a _uid and creates the field-mon / hp-plate DOM
  // elements the animations target; without it, fieldMonByName() can't resolve
  // elements and nothing animates.
  renderPvpStage(faintNames);
  // Paint every HP bar at its PRE-turn value so the first hit visibly drains it.
  [...(PVP.state.a || []), ...(PVP.state.b || [])].forEach(b => { if (b) paintHpBar(b, b._displayHp); });
  // Battlers that faint this turn render with the 'fainted' class (post-turn state),
  // which would hide them immediately. Strip it so they appear alive now and fade
  // when their faint event fires.
  if (faintNames.size) {
    [...(PVP.state.a || []), ...(PVP.state.b || [])].forEach(b => {
      if (b && faintNames.has(b.name)) {
        const el = document.getElementById("fieldmon-" + b._uid);
        if (el) el.classList.remove("fainted");
      }
    });
  }
  let i = 0;
  const step = () => {
    // If the battle ended (e.g. a finished-match update arrived mid-animation),
    // stop animating — endPvp already showed the result; don't reflash the log.
    if (PVP.over) { PVP._animating = false; return; }
    if (i >= events.length) {
      PVP._animating = false;   // playback complete
      renderPvpStage();
      if (finished) { endPvp(winner); return; }
      // A1: if any of MY active slots fainted and I have bench, send in a replacement first.
      const mine = (needReplace && needReplace[PVP.mySide]) || [];
      const theirs = (needReplace && needReplace[PVP.foeSide]) || [];
      if (mine.length) { promptReplacement(mine); return; }
      // If the OPPONENT still owes a replacement, I must wait until they send in
      // (the turn cycle isn't complete). The Realtime replacement update releases me.
      if (theirs.length) {
        PVP._waitingForOpponentReplace = true;
        showBattlePicker();
        document.getElementById("battleControls").innerHTML =
          `<div class="move-prompt">${t("pvp_waiting_replace")}</div>`;
        startReplaceWatchdog();
        return;
      }
      promptPvpMove();
      return;
    }
    const e = events[i++];

    // Advance the running "display HP" for HP-changing events, so the bar
    // animates from its current value to the new one (CSS transition does the drain).
    if (e.who) {
      const tgt = [...(PVP.state.a || []), ...(PVP.state.b || [])].filter(Boolean).find(x => x.name === e.who);
      if (tgt && tgt._displayHp != null) {
        if ((e.t === "damage" && !e.sub) || e.t === "recoil" || e.t === "residual") tgt._displayHp = Math.max(0, tgt._displayHp - (e.amt || 0));
        else if (e.t === "heal") tgt._displayHp = Math.min(tgt.maxHp, tgt._displayHp + (e.amt || 0));
        else if (e.t === "faint") tgt._displayHp = 0;
      }
    }

    let delay = 650;
    if (e.t === "move") {
      // A new action begins — clear the box so this Pokémon's action shows alone,
      // then announce the move AS the attacker lunges/casts (same beat as the motion).
      // Give the lunge time to play and the line time to read before the hit lands.
      const cat = moveCategoryByName(e.move);
      const contact = cat !== "status";
      animateAttacker(e.who, contact);
      pushPvpLog(eventText(e), true);
      delay = contact ? 480 : 700;
    } else if (e.t === "damage") {
      // Follow-up of the current action — append under the move line. The damage
      // line lands the instant the hit connects (spark + flash). Hold long enough
      // for the HP-bar drain (~380ms) to visibly finish before the next event.
      updatePvpBattlerInPlace(e.who, true);
      spawnImpactSpark(e.who, { crit: !!e.crit, super: (e.eff > 1) });
      pushPvpLog(eventText(e));
      delay = e.crit ? 760 : 640;
    } else if (e.t === "faint") {
      // Make sure the HP bar is fully drained to 0 and let that animation finish,
      // THEN fade the sprite out — so the faint never happens before the bar empties.
      paintHpBar((PVP.state.a || []).concat(PVP.state.b || []).filter(Boolean).find(x => x.name === e.who) || {}, 0);
      pushPvpLog(eventText(e));
      const faintName = e.who;
      setTimeout(() => fadeFaint(faintName), 420); // wait for the bar drain, then fade
      delay = 1100;
    } else if (e.t === "heal" || e.t === "recoil" || e.t === "residual" || e.t === "status") {
      updatePvpBattlerInPlace(e.who, false);
      pushPvpLog(eventText(e));
      delay = 720;
    } else if (e.t === "miss" || e.t === "immune") {
      pushPvpLog(eventText(e));
      delay = 680;
    } else if (e.t === "stat") {
      // A buff/nerf landed — refresh the stat-stage badges under the HP bar and
      // pulse the changed one so it's noticeable.
      updatePvpBattlerInPlace(e.who, false);
      pulseStatBadge(e.who, e.stat, e.dir);
      pushPvpLog(eventText(e));
      delay = 720;
    } else if (e.t === "switch" || e.t === "sendin") {
      // A switch is its own action: 'switch' clears the box and the paired 'sendin'
      // appends under it. A lone 'sendin' (faint replacement) starts fresh.
      renderPvpStage();
      pushPvpLog(eventText(e), e.t === "switch");
      delay = 760;
    } else {
      // stat changes, msg events, etc. — append to the current action's log.
      pushPvpLog(eventText(e));
    }
    setTimeout(step, delay);
  };
  step();
}

// A1: prompt the player to send in a bench Pokémon for each fainted active slot.
function promptReplacement(slots) {
  const slot = slots[0]; // handle one slot at a time
  const bench = pvpBench();
  const options = bench.map((b, i) => ({ b, i })).filter(o => o.b && !o.b.fainted);
  if (!options.length) { promptPvpMove(); return; } // safety: nothing to send in
  showBattlePicker();        // surface the picker box for the replacement choice
  clearActiveActor();
  const controls = document.getElementById("battleControls");
  controls.innerHTML = `
    <div class="move-prompt">${t("pvp_fainted_replace")}</div>
    <div class="move-buttons">
      ${options.map(o => `<button class="battle-move-btn" onclick="commitReplacement(${slot}, ${o.i})">
        <span class="bmb-name">${o.b.name}</span>
        <span class="bmb-meta">HP ${o.b.hp}/${o.b.maxHp}</span>
      </button>`).join("")}
    </div>`;
}

async function commitReplacement(actorIdx, benchIdx) {
  showBattlePicker();
  document.getElementById("battleControls").innerHTML =
    `<div class="move-prompt">${t("pvp_sending_in")}</div>`;
  try {
    const { data, error } = await sb.functions.invoke("pvp-turn", {
      body: { matchId: PVP.matchId, replace: { actorIdx, benchIdx } },
    });
    if (error || !data || !data.ok) { pushPvpLog(t("pvp_error")); promptPvpMove(); return; }
    PVP.state = data.state;
    if (data.log) data.log.forEach(e => pushPvpLog(eventText(e)));
    renderPvpStage();
    // More slots still needing replacement on MY side?
    const mine = (data.needReplace && data.needReplace[PVP.mySide]) || [];
    if (mine.length) { promptReplacement(mine); return; }
    // If the OPPONENT still owes a replacement, wait for them before I move.
    const theirs = (data.needReplace && data.needReplace[PVP.foeSide]) || [];
    if (theirs.length) {
      PVP._waitingForOpponentReplace = true;
      showBattlePicker();
      document.getElementById("battleControls").innerHTML =
        `<div class="move-prompt">${t("pvp_waiting_replace")}</div>`;
      startReplaceWatchdog();
      return;
    }
    promptPvpMove();
  } catch (e) {
    pushPvpLog(t("pvp_error")); promptPvpMove();
  }
}

// Pulse the stat-stage badge that just changed, so a buff/nerf is noticeable.
function pulseStatBadge(name, stat, dir) {
  if (!PVP.state || !name) return;
  const all = [...(PVP.state.a || []), ...(PVP.state.b || [])].filter(Boolean);
  const b = all.find(x => x.name === name);
  if (!b) return;
  // Engine emits lowercase stat keys; map to the badge labels used in statStageBadges.
  const labelMap = { atk: "ATK", def: "DEF", spatk: "SpA", spdef: "SpD", spd: "SPE", acc: "ACC", eva: "EVA" };
  const label = labelMap[(stat || "").toLowerCase()];
  if (!label) return;
  const row = document.getElementById("statstages-" + b._uid);
  if (!row) return;
  const badge = Array.from(row.querySelectorAll(".stat-stage")).find(el => el.textContent.startsWith(label));
  if (badge) {
    badge.classList.remove("pulse");
    void badge.offsetWidth; // restart the animation
    badge.classList.add("pulse");
    setTimeout(() => badge.classList.remove("pulse"), 600);
  }
}

// Paint a battler's HP plate (bar width/color + text) to a specific HP value.
// CSS transition on .hp-bar animates the width change smoothly.
function paintHpBar(b, hp) {
  const plate = document.getElementById("hpplate-" + b._uid);
  if (!plate) return;
  const shown = Math.max(0, Math.min(b.maxHp, Math.round(hp)));
  const pct = Math.max(0, Math.round((shown / b.maxHp) * 100));
  const col = pct > 50 ? "#4ade80" : pct > 20 ? "#fbbf24" : "#ef4444";
  const bar = plate.querySelector(".hp-bar");
  const txt = plate.querySelector(".hp-text");
  if (bar) { bar.style.width = pct + "%"; bar.style.background = col; }
  if (txt) txt.textContent = shown + "/" + b.maxHp;
}

// Update a single battler's HP plate + flash in place (no full stage rebuild),
// so an in-progress attack lunge isn't interrupted.
function updatePvpBattlerInPlace(name, flash) {
  if (!PVP.state) return;
  const all = [...(PVP.state.a || []), ...(PVP.state.b || [])].filter(Boolean);
  const b = all.find(x => x.name === name);
  if (!b) return;
  const plate = document.getElementById("hpplate-" + b._uid);
  if (plate) {
    // Drain (or refill) the bar from its current display value to the post-event
    // value. We can't know the exact per-event running HP from here, so the caller
    // (the step loop) advances _displayHp; this just paints to it.
    paintHpBar(b, (b._displayHp != null) ? b._displayHp : b.hp);
    const top = plate.querySelector(".hp-plate-top");
    if (top) {
      const existing = top.querySelector(".status-tag");
      if (b.status && !existing) {
        const s = document.createElement("span");
        s.className = "status-tag " + b.status;
        s.textContent = b.status.toUpperCase();
        top.appendChild(s);
      } else if (b.status && existing) {
        existing.className = "status-tag " + b.status;
        existing.textContent = b.status.toUpperCase();
      } else if (!b.status && existing) {
        existing.remove();
      }
    }
    // Refresh the stat-stage badges (buffs/nerfs) under the HP bar.
    const stagesRow = plate.querySelector(".stat-stages");
    if (stagesRow && typeof statStageBadges === "function") {
      stagesRow.innerHTML = statStageBadges(b);
    }
  }
  const mon = document.getElementById("fieldmon-" + b._uid);
  if (mon && flash) { mon.classList.add("hit"); setTimeout(() => mon.classList.remove("hit"), 380); }
  // NOTE: we intentionally do NOT add the 'fainted' class here. The faint fade is
  // sequenced by the step loop (fadeFaint) AFTER the HP bar has drained to 0, so a
  // KO never visually happens before the bar empties.
}

// Fade a fainted Pokémon out, by name (called after its HP bar has drained to 0).
function fadeFaint(name) {
  if (!PVP.state) return;
  const b = [...(PVP.state.a || []), ...(PVP.state.b || [])].filter(Boolean).find(x => x.name === name);
  if (!b) return;
  const mon = document.getElementById("fieldmon-" + b._uid);
  if (mon) mon.classList.add("fainted");
}

// The battle log's `move` event carries the move's DISPLAY name, not its key,
// so resolve category by matching the name across the move table.
function moveCategoryByName(name) {
  if (!name || typeof MOVES === "undefined") return null;
  for (const k in MOVES) {
    const m = MOVES[k];
    if (m && m.name === name) return m.category;
  }
  return null;
}

// ---- Attack animations -----------------------------------------------------
// Find the on-field DOM element for a battler by its (unique) display name.
function fieldMonByName(name) {
  if (!PVP.state) return null;
  const all = [...(PVP.state.a || []), ...(PVP.state.b || [])].filter(Boolean);
  const b = all.find(x => x.name === name);
  if (!b) return null;
  return document.getElementById("fieldmon-" + b._uid);
}

// Is this battler on MY (near/player) side of the field?
function isNearName(name) {
  const near = pvpNear();
  return near.some(x => x && x.name === name);
}

// Lunge the attacker toward its target. `contact` true = physical lunge; false = cast pulse.
function animateAttacker(attackerName, contact) {
  const el = fieldMonByName(attackerName);
  if (!el) return;
  const cls = contact ? "attacking" : "casting";
  el.classList.remove("attacking", "casting");
  void el.offsetWidth; // restart animation if re-triggered
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), contact ? 440 : 520);
}

// Spawn a one-shot impact spark on the defender's sprite.
function spawnImpactSpark(defenderName, opts) {
  const el = fieldMonByName(defenderName);
  if (!el) return;
  const spark = document.createElement("div");
  spark.className = "impact-spark" + (opts && opts.crit ? " crit" : "") + (opts && opts.super ? " super" : "");
  el.appendChild(spark);
  setTimeout(() => spark.remove(), 460);
}

// ---- End / cleanup ----
function endPvp(winner, reason) {
  if (PVP.over) return;
  PVP.over = true;
  PVP._animating = false;
  if (PVP._heartbeat) { clearInterval(PVP._heartbeat); PVP._heartbeat = null; }
  const iWon = winner === PVP.mySide;
  const draw = winner === "draw";
  let headline = draw ? t("battle_draw") : iWon ? t("battle_win") : t("battle_lose");
  // Add context for non-KO endings.
  let sub = "";
  if (reason === "disconnect") sub = iWon ? t("pvp_won_disconnect") : t("pvp_lost_disconnect");
  else if (reason === "forfeit") sub = iWon ? t("pvp_won_forfeit") : t("pvp_lost_forfeit");
  else if (reason === "timeout") sub = iWon ? t("pvp_won_timeout") : t("pvp_lost_timeout");
  showBattlePicker();   // reveal the controls box for the result + Done button
  document.getElementById("battleControls").innerHTML = `
    <div class="battle-result ${draw ? "" : iWon ? "win" : "lose"}">
      ${headline}${sub ? `<div style="font-size:11px;opacity:.8;margin-top:4px">${sub}</div>` : ""}
    </div>
    <button class="battle-start-btn" onclick="quitPvp()">${t("battle_done")}</button>`;
}

async function quitPvp() {
  PVP.searching = false;
  PVP.over = true;
  _pvpEntered = false;
  if (PVP_PICK.timer) { clearInterval(PVP_PICK.timer); PVP_PICK.timer = null; }
  if (PVP._pickWatchdog) { clearInterval(PVP._pickWatchdog); PVP._pickWatchdog = null; }
  if (PVP._replaceWatch) { clearInterval(PVP._replaceWatch); PVP._replaceWatch = null; }
  if (PVP._pollTimer) { clearInterval(PVP._pollTimer); PVP._pollTimer = null; }
  if (PVP._matchPoll) { clearInterval(PVP._matchPoll); PVP._matchPoll = null; }
  if (PVP._heartbeat) { clearInterval(PVP._heartbeat); PVP._heartbeat = null; }
  if (PVP._closeHandler) { try { window.removeEventListener("pagehide", PVP._closeHandler); } catch (e) {} PVP._closeHandler = null; }
  // Delete the finished match server-side (best-effort; the find-match sweep also cleans
  // up later as a backstop). Only deletes if it's actually finished.
  const finishedMatchId = PVP.matchId;
  try { if (finishedMatchId) await sb.functions.invoke("forfeit", { body: { matchId: finishedMatchId, mode: "cleanup" } }); } catch (e) {}
  // Leave the queue if we were waiting.
  try { if (currentUser) await sb.from("matchmaking_queue").delete().eq("user_id", currentUser.id); } catch (e) {}
  if (PVP.channel) { try { sb.removeChannel(PVP.channel); } catch (e) {} PVP.channel = null; }
  if (PVP._waitChannel) { try { sb.removeChannel(PVP._waitChannel); } catch (e) {} PVP._waitChannel = null; }
  document.getElementById("battleOverlay").classList.remove("open");
  PVP.matchId = null; PVP.state = null;
}