// @ts-nocheck — This engine is a faithful 1:1 port of the client's battle.js (plain
// JS style). Its logic is verified by simulation; we disable strict type-checking here
// so Deno doesn't require explicit annotations on every ported parameter. Runtime
// behavior is unaffected.
//
// Referee battle engine (TypeScript, Deno). Ported 1:1 from client battle.js so
// resolution is IDENTICAL on client and server. The server is authoritative: it owns
// the RNG seed and the move data, and re-validates every action.
import { MOVES, ABILITIES, SPECIES_ABILITIES, LEARNSETS, POKEMON } from "./battledata.ts";

// Data helpers (server-side equivalents of the client's ui/state helpers).
export function getPoke(id: any): any { return POKEMON.find((p: any) => p.id === parseInt(id)); }
export function moveData(key: string): any { return MOVES[key] || null; }
export function legalMovePool(speciesId: any): string[] { return LEARNSETS[speciesId] || []; }
export function legalAbilities(speciesId: any): string[] { return SPECIES_ABILITIES[speciesId] || []; }
const TC: Record<string,string> = {}; // colors unused server-side

// Validate a single instance against the species' legal pools (drops illegal picks).
export function sanitizeInstance(speciesId: any, inst: any): any {
  const pool = legalMovePool(speciesId);
  const abils = legalAbilities(speciesId);
  let moves = Array.isArray(inst && inst.moves) ? inst.moves.filter((m: string) => pool.includes(m)) : [];
  moves = [...new Set(moves)].slice(0, 4);
  if (!moves.length) moves = pool.slice(0, 4);
  let ability = (inst && abils.includes(inst.ability)) ? inst.ability : (abils[0] || null);
  return { moves, ability };
}

function makeRNG(seed) {
  let s = (seed >>> 0) || 1;
  return function () { // xorshift32 → [0,1)
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

// ---------- Type effectiveness (modern chart; 18 types, we use Gen-1's 15 + extras) ----------
// Multiplier of ATTACKING type vs DEFENDING type. Missing = 1x.
const TYPE_CHART = {
  normal:   { rock:0.5, ghost:0, steel:0.5 },
  fire:     { fire:0.5, water:0.5, grass:2, ice:2, bug:2, rock:0.5, dragon:0.5, steel:2 },
  water:    { fire:2, water:0.5, grass:0.5, ground:2, rock:2, dragon:0.5 },
  grass:    { fire:0.5, water:2, grass:0.5, poison:0.5, ground:2, flying:0.5, bug:0.5, rock:2, dragon:0.5, steel:0.5 },
  electric: { water:2, grass:0.5, electric:0.5, ground:0, flying:2, dragon:0.5 },
  ice:      { fire:0.5, water:0.5, grass:2, ice:0.5, ground:2, flying:2, dragon:2, steel:0.5 },
  fighting: { normal:2, ice:2, poison:0.5, flying:0.5, psychic:0.5, bug:0.5, rock:2, ghost:0, dark:2, steel:2 },
  poison:   { grass:2, poison:0.5, ground:0.5, rock:0.5, ghost:0.5, steel:0 },
  ground:   { fire:2, grass:0.5, electric:2, poison:2, flying:0, bug:0.5, rock:2, steel:2 },
  flying:   { grass:2, electric:0.5, fighting:2, bug:2, rock:0.5, steel:0.5 },
  psychic:  { fighting:2, poison:2, psychic:0.5, dark:0, steel:0.5 },
  bug:      { fire:0.5, grass:2, fighting:0.5, poison:0.5, flying:0.5, psychic:2, ghost:0.5, dark:2, steel:0.5 },
  rock:     { fire:2, ice:2, fighting:0.5, ground:0.5, flying:2, bug:2, steel:0.5 },
  ghost:    { normal:0, psychic:2, ghost:2, dark:0.5 },
  dragon:   { dragon:2, steel:0.5 },
  dark:     { fighting:0.5, psychic:2, ghost:2, dark:0.5 },
  steel:    { fire:0.5, water:0.5, electric:0.5, ice:2, rock:2, steel:0.5 },
};

function typeMultiplier(moveType, defenderTypes) {
  let mult = 1;
  const row = TYPE_CHART[moveType] || {};
  for (const dt of defenderTypes) if (row[dt] !== undefined) mult *= row[dt];
  return mult;
}

// ---------- Build a battle-ready Pokémon from a species id + saved instance ----------
// instance: { moves:[keys], ability } (validated against legal pools by caller).
function makeBattler(speciesId, instance, level = 50) {
  const p = getPoke(speciesId);
  if (!p) return null;
  // Modern stat formula at given level (simplified, no IV/EV/nature for fairness).
  const stat = (base) => Math.floor(((2 * base) * level) / 100) + 5;
  const hpStat = Math.floor(((2 * p.hp) * level) / 100) + level + 10;
  const moves = (instance.moves || []).slice(0, 4).map(k => ({ key: k, ...(moveData(k) || {}), pp: (moveData(k) || {}).pp || 5 }));
  return {
    speciesId, name: p.name, types: p.types.slice(),
    level,
    maxHp: hpStat, hp: hpStat,
    atk: stat(p.atk), def: stat(p.def), spAtk: stat(p.spAtk), spDef: stat(p.spDef), spd: stat(p.spd),
    // volatile battle stat stages (-6..+6)
    stages: { atk:0, def:0, spAtk:0, spDef:0, spd:0, acc:0, eva:0 },
    status: null, // 'brn' | 'par' | 'psn' | 'slp' | 'frz' | null
    sleepTurns: 0,
    ability: instance.ability || null,
    moves,
    fainted: false,
  };
}

const STAGE_MULT = { '-6':0.25,'-5':2/7,'-4':1/3,'-3':0.4,'-2':0.5,'-1':2/3,'0':1,'1':1.5,'2':2,'3':2.5,'4':3,'5':3.5,'6':4 };
function effStat(b, key) {
  const base = b[key];
  const stg = b.stages[key] || 0;
  return Math.max(1, Math.floor(base * STAGE_MULT[String(stg)]));
}

// ---------- Damage calculation (clean-modern) ----------
function calcDamage(attacker, defender, move, rng, log) {
  if (!move || move.category === 'status' || !move.power) return { dmg: 0, eff: 1, crit: false };
  const isPhysical = move.category === 'physical';
  let atk = effStat(attacker, isPhysical ? 'atk' : 'spAtk');
  let def = effStat(defender, isPhysical ? 'def' : 'spDef');

  // Burn halves physical attack.
  if (attacker.status === 'brn' && isPhysical) atk = Math.floor(atk / 2);

  // Base damage (modern formula, level-based).
  let dmg = Math.floor(Math.floor((Math.floor((2 * attacker.level) / 5) + 2) * move.power * atk / def) / 50) + 2;

  // STAB
  if (attacker.types.includes(move.type)) dmg = Math.floor(dmg * 1.5);

  // Ability damage boosts (low-HP pinch abilities).
  const lowHp = attacker.hp <= attacker.maxHp / 3;
  if (lowHp) {
    if (attacker.ability === 'overgrow' && move.type === 'grass') dmg = Math.floor(dmg * 1.5);
    if (attacker.ability === 'blaze' && move.type === 'fire') dmg = Math.floor(dmg * 1.5);
    if (attacker.ability === 'torrent' && move.type === 'water') dmg = Math.floor(dmg * 1.5);
    if (attacker.ability === 'swarm' && move.type === 'bug') dmg = Math.floor(dmg * 1.5);
  }

  // Type effectiveness
  let eff = typeMultiplier(move.type, defender.types);
  // Levitate immunity to ground
  if (defender.ability === 'levitate' && move.type === 'ground') eff = 0;
  // Thick Fat: halve fire/ice taken
  if (defender.ability === 'thick_fat' && (move.type === 'fire' || move.type === 'ice')) eff *= 0.5;
  dmg = Math.floor(dmg * eff);

  // Critical hit (modern ~1/24, highcrit moves ~1/8)
  const critChance = (move.effect === 'highcrit' || (Array.isArray(move.effect) && move.effect.includes('highcrit'))) ? 0.125 : 0.0417;
  let crit = false;
  if (eff > 0 && rng() < critChance) { crit = true; dmg = Math.floor(dmg * 1.5); }

  // Random factor 0.85–1.0
  dmg = Math.floor(dmg * (0.85 + rng() * 0.15));

  return { dmg: Math.max(eff > 0 ? 1 : 0, dmg), eff, crit };
}

// ---------- Effect helpers ----------
function hasTag(move, tag) {
  return move.effect === tag || (Array.isArray(move.effect) && move.effect.includes(tag));
}

function applyMoveEffects(attacker, defender, move, rng, log, dealtDamage) {
  const e = move.effect; if (!e) return;
  const tags = Array.isArray(e) ? e : [e];
  for (const tag of tags) {
    switch (tag) {
      case 'burn10': case 'may_burn': if (rng() < 0.1 && !defender.status && !defender.types.includes('fire')) { defender.status='brn'; log.push({t:'status',who:defender.name,code:'brn'}); } break;
      case 'burn30': if (rng() < 0.3 && !defender.status && !defender.types.includes('fire')) { defender.status='brn'; log.push({t:'status',who:defender.name,code:'brn'}); } break;
      case 'paralyze10': case 'may_paralyze': if (rng() < 0.1 && !defender.status) { defender.status='par'; log.push({t:'status',who:defender.name,code:'par'}); } break;
      case 'paralyze30': if (rng() < 0.3 && !defender.status) { defender.status='par'; log.push({t:'status',who:defender.name,code:'par'}); } break;
      case 'paralyze': if (!defender.status) { defender.status='par'; log.push({t:'status',who:defender.name,code:'par'}); } break;
      case 'poison': case 'poison30': if ((tag==='poison'||rng()<0.3) && !defender.status && !defender.types.includes('poison')) { defender.status='psn'; log.push({t:'status',who:defender.name,code:'psn'}); } break;
      case 'poison40': if (rng()<0.4 && !defender.status && !defender.types.includes('poison')) { defender.status='psn'; log.push({t:'status',who:defender.name,code:'psn'}); } break;
      case 'badpoison': if (!defender.status) { defender.status='psn'; log.push({t:'status',who:defender.name,code:'badpsn'}); } break;
      case 'freeze10': case 'may_freeze': if (rng() < 0.1 && !defender.status && !defender.types.includes('ice')) { defender.status='frz'; log.push({t:'status',who:defender.name,code:'frz'}); } break;
      case 'sleep': if (!defender.status) { defender.status='slp'; defender.sleepTurns = 1 + Math.floor(rng()*3); log.push({t:'status',who:defender.name,code:'slp'}); } break;
      case 'confuse': case 'confuse10': /* simplified: skip volatile confusion for now */ break;
      case 'atk_up': attacker.stages.atk = Math.min(6, attacker.stages.atk+1); log.push({t:'stat',who:attacker.name,stat:'atk',dir:'up'}); break;
      case 'atk_up2': attacker.stages.atk = Math.min(6, attacker.stages.atk+2); log.push({t:'stat',who:attacker.name,stat:'atk',dir:'up',sharp:1}); break;
      case 'def_up': attacker.stages.def = Math.min(6, attacker.stages.def+1); log.push({t:'stat',who:attacker.name,stat:'def',dir:'up'}); break;
      case 'def_up2': attacker.stages.def = Math.min(6, attacker.stages.def+2); log.push({t:'stat',who:attacker.name,stat:'def',dir:'up',sharp:1}); break;
      case 'spd_up2': attacker.stages.spd = Math.min(6, attacker.stages.spd+2); log.push({t:'stat',who:attacker.name,stat:'spd',dir:'up',sharp:1}); break;
      case 'spdef_up2': attacker.stages.spDef = Math.min(6, attacker.stages.spDef+2); log.push({t:'stat',who:attacker.name,stat:'spdef',dir:'up',sharp:1}); break;
      case 'foe_atk_down': defender.stages.atk = Math.max(-6, defender.stages.atk-1); log.push({t:'stat',who:defender.name,stat:'atk',dir:'down'}); break;
      case 'foe_def_down': defender.stages.def = Math.max(-6, defender.stages.def-1); log.push({t:'stat',who:defender.name,stat:'def',dir:'down'}); break;
      case 'foe_def_down2': defender.stages.def = Math.max(-6, defender.stages.def-2); log.push({t:'stat',who:defender.name,stat:'def',dir:'down',sharp:1}); break;
      case 'foe_spd_down': case 'foe_spd_down2': defender.stages.spd = Math.max(-6, defender.stages.spd-(tag.endsWith('2')?2:1)); log.push({t:'stat',who:defender.name,stat:'spd',dir:'down'}); break;
      case 'foe_acc_down': defender.stages.acc = Math.max(-6, defender.stages.acc-1); log.push({t:'stat',who:defender.name,stat:'acc',dir:'down'}); break;
      case 'foe_spdef_down30': if (rng()<0.3){ defender.stages.spDef=Math.max(-6,defender.stages.spDef-1); log.push({t:'stat',who:defender.name,stat:'spdef',dir:'down'}); } break;
      case 'drain': if (dealtDamage>0){ const heal=Math.floor(dealtDamage/2); attacker.hp=Math.min(attacker.maxHp,attacker.hp+heal); log.push({t:'heal',who:attacker.name,amt:heal}); } break;
      case 'recoil25': if (dealtDamage>0 && attacker.ability!=='rock_head'){ const r=Math.floor(dealtDamage/4); attacker.hp=Math.max(0,attacker.hp-r); log.push({t:'recoil',who:attacker.name,amt:r}); } break;
      case 'heal50': { const h=Math.floor(attacker.maxHp/2); attacker.hp=Math.min(attacker.maxHp,attacker.hp+h); log.push({t:'heal',who:attacker.name,amt:h}); } break;
      case 'faint_user': attacker.hp = 0; break;
      default: break; // unimplemented tags are no-ops for now
    }
  }
}

// End-of-turn residual damage (burn/poison).
function applyResidual(b, log) {
  if (b.fainted) return;
  if (b.status === 'brn' || b.status === 'psn') {
    const dmg = Math.max(1, Math.floor(b.maxHp / 8));
    b.hp = Math.max(0, b.hp - dmg);
    log.push({ t:'residual', who:b.name, s:b.status, amt:dmg });
  }
}

// Returns special fixed/level-scaling damage for a move, or null if the move uses
// the normal damage formula. Reads the move's effect tag.
function fixedDamage(attacker, defender, move, rng) {
  const tags = Array.isArray(move.effect) ? move.effect : [move.effect];
  for (const tag of tags) {
    switch (tag) {
      case 'level_dmg':  return attacker.level;                       // Night Shade, Seismic Toss
      case 'fixed20':    return 20;                                   // Sonic Boom
      case 'fixed40':    return 40;                                   // Dragon Rage
      case 'psywave':    return Math.max(1, Math.floor(attacker.level * (0.5 + rng()))); // 50–150% of level
      case 'halve_hp':   return Math.max(1, Math.floor(defender.hp / 2)); // Super Fang
      default: break;
    }
  }
  return null;
}

// Resolve a single attack action.
function resolveAttack(attacker, defender, move, rng, log) {
  if (attacker.fainted || !move) return;
  // Sleep / freeze / paralysis gates
  if (attacker.status === 'slp') {
    if (attacker.sleepTurns > 0) { attacker.sleepTurns--; log.push({t:'msg',code:'asleep',who:attacker.name}); if(attacker.sleepTurns>0) return; }
    if (attacker.sleepTurns === 0) { attacker.status=null; log.push({t:'msg',code:'woke',who:attacker.name}); }
  }
  if (attacker.status === 'frz') { if (rng()<0.2){ attacker.status=null; log.push({t:'msg',code:'thawed',who:attacker.name}); } else { log.push({t:'msg',code:'frozensolid',who:attacker.name}); return; } }
  if (attacker.status === 'par' && rng() < 0.25) { log.push({t:'msg',code:'fullpara',who:attacker.name}); return; }
  if (defender.fainted) { log.push({t:'msg',code:'notarget',who:attacker.name,move:move.name}); return; }

  // Accuracy
  const acc = move.acc === 0 ? 999 : move.acc;
  if (acc !== 999 && rng() * 100 > acc) { log.push({t:'miss',who:attacker.name,move:move.name}); return; }

  log.push({ t:'move', who:attacker.name, move:move.name });

  if (move.category === 'status') {
    applyMoveEffects(attacker, defender, move, rng, log, 0);
    return;
  }

  // Fixed / level-scaling damage moves (Night Shade, Seismic Toss, Dragon Rage,
  // Sonic Boom, Psywave, Super Fang). These ignore the normal damage formula but
  // STILL respect type immunity (e.g. Normal is immune to Ghost-type Night Shade).
  const fixed = fixedDamage(attacker, defender, move, rng);
  if (fixed !== null) {
    // Type-based immunity check (multiplier 0 → no effect).
    let eff = typeMultiplier(move.type, defender.types);
    if (defender.ability === 'levitate' && move.type === 'ground') eff = 0;
    if (eff === 0) { log.push({ t:'immune', who:defender.name }); return; }
    const dmg = Math.max(1, fixed);
    defender.hp = Math.max(0, defender.hp - dmg);
    log.push({ t:'damage', who:defender.name, by:attacker.name, move:move.name, amt:dmg, eff:1, crit:false });
    applyMoveEffects(attacker, defender, move, rng, log, dmg);
    if (defender.hp <= 0) { defender.fainted = true; log.push({ t:'faint', who:defender.name }); }
    return;
  }

  const { dmg, eff, crit } = calcDamage(attacker, defender, move, rng, log);
  if (eff === 0) { log.push({t:'immune',who:defender.name}); return; }
  defender.hp = Math.max(0, defender.hp - dmg);
  log.push({ t:'damage', who:defender.name, by:attacker.name, move:move.name, amt:dmg, eff, crit });
  applyMoveEffects(attacker, defender, move, rng, log, dmg);
  if (defender.hp <= 0) { defender.fainted = true; log.push({t:'faint',who:defender.name}); }
}

// ---------- Public: resolve one full turn ----------
// teams: { a:[battler,...], b:[battler,...] }
// actions: array of { side:'a'|'b', actorIdx, moveKey, targetSide, targetIdx }
// Returns { log, over, winner }
function resolveTurn(state, actions, rng) {
  const log = [];
  const getB = (side, idx) => state[side][idx];

  // Order actions by effective Speed (desc), paralysis quarters speed.
  // Phase 1: SWITCHES resolve first (before moves), regardless of speed.
  const benchKey = (side) => side === 'a' ? 'benchA' : 'benchB';
  for (const act of actions) {
    if (!act || act.type !== 'switch') continue;
    const bench = state[benchKey(act.side)] || [];
    const incoming = bench[act.benchIdx];
    const outgoing = state[act.side][act.actorIdx];
    if (!incoming || incoming.fainted) continue;
    if (!outgoing) continue;
    state[act.side][act.actorIdx] = incoming;
    bench[act.benchIdx] = outgoing;
    log.push({ t: 'switch', who: outgoing.name, in: incoming.name });
  }

  // Phase 2: MOVES resolve by speed (switch actions skipped here).
  const moveActions = actions.filter(a => a && a.type !== 'switch');
  const speed = (b) => { let s = effStat(b,'spd'); if (b.status==='par') s=Math.floor(s/4); return s; };
  const ordered = moveActions.slice().sort((x, y) => {
    const bx = getB(x.side, x.actorIdx), by = getB(y.side, y.actorIdx);
    const mx = moveData(x.moveKey) || {}, my = moveData(y.moveKey) || {};
    const px = hasTag(mx, 'priority') ? 1 : 0, py = hasTag(my, 'priority') ? 1 : 0;
    if (px !== py) return py - px;
    const sd = speed(by) - speed(bx);
    if (sd !== 0) return sd;
    return rng() < 0.5 ? -1 : 1; // speed tie → random
  });

  for (const act of ordered) {
    const attacker = getB(act.side, act.actorIdx);
    if (!attacker || attacker.fainted) continue;
    // Resolve the move AUTHORITATIVELY by key from the move database — never trust
    // power/type/category present on the battler's move object (anti-cheat + enriches bare {key}).
    const ownKey = attacker.moves.find(m => (m.key || m) === act.moveKey);
    const auth = ownKey ? (moveData(ownKey.key || ownKey) || {}) : null;
    const move = auth ? { key: (ownKey.key || ownKey), ...auth } : null;
    let defender = getB(act.targetSide, act.targetIdx);
    // Retarget if chosen target fainted: pick first living on target side.
    if (!defender || defender.fainted) {
      const alt = state[act.targetSide].find(b => b && !b.fainted);
      if (alt) defender = alt;
    }
    if (move) resolveAttack(attacker, defender, move, rng, log);
  }

  // End-of-turn residuals (order by speed for determinism).
  [...state.a, ...state.b].filter(Boolean).sort((a,b)=>speed(b)-speed(a)).forEach(b => applyResidual(b, log));
  [...state.a, ...state.b].forEach(b => { if (b && b.hp<=0 && !b.fainted){ b.fainted=true; log.push({t:'faint',who:b.name}); } });

  const sideAlive = (side) => {
    const active = state[side] || [];
    const bench = state[benchKey(side)] || [];
    return active.some(b => b && !b.fainted) || bench.some(b => b && !b.fainted);
  };
  const aAlive = sideAlive('a');
  const bAlive = sideAlive('b');
  let over = false, winner = null;
  if (!aAlive || !bAlive) { over = true; winner = !aAlive && !bAlive ? 'draw' : (aAlive ? 'a' : 'b'); }

  const needReplace = { a: [], b: [] };
  if (!over) {
    for (const side of ['a', 'b']) {
      const active = state[side] || [];
      const bench = state[benchKey(side)] || [];
      const benchHasLiving = bench.some(b => b && !b.fainted);
      if (!benchHasLiving) continue;
      active.forEach((b, idx) => { if (!b || b.fainted) needReplace[side].push(idx); });
    }
  }
  return { log, over, winner, needReplace };
}

// A1: fill an empty active slot with a bench Pokémon (faint replacement).
function applyReplacement(state, side, actorIdx, benchIdx) {
  const benchK = side === 'a' ? 'benchA' : 'benchB';
  const bench = state[benchK] || [];
  const incoming = bench[benchIdx];
  const slot = state[side][actorIdx];
  if (!incoming || incoming.fainted) return [];
  if (slot && !slot.fainted) return [];
  state[side][actorIdx] = incoming;
  bench[benchIdx] = slot || null;
  return [{ t: 'sendin', who: incoming.name }];
}

// ---------- Build a team from saved instances (validates loadouts) ----------
function buildTeam(picks, level = 50) {
  // picks: [{ speciesId, instance }, ...]
  return picks.map(pk => {
    const inst = (typeof sanitizeInstance === 'function')
      ? sanitizeInstance(pk.speciesId, pk.instance || {})
      : (pk.instance || { moves: [], ability: null });
    return makeBattler(pk.speciesId, inst, level);
  }).filter(Boolean);
}

export { resolveTurn, buildTeam, makeBattler, makeRNG, typeMultiplier, applyReplacement };
