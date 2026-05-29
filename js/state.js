// js/state.js — Save / Load / State helpers
const SAVE_KEY = 'pokegacha_v5';

const G = {
  coins: 500,
  pity: 0,
  lang: 'en',      // 'en' | 'id'
  collection: {},  // pokemonId -> { count }
  bag: {},         // itemId -> count
  teams: [[], [], [], []], // up to 4 team slots, each up to 6 species ids
  activeTeam: 0,   // which team slot is selected for PvP (0-3)
};

// ---- Lightweight integrity check (CASUAL-tamper deterrent ONLY) ----
// IMPORTANT: this is NOT real security. localStorage lives in the user's own
// browser; anyone with DevTools can read this code, compute the checksum, and
// forge a valid save. The ONLY real protection is the server (Supabase RLS +
// validation triggers) for logged-in players. This just stops the casual
// "edit coins to 999999 in DevTools" by making such edits reset the save.
function _checksum(str) {
  // Simple deterministic hash (djb2) + a salt. Obscurity, not cryptography.
  let h = 5381;
  const salted = 'pg!' + str + '!salt';
  for (let i = 0; i < salted.length; i++) h = ((h << 5) + h + salted.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

// Reject impossible values regardless of checksum (defense in depth).
function _validateState() {
  if (typeof G.coins !== 'number' || !isFinite(G.coins)) G.coins = 0;
  G.coins = Math.max(0, Math.min(100000000, Math.floor(G.coins)));
  G.pity  = Math.max(0, Math.min(50, Math.floor(G.pity || 0)));
  if (G.lang !== 'en' && G.lang !== 'id') G.lang = 'en';
  if (typeof G.collection !== 'object' || !G.collection) G.collection = {};
  if (typeof G.bag !== 'object' || !G.bag) G.bag = {};
  // Clamp per-Pokémon counts, drop unknown ids, and ensure battle instances.
  for (const id in G.collection) {
    const entry = G.collection[id];
    if (!entry || typeof entry.count !== 'number' || !getPoke(id)) { delete G.collection[id]; continue; }
    entry.count = Math.max(0, Math.min(99999, Math.floor(entry.count)));
  }
  migrateInstances();

  // Migrate an old single-team save (G.team) into the new 4-slot structure.
  if (Array.isArray(G.team) && (!Array.isArray(G.teams) || !G.teams.some(s => s && s.length))) {
    G.teams = [G.team.slice(), [], [], []];
  }
  delete G.team;
  // Validate teams: exactly 4 slots; each only owned species, unique, max 6.
  if (!Array.isArray(G.teams)) G.teams = [[], [], [], []];
  while (G.teams.length < 4) G.teams.push([]);
  G.teams = G.teams.slice(0, 4).map(slot =>
    [...new Set((Array.isArray(slot) ? slot : []).map(id => parseInt(id)))]
      .filter(id => G.collection[id] && G.collection[id].count > 0)
      .slice(0, 6)
  );
  G.activeTeam = Math.max(0, Math.min(3, parseInt(G.activeTeam) || 0));
  // Clamp bag counts.
  for (const k in G.bag) {
    if (typeof G.bag[k] !== 'number' || !isFinite(G.bag[k])) { delete G.bag[k]; continue; }
    G.bag[k] = Math.max(0, Math.min(99999, Math.floor(G.bag[k])));
  }
}

// ---- Per-individual battle instances (Option B) ----
// Each owned Pokémon gets an `instances` array; one entry per individual, each
// with its own { moves:[up to 4 keys], ability }. Existing saves are backfilled
// on load (migration) so nothing breaks. Battle data (legal pools) is static in
// learnsets.js / abilities.js — never stored in the save, so it isn't cheatable.

// Build a default loadout for a species: first up-to-4 legal moves + first ability.
function buildDefaultLoadout(speciesId) {
  const pool = (typeof legalMovePool === 'function') ? legalMovePool(speciesId) : [];
  const abils = (typeof legalAbilities === 'function') ? legalAbilities(speciesId) : [];
  return { moves: pool.slice(0, 4), ability: abils[0] || null };
}

// Validate a single instance against the species' legal pools (drops illegal picks).
function sanitizeInstance(speciesId, inst) {
  const pool = (typeof legalMovePool === 'function') ? legalMovePool(speciesId) : [];
  const abils = (typeof legalAbilities === 'function') ? legalAbilities(speciesId) : [];
  let moves = Array.isArray(inst && inst.moves) ? inst.moves.filter(m => pool.includes(m)) : [];
  // de-dupe, cap at 4
  moves = [...new Set(moves)].slice(0, 4);
  if (!moves.length) moves = pool.slice(0, 4);
  let ability = (inst && abils.includes(inst.ability)) ? inst.ability : (abils[0] || null);
  return { moves, ability };
}

// Ensure every owned Pokémon has an instances array matching its count.
function migrateInstances() {
  // If battle data isn't loaded yet, skip safely (will run again later).
  if (typeof legalMovePool !== 'function') return;
  for (const id in G.collection) {
    const entry = G.collection[id];
    if (!entry || entry.count <= 0) continue;
    if (!Array.isArray(entry.instances)) entry.instances = [];
    // Backfill missing instances up to count with defaults.
    while (entry.instances.length < entry.count) {
      entry.instances.push(buildDefaultLoadout(parseInt(id)));
    }
    // Trim extras if count shrank (e.g. duplicate conversion).
    if (entry.instances.length > entry.count) entry.instances.length = entry.count;
    // Sanitize each instance against legal pools.
    entry.instances = entry.instances.map(inst => sanitizeInstance(parseInt(id), inst));
  }
}

function save() {
  try {
    const payload = JSON.stringify(G);
    const envelope = JSON.stringify({ d: payload, c: _checksum(payload) });
    localStorage.setItem(SAVE_KEY, envelope);
  } catch (e) {}
  // Push to cloud (debounced; no-op when offline or logged out)
  if (typeof scheduleCloudSync === 'function') scheduleCloudSync();
}

function load() {
  try {
    const legacy = localStorage.getItem('pokegacha_v4');
    const current = localStorage.getItem(SAVE_KEY);
    const raw = current || legacy;
    if (!raw) return;

    let data = null;
    let tampered = false;

    // New format: { d: "<json>", c: "<checksum>" }
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.d === 'string' && typeof parsed.c === 'string') {
        if (_checksum(parsed.d) === parsed.c) {
          data = JSON.parse(parsed.d);          // intact
        } else {
          tampered = true;                       // checksum mismatch → edited by hand
        }
      } else {
        // Legacy/plain save (pre-checksum, or v4). Accept once, then re-wrap on save.
        data = parsed;
      }
    } catch (e) { tampered = true; }

    if (tampered) {
      // Casual tamper detected: discard the edited save rather than trust it.
      localStorage.removeItem(SAVE_KEY);
      return; // G stays at safe defaults
    }

    if (data) Object.assign(G, data);
    _validateState();
    save(); // re-wrap with a fresh checksum (also migrates v4/plain → envelope)
  } catch (e) {}
}

// Helpers
function balls() { return G.bag['pokeball'] || 0; }
function ownedIds() {
  return Object.keys(G.collection).filter(id => G.collection[id] && G.collection[id].count > 0);
}
function addToCollection(poke) {
  if (!G.collection[poke.id]) G.collection[poke.id] = { count: 0, instances: [] };
  const entry = G.collection[poke.id];
  if (!Array.isArray(entry.instances)) entry.instances = [];
  entry.count++;
  // Give the new individual a default loadout.
  entry.instances.push(buildDefaultLoadout(poke.id));
}

// Conversion: duplicate → coins
// Returns coins gained (0 if not a duplicate)
function convertDuplicate(pokeId) {
  const entry = G.collection[pokeId];
  if (!entry || entry.count <= 1) return 0;
  const p = getPoke(pokeId);
  const reward = rarityReward(p.rarity);
  entry.count--;
  // Remove the LAST instance (keep the player's first/edited one).
  if (Array.isArray(entry.instances) && entry.instances.length > entry.count) {
    entry.instances.length = entry.count;
  }
  G.coins += reward;
  save();
  return reward;
}

function rarityReward(rarity) {
  return rarity === 5 ? 1000 : rarity === 4 ? 500 : rarity === 3 ? 200 : rarity === 2 ? 100 : 50;
}