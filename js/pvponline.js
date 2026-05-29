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
      showMatchFoundThen(data.matchId, data.side);
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
    <button class="battle-cancel-btn" onclick="forfeitPvp()">↩ ${t("pvp_forfeit")}</button>`;
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
     <div style="text-align:center;margin-top:20px;font-size:34px">⏳</div></div>`;
  document.getElementById("battleControls").innerHTML =
    `<button class="battle-cancel-btn" onclick="forfeitPvp()">↩ ${t("pvp_forfeit")}</button>`;

  try {
    const { data, error } = await sb.functions.invoke("submit-picks", {
      body: { matchId: PVP.matchId, picks: PVP_PICK.picks },
    });
    if (error || !data || !data.ok) { pushPvpLog(t("pvp_error")); return; }
    if (data.started) {
      // Both picked already (or we triggered the build) → battle is ready.
      enterMatch(PVP.matchId, PVP.mySide);
    }
    // else data.waiting → the Realtime UPDATE (status→active) will trigger enterMatch.
  } catch (e) {
    pushPvpLog(t("pvp_error"));
  }
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
function showMatchFoundThen(matchId, side) {
  PVP.searching = false;
  if (PVP._waitChannel) { try { sb.removeChannel(PVP._waitChannel); } catch (e) {} PVP._waitChannel = null; }
  const overlay = document.getElementById("matchFoundPopup");
  if (overlay) {
    overlay.classList.add("open");
    setTimeout(() => {
      overlay.classList.remove("open");
      enterPickingPhase(matchId, side);
    }, 1800);
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

  // Load the authoritative match row.
  const { data: m, error } = await sb.from("matches").select("*").eq("id", matchId).single();
  if (error || !m) { renderSearching(t("pvp_error")); return; }
  if (m.status === "picking" || !m.state) return; // battle not built yet; wait for Realtime
  _pvpEntered = true;

  // Stop the picking countdown if still running.
  if (PVP_PICK.timer) { clearInterval(PVP_PICK.timer); PVP_PICK.timer = null; }

  PVP.state = m.state;
  PVP.turnNumber = m.turn_number;
  PVP.seed = m.seed;

  // Ensure we're subscribed (we already subscribed during picking, but safe to re-affirm).
  subscribeToMatch(matchId);

  renderPvpStage();
  pushPvpLog(t("battle_start_msg"));
  promptPvpMove();
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

  // Match ended (KO, forfeit, disconnect, or timeout) — show the result once.
  if (m.status === "finished" && !PVP.over) {
    PVP.state = (m.state && m.state.a && m.state.b) ? m.state : PVP.state;
    endPvp(m.winner, m.end_reason);
    return;
  }

  // Picking phase just completed → battle built → enter it.
  if (m.status === "active" && !_pvpEntered) {
    enterMatch(m.id, PVP.mySide);
    return;
  }

  // A turn resolved if the server's turn_number advanced past ours.
  if (m.turn_number > PVP.turnNumber) {
    PVP.turnNumber = m.turn_number;
    PVP.awaitingResolve = false;
    const newState = m.state;
    const log = m.last_log || [];
    const needReplace = (m.pending && m.pending.needReplace) || { a: [], b: [] };
    // Animate the resolved turn from MY perspective, then continue or end.
    animatePvpTurn(newState, log, m.status === "finished", m.winner, needReplace);
    return;
  }

  // A faint-replacement happened (same turn_number, but a Pokémon was sent in).
  // This is usually the OPPONENT sending in their new active Pokémon — sync our view
  // so it appears on the field and becomes targetable. Don't disturb my own input if
  // I'm the one who still needs to replace.
  const lastLog = m.last_log || [];
  const isReplacement = lastLog.length && lastLog.every(e => e.t === "sendin");
  if (isReplacement && m.state && m.state.a && m.state.b) {
    // Idempotency: polling may deliver the same replacement row repeatedly. Build a
    // signature and skip if we've already processed this exact replacement.
    const sig = JSON.stringify(lastLog) + "|" + (m.pending ? JSON.stringify(m.pending.needReplace) : "");
    if (PVP._lastReplaceSig === sig) return;
    PVP._lastReplaceSig = sig;

    PVP.state = m.state;
    const myNeed = (m.pending && m.pending.needReplace && m.pending.needReplace[PVP.mySide]) || [];
    // Re-render the battlefield with the updated state (opponent's new mon now shows).
    renderPvpStage();
    lastLog.forEach(e => pushPvpLog(eventText(e)));
    // If I still owe a replacement, keep my replacement prompt; if I was waiting and
    // it's now my move (no one owes a replacement), let me act.
    if (!myNeed.length && !PVP.awaitingResolve && !PVP._targeting && !PVP.over) {
      if (PVP._waitingForOpponentReplace) {
        PVP._waitingForOpponentReplace = false;
        promptPvpMove();
      }
    }
  }
}

// ---- Rendering (per-perspective: near = my side, far = foe) ----
function renderPvpStage() {
  if (!PVP.state || !PVP.state.a || !PVP.state.b) return; // nothing to render yet
  let u = 0;
  [...PVP.state.a, ...PVP.state.b].forEach(b => { if (b) b._uid = u++; });
  // Only show Pokémon still in the fight — fainted ones are removed from the scene.
  const near = pvpNear().filter(b => b && !b.fainted);
  const far  = pvpFar().filter(b => b && !b.fainted);
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

function pushPvpLog(text) {
  const log = document.getElementById("battleLog");
  const div = document.createElement("div");
  div.className = "log-line";
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function renderSearching(msg) {
  document.getElementById("battleStage").innerHTML =
    `<div class="battle-setup"><div class="battle-setup-title">${msg}</div>
     <div style="text-align:center;margin-top:20px;font-size:34px">🔍</div></div>`;
  document.getElementById("battleLog").innerHTML = "";
  document.getElementById("battleControls").innerHTML =
    `<button class="battle-cancel-btn" onclick="quitPvp()">↩ ${t("cancel")}</button>`;
}

// ---- My move selection (only for MY living Pokémon) ----
function promptPvpMove() {
  if (PVP.over) return;
  PVP.pendingActions = [];
  promptPvpActor(0);
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
    ${canSwitch ? `<button class="battle-switch-btn" onclick="choosePvpSwitch(${actorIdx})">🔄 ${t("pvp_switch")}</button>` : ""}
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
    <button class="battle-cancel-btn" onclick="promptPvpActor(${actorIdx})">↩ ${t("cancel")}</button>`;
}

function commitPvpSwitch(actorIdx, benchIdx) {
  PVP.pendingActions.push({ type: "switch", side: PVP.mySide, actorIdx, benchIdx });
  promptPvpActor(actorIdx + 1);
}

function choosePvpMove(actorIdx, moveKey) {
  const md = moveData(moveKey) || {};
  // Targets: all living Pokémon on both canonical sides.
  const targets = [];
  pvpFar().forEach((b, i) => { if (b && !b.fainted) targets.push({ side: PVP.foeSide, idx: i, b, kind: "foe" }); });
  pvpNear().forEach((b, i) => { if (b && !b.fainted) targets.push({ side: PVP.mySide, idx: i, b, kind: "ally" }); });

  if (md.category === "status" || !md.power) { commitPvpMove(actorIdx, moveKey, PVP.foeSide, targets.find(x=>x.kind==='foe')?.idx ?? 0); return; }
  if (targets.length === 1) { commitPvpMove(actorIdx, moveKey, targets[0].side, targets[0].idx); return; }
  enterPvpTargetMode(actorIdx, moveKey, targets);
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
      ${targets.map(tg => `<button class="battle-move-btn target-btn ${tg.kind}" onclick="pickPvpTarget('${tg.side}', ${tg.idx})">
        <span class="bmb-name">${tg.b.name}</span>
        <span class="bmb-meta">${tg.kind === "ally" ? t("tgt_ally") : t("tgt_foe")} · HP ${tg.b.hp}/${tg.b.maxHp}</span>
      </button>`).join("")}
    </div>
    <button class="battle-cancel-btn" onclick="promptPvpActor(${actorIdx})">↩ ${t("cancel")}</button>`;
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
  const events = (log || []).slice();
  let i = 0;
  const step = () => {
    if (i >= events.length) {
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
        document.getElementById("battleControls").innerHTML =
          `<div class="move-prompt">${t("pvp_waiting_replace")}</div>`;
        return;
      }
      promptPvpMove();
      return;
    }
    const e = events[i++];
    pushPvpLog(eventText(e));
    if (e.t === "damage") refreshPvpBattler(e.who, true);
    else if (e.t === "faint" || e.t === "heal" || e.t === "recoil" || e.t === "residual" || e.t === "status") refreshPvpBattler(e.who, false);
    setTimeout(step, 650);
  };
  step();
}

// A1: prompt the player to send in a bench Pokémon for each fainted active slot.
function promptReplacement(slots) {
  const slot = slots[0]; // handle one slot at a time
  const bench = pvpBench();
  const options = bench.map((b, i) => ({ b, i })).filter(o => o.b && !o.b.fainted);
  if (!options.length) { promptPvpMove(); return; } // safety: nothing to send in
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
      document.getElementById("battleControls").innerHTML =
        `<div class="move-prompt">${t("pvp_waiting_replace")}</div>`;
      return;
    }
    promptPvpMove();
  } catch (e) {
    pushPvpLog(t("pvp_error")); promptPvpMove();
  }
}

function refreshPvpBattler(name, hit) {
  const all = [...PVP.state.a, ...PVP.state.b].filter(Boolean);
  const b = all.find(x => x.name === name);
  if (!b) return;
  // Re-render the whole stage is simplest & correct after each impactful event.
  renderPvpStage();
  const mon = document.getElementById("fieldmon-" + b._uid);
  if (mon && hit) { mon.classList.add("hit"); setTimeout(() => mon.classList.remove("hit"), 380); }
}

// ---- End / cleanup ----
function endPvp(winner, reason) {
  if (PVP.over) return;
  PVP.over = true;
  if (PVP._heartbeat) { clearInterval(PVP._heartbeat); PVP._heartbeat = null; }
  const iWon = winner === PVP.mySide;
  const draw = winner === "draw";
  let headline = draw ? t("battle_draw") : iWon ? t("battle_win") : t("battle_lose");
  // Add context for non-KO endings.
  let sub = "";
  if (reason === "disconnect") sub = iWon ? t("pvp_won_disconnect") : t("pvp_lost_disconnect");
  else if (reason === "forfeit") sub = iWon ? t("pvp_won_forfeit") : t("pvp_lost_forfeit");
  else if (reason === "timeout") sub = iWon ? t("pvp_won_timeout") : t("pvp_lost_timeout");
  pushPvpLog(headline + (sub ? " — " + sub : ""));
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