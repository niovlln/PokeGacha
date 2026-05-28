// js/achievements.js — Achievement definitions + live computation from G.collection.
// All achievements are derived (no extra save state). Progress recomputes on each render.

// Total count of each type across all 151 (denominator for type achievements).
function typeTotals() {
  const totals = {};
  POKEMON.forEach(p => p.types.forEach(ty => { totals[ty] = (totals[ty] || 0) + 1; }));
  return totals;
}
// How many of a given type the player owns.
function ownedOfType(ty) {
  return POKEMON.filter(p => p.types.includes(ty) &&
    G.collection[p.id] && G.collection[p.id].count > 0).length;
}
// How many of a given rarity the player owns / total exist.
function ownedOfRarity(r) {
  return POKEMON.filter(p => p.rarity === r &&
    G.collection[p.id] && G.collection[p.id].count > 0).length;
}
function totalOfRarity(r) { return POKEMON.filter(p => p.rarity === r).length; }

// Stable type order for display.
const TYPE_ORDER = ['normal','fire','water','electric','grass','ice','fighting','poison',
  'ground','flying','psychic','bug','rock','ghost','dragon','steel','dark'];

// Build the full achievement list with live progress.
// Each: { id, label, icon, color, have, need, done }
function getAchievements() {
  const out = [];
  const owned = ownedIds().length;
  const totals = typeTotals();

  // 1) Total-collection milestones
  [[10,'ach_m10'],[50,'ach_m50'],[100,'ach_m100'],[151,'ach_m151']].forEach(([need, key]) => {
    out.push({
      id: key, group: 'milestone', label: t(key),
      icon: svgIcon('star', '#ffd700', 16), color: '#ffd700',
      have: Math.min(owned, need), need, done: owned >= need,
    });
  });

  // 2) Per-type sweeps (catch every Pokémon of each type)
  TYPE_ORDER.forEach(ty => {
    if (!totals[ty]) return;
    const have = ownedOfType(ty), need = totals[ty];
    out.push({
      id: 'ach_type_' + ty, group: 'type',
      label: t('ach_type', { type: typeLabel(ty) }),
      icon: `<span class="tbadge" style="background:${TC[ty]};font-size:9px">${typeLabel(ty)}</span>`,
      color: TC[ty], have, need, done: have >= need,
    });
  });

  return out;
}

function achievementsSummary() {
  const all = getAchievements();
  return { done: all.filter(a => a.done).length, total: all.length };
}
