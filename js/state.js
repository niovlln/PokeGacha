// js/state.js — Save / Load / State helpers
const SAVE_KEY = 'pokegacha_v5';

const G = {
  coins: 500,
  pity: 0,
  lang: 'en',      // 'en' | 'id'
  collection: {},  // pokemonId -> { count }
  bag: {},         // itemId -> count
};

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch (e) {}
  // Push to cloud (debounced; no-op when offline or logged out)
  if (typeof scheduleCloudSync === 'function') scheduleCloudSync();
}

function load() {
  try {
    // Migrate from v4 if present
    const legacy = localStorage.getItem('pokegacha_v4');
    const current = localStorage.getItem(SAVE_KEY);
    const raw = current || legacy;
    if (raw) {
      const data = JSON.parse(raw);
      Object.assign(G, data);
      // Clamp pity to the valid range. Pity counts non-legendary encounters since
      // the last legendary; at 80 the next encounter is a guaranteed legendary.
      G.pity = Math.max(0, Math.min(80, Math.floor(G.pity || 0)));
      // Default language if an older save lacks it
      if (G.lang !== 'en' && G.lang !== 'id') G.lang = 'en';
      // Migrate to v5 immediately
      if (legacy && !current) save();
    }
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