// js/state.js — Save / Load / State helpers
const SAVE_KEY = 'pokegacha_v5';

const G = {
  coins: 500,
  pity: 0,
  lang: 'en',      // 'en' | 'id'
  collection: {},  // pokemonId -> { count }
  bag: {},         // itemId -> count
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
  // Clamp per-Pokémon counts and drop unknown ids.
  for (const id in G.collection) {
    const entry = G.collection[id];
    if (!entry || typeof entry.count !== 'number' || !getPoke(id)) { delete G.collection[id]; continue; }
    entry.count = Math.max(0, Math.min(99999, Math.floor(entry.count)));
  }
  // Clamp bag counts.
  for (const k in G.bag) {
    if (typeof G.bag[k] !== 'number' || !isFinite(G.bag[k])) { delete G.bag[k]; continue; }
    G.bag[k] = Math.max(0, Math.min(99999, Math.floor(G.bag[k])));
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
  if (!G.collection[poke.id]) G.collection[poke.id] = { count: 0 };
  G.collection[poke.id].count++;
}

// Conversion: duplicate → coins
// Returns coins gained (0 if not a duplicate)
function convertDuplicate(pokeId) {
  const entry = G.collection[pokeId];
  if (!entry || entry.count <= 1) return 0;
  const p = getPoke(pokeId);
  const reward = rarityReward(p.rarity);
  entry.count--;
  G.coins += reward;
  save();
  return reward;
}

function rarityReward(rarity) {
  return rarity === 5 ? 1000 : rarity === 4 ? 500 : rarity === 3 ? 200 : rarity === 2 ? 100 : 50;
}