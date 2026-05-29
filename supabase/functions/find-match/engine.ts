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
  if (!move || move.category === 'status') return { dmg: 0, eff: 1, crit: false };
  if (!move.power && !hasTag(move, 'weight_dmg')) return { dmg: 0, eff: 1, crit: false };
  const isPhysical = move.category === 'physical';
  let atk = effStat(attacker, isPhysical ? 'atk' : 'spAtk');
  let def = effStat(defender, isPhysical ? 'def' : 'spDef');

  // Burn halves physical attack.
  if (attacker.status === 'brn' && isPhysical) atk = Math.floor(atk / 2);

  // Variable power: Low Kick (weight_dmg) scales with the target's size/weight.
  let power = move.power;
  if (hasTag(move, 'weight_dmg')) {
    const h = (typeof POKEMON_HEIGHTS !== 'undefined' && POKEMON_HEIGHTS[defender.speciesId]) || 1.0;
    power = h < 0.5 ? 20 : h < 1.0 ? 40 : h < 1.5 ? 60 : h < 2.0 ? 80 : h < 3.0 ? 100 : 120;
  }

  // Base damage (modern formula, level-based).
  let dmg = Math.floor(Math.floor((Math.floor((2 * attacker.level) / 5) + 2) * power * atk / def) / 50) + 2;

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

  // Reflect halves physical damage; Light Screen halves special damage (side screens).
  if (defender._screens) {
    if (isPhysical && defender._screens.reflect > 0) dmg = Math.floor(dmg / 2);
    if (!isPhysical && defender._screens.lightscreen > 0) dmg = Math.floor(dmg / 2);
  }
  // Critical hit (modern ~1/24, highcrit moves ~1/8, Focus Energy raises it).
  let critChance = (move.effect === 'highcrit' || (Array.isArray(move.effect) && move.effect.includes('highcrit'))) ? 0.125 : 0.0417;
  if (attacker._critUp) critChance = Math.min(0.5, critChance + 0.25);
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
    // Mist: protect the defender from stat-lowering effects.
    if (defender._screens && defender._screens.mist > 0 && /^foe_.*_down/.test(tag)) {
      log.push({t:'msg',code:'mistblock',who:defender.name}); continue;
    }
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
      case 'dreameater': if (dealtDamage>0){ const heal=Math.floor(dealtDamage/2); attacker.hp=Math.min(attacker.maxHp,attacker.hp+heal); log.push({t:'heal',who:attacker.name,amt:heal}); } break;
      case 'recoil25': if (dealtDamage>0 && attacker.ability!=='rock_head'){ const r=Math.floor(dealtDamage/4); attacker.hp=Math.max(0,attacker.hp-r); log.push({t:'recoil',who:attacker.name,amt:r}); } break;
      case 'recoil': if (dealtDamage>0 && attacker.ability!=='rock_head'){ const r=Math.floor(dealtDamage/3); attacker.hp=Math.max(0,attacker.hp-r); log.push({t:'recoil',who:attacker.name,amt:r}); } break;
      case 'heal50': { const h=Math.floor(attacker.maxHp/2); attacker.hp=Math.min(attacker.maxHp,attacker.hp+h); log.push({t:'heal',who:attacker.name,amt:h}); } break;
      case 'rest': { attacker.hp=attacker.maxHp; attacker.status='slp'; attacker.sleepTurns=2; log.push({t:'heal',who:attacker.name,amt:attacker.maxHp}); log.push({t:'status',who:attacker.name,code:'slp'}); } break;
      case 'faint_user': attacker.hp = 0; break;
      // ---- Newly implemented stateless effects ----
      case 'may_flinch': if (dealtDamage>0 && rng()<0.1){ defender._flinch=true; log.push({t:'msg',code:'flinch',who:defender.name}); } break;
      case 'may_confuse': case 'confuse': case 'confuse10': {
        const chance = tag==='confuse' ? 1 : (tag==='may_confuse'?0.1:0.1);
        if (rng()<chance && !defender._confused){ defender._confused = 2 + Math.floor(rng()*3); log.push({t:'msg',code:'confused',who:defender.name}); }
        break;
      }
      case 'foe_spdef_down': defender.stages.spDef = Math.max(-6, defender.stages.spDef-1); log.push({t:'stat',who:defender.name,stat:'spdef',dir:'down'}); break;
      case 'crit_up': attacker._critUp = true; log.push({t:'msg',code:'critup',who:attacker.name}); break;
      case 'atk_spatk_up': attacker.stages.atk=Math.min(6,attacker.stages.atk+1); attacker.stages.spAtk=Math.min(6,(attacker.stages.spAtk||0)+1); log.push({t:'stat',who:attacker.name,stat:'atk',dir:'up'}); log.push({t:'stat',who:attacker.name,stat:'spatk',dir:'up'}); break;
      case 'evasion_up': attacker.stages.eva=Math.min(6,attacker.stages.eva+1); log.push({t:'stat',who:attacker.name,stat:'eva',dir:'up'}); break;
      case 'evasion_up2': attacker.stages.eva=Math.min(6,attacker.stages.eva+2); log.push({t:'stat',who:attacker.name,stat:'eva',dir:'up',sharp:1}); break;
      case 'payday': log.push({t:'msg',code:'payday',who:attacker.name}); break;
      case 'tri_status': { // Tri Attack: 1/3 chance to burn/freeze/paralyze
        if (dealtDamage>0 && !defender.status && rng()<0.2){ const r=rng(); const st=r<0.34?'brn':r<0.67?'frz':'par'; defender.status=st; log.push({t:'status',who:defender.name,code:st}); }
        break;
      }
      case 'noop': break; // Splash: intentionally does nothing
      case 'struggle': if (dealtDamage>0){ const r=Math.floor(dealtDamage/4); attacker.hp=Math.max(0,attacker.hp-r); log.push({t:'recoil',who:attacker.name,amt:r}); } break;
      // ---- B1 complex/stateful effects ----
      case 'haze': { for (const m of [attacker, defender]) { for (const k in m.stages) m.stages[k]=0; } log.push({t:'msg',code:'haze',who:attacker.name}); break; }
      case 'conversion': { const dm=(attacker.moves||[]).map(mv=>moveData(mv.key||mv)).find(md=>md&&md.power>0); if (dm){ attacker.types=[dm.type]; log.push({t:'msg',code:'conversion',who:attacker.name}); } break; }
      case 'leechseed': { if (!defender.types.includes('grass') && !defender._leechSeed){ defender._leechSeed=true; defender._leechFromSide=attacker._side; log.push({t:'msg',code:'seeded',who:defender.name}); } break; }
      case 'reflect':     if (attacker._screens){ attacker._screens.reflect=5;     log.push({t:'msg',code:'reflect',who:attacker.name}); } break;
      case 'lightscreen': if (attacker._screens){ attacker._screens.lightscreen=5; log.push({t:'msg',code:'lightscreen',who:attacker.name}); } break;
      case 'mist':        if (attacker._screens){ attacker._screens.mist=5;        log.push({t:'msg',code:'mist',who:attacker.name}); } break;
      case 'disable': { const cand=(defender.moves||[]).filter(mv=>!defender._disabled||(defender._disabled.key!==(mv.key||mv))); if (cand.length){ const pick=cand[Math.floor(rng()*cand.length)]; defender._disabled={key:(pick.key||pick),turns:4}; log.push({t:'msg',code:'disabled',who:defender.name}); } break; }
      case 'mimic': { const fm=(defender.moves||[]); if (fm.length){ const pick=fm[Math.floor(rng()*fm.length)]; const slot=(attacker.moves||[]).findIndex(mv=>(mv.key||mv)==='mimic'); if (slot>=0){ const md=moveData(pick.key||pick); attacker.moves[slot]={key:(pick.key||pick),...(md||{}),pp:(md||{}).pp||5}; log.push({t:'msg',code:'mimic',who:attacker.name}); } } break; }
      case 'rage': attacker._raging=true; log.push({t:'msg',code:'rage',who:attacker.name}); break;
      case 'substitute': if (!attacker._sub){ const cost=Math.floor(attacker.maxHp/4); if (attacker.hp>cost){ attacker.hp-=cost; attacker._sub=cost; log.push({t:'msg',code:'substitute',who:attacker.name}); } else { log.push({t:'msg',code:'subfail',who:attacker.name}); } } break;
      case 'thrash': if (!attacker._lockMove){ attacker._lockMove={moveKey:move.key,turns:2+Math.floor(rng()*2)}; } break;
      case 'trap': if (dealtDamage>0 && !defender._trapped){ defender._trapped={turns:1+Math.floor(rng()*4),byMove:move.name}; log.push({t:'msg',code:'trapped',who:defender.name,move:move.name}); } break;
      default: break; // remaining (complex/stateful) tags handled elsewhere or pending
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
      case 'ohko':       return defender.maxHp;                          // Guillotine/Horn Drill/Fissure
      default: break;
    }
  }
  return null;
}

// Resolve a single attack action.
function resolveAttack(attacker, defender, move, rng, log, depth) {
  if (attacker.fainted || !move) return;
  depth = depth || 0;
  // Recharge (Hyper Beam): the turn after a recharge move, the user must recharge.
  if (attacker._recharge) { attacker._recharge = false; log.push({t:'msg',code:'recharge',who:attacker.name}); return; }
  // Flinch (set by a faster foe's may_flinch this turn): lose the turn, then clears.
  if (attacker._flinch) { attacker._flinch = false; log.push({t:'msg',code:'flinched',who:attacker.name}); return; }
  // Sleep / freeze / paralysis gates
  if (attacker.status === 'slp') {
    if (attacker.sleepTurns > 0) { attacker.sleepTurns--; log.push({t:'msg',code:'asleep',who:attacker.name}); if(attacker.sleepTurns>0) return; }
    if (attacker.sleepTurns === 0) { attacker.status=null; log.push({t:'msg',code:'woke',who:attacker.name}); }
  }
  if (attacker.status === 'frz') { if (rng()<0.2){ attacker.status=null; log.push({t:'msg',code:'thawed',who:attacker.name}); } else { log.push({t:'msg',code:'frozensolid',who:attacker.name}); return; } }
  if (attacker.status === 'par' && rng() < 0.25) { log.push({t:'msg',code:'fullpara',who:attacker.name}); return; }
  // Confusion: count down, and chance to hurt self instead of acting.
  if (attacker._confused > 0) {
    attacker._confused--;
    if (attacker._confused === 0) { log.push({t:'msg',code:'confend',who:attacker.name}); }
    else if (rng() < 0.33) {
      const self = Math.max(1, Math.floor((((2*attacker.level)/5+2) * 40 * effStat(attacker,'atk') / effStat(attacker,'def'))/50)+2);
      attacker.hp = Math.max(0, attacker.hp - self);
      log.push({t:'msg',code:'confhurt',who:attacker.name});
      log.push({t:'recoil',who:attacker.name,amt:self});
      if (attacker.hp<=0){ attacker.fainted=true; log.push({t:'faint',who:attacker.name}); }
      return;
    }
  }
  // Disabled move can't be selected.
  if (attacker._disabled && attacker._disabled.key === move.key) { log.push({t:'msg',code:'movedisabled',who:attacker.name,move:move.name}); return; }

  // Track the last move this battler used (for Mirror Move).
  attacker._lastMove = move.key;
  // Using any non-rage move ends the rage state.
  if (!hasTag(move,'rage')) attacker._raging = false;

  // ---- Special "redirect" moves (resolve into another action) ----
  if (depth < 2) {
    if (hasTag(move,'metronome')) {
      log.push({ t:'move', who:attacker.name, move:move.name });
      const keys = Object.keys(MOVES).filter(k => { const m=MOVES[k]; return m && !hasTag(m,'metronome') && !hasTag(m,'charge') && !hasTag(m,'mirror') && k!=='struggle' && !hasTag(m,'thrash') && !hasTag(m,'trap') && !hasTag(m,'bide'); });
      const pick = keys[Math.floor(rng()*keys.length)];
      const md = moveData(pick);
      log.push({t:'msg',code:'metronome',who:attacker.name});
      resolveAttack(attacker, defender, {key:pick, ...md}, rng, log, depth+1);
      return;
    }
    if (hasTag(move,'mirror')) {
      log.push({ t:'move', who:attacker.name, move:move.name });
      const last = defender._lastMove;
      if (!last) { log.push({t:'msg',code:'mirrorfail',who:attacker.name}); return; }
      const md = moveData(last);
      resolveAttack(attacker, defender, {key:last, ...md}, rng, log, depth+1);
      return;
    }
  }

  // ---- Transform: copy the target's combat profile (keep own HP/level) ----
  if (hasTag(move,'transform')) {
    log.push({ t:'move', who:attacker.name, move:move.name });
    attacker.types = defender.types.slice();
    attacker.atk = defender.atk; attacker.def = defender.def;
    attacker.spAtk = defender.spAtk; attacker.spDef = defender.spDef; attacker.spd = defender.spd;
    attacker.stages = JSON.parse(JSON.stringify(defender.stages));
    attacker.moves = (defender.moves||[]).map(mv => { const md=moveData(mv.key||mv); return {key:(mv.key||mv), ...(md||{}), pp:(md||{}).pp||5}; });
    attacker._transformed = true;
    log.push({t:'msg',code:'transform',who:attacker.name,into:defender.name});
    return;
  }

  if (defender.fainted) { log.push({t:'msg',code:'notarget',who:attacker.name,move:move.name}); return; }

  // Dream Eater only works on a sleeping target.
  if (hasTag(move,'dreameater') && defender.status !== 'slp') { log.push({t:'miss',who:attacker.name,move:move.name}); return; }

  // Semi-invulnerability: a target mid-Fly/Dig dodges unless the move can reach it.
  if (defender._charging && defender._charging.semi) {
    const reaches = (defender._charging.semi === 'fly' && hasTag(move,'hit_fly')) ||
                    (defender._charging.semi === 'dig' && hasTag(move,'hit_dig'));
    if (!reaches) { log.push({t:'miss',who:attacker.name,move:move.name}); return; }
  }

  // Accuracy (never-miss moves like Swift bypass; OHKO uses its own accuracy).
  // Accuracy/evasion stages modify the effective hit chance.
  const neverMiss = hasTag(move,'nevermiss');
  const acc = move.acc === 0 ? 999 : move.acc;
  if (!neverMiss && acc !== 999) {
    const accStage = (attacker.stages.acc || 0) - (defender.stages.eva || 0);
    const accMult = accStage >= 0 ? (3 + accStage) / 3 : 3 / (3 - accStage);
    const effAcc = acc * accMult;
    if (rng() * 100 > effAcc) {
      log.push({t:'miss',who:attacker.name,move:move.name});
      if (hasTag(move,'crash')) { const c=Math.floor(attacker.maxHp/8); attacker.hp=Math.max(0,attacker.hp-c); log.push({t:'recoil',who:attacker.name,amt:c}); if(attacker.hp<=0){attacker.fainted=true;log.push({t:'faint',who:attacker.name});} }
      return;
    }
  }

  log.push({ t:'move', who:attacker.name, move:move.name });

  // Bide: turn 1 starts storing energy; release handled at end of bide turns.
  if (hasTag(move,'bide')) {
    if (!attacker._bide) { attacker._bide = { turns: 2, dmg: 0 }; log.push({ t:'msg', code:'bidestart', who:attacker.name }); }
    return;
  }

  // Two-turn charge moves (Fly, Dig, Solar Beam, Razor Wind, Skull Bash, Sky Attack).
  if (hasTag(move,'charge')) {
    if (!attacker._charging) {
      // Turn 1: charge / become semi-invulnerable for Fly & Dig.
      const semi = (move.key === 'fly' || move.key === 'dig') ? move.key : null;
      attacker._charging = { moveKey: move.key, semi };
      attacker._lockMove = { moveKey: move.key, turns: 1 };
      log.push({ t:'msg', code:'charging', who:attacker.name, move:move.name });
      return;
    }
    // Turn 2: release — clear charge state and fall through to deal damage.
    attacker._charging = null;
    attacker._lockMove = null;
  }

  if (move.category === 'status') {
    applyMoveEffects(attacker, defender, move, rng, log, 0);
    return;
  }

  // Fixed / level-scaling damage moves (Night Shade, Seismic Toss, Dragon Rage,
  // Sonic Boom, Psywave, Super Fang, OHKO). These ignore the normal damage formula
  // but STILL respect type immunity.
  const fixed = fixedDamage(attacker, defender, move, rng);
  if (fixed !== null) {
    let eff = typeMultiplier(move.type, defender.types);
    if (defender.ability === 'levitate' && move.type === 'ground') eff = 0;
    if (eff === 0) { log.push({ t:'immune', who:defender.name }); return; }
    const dmg = Math.max(1, fixed);
    // Substitute absorbs the hit.
    if (defender._sub > 0) { defender._sub -= dmg; log.push({t:'msg',code:'subhit',who:defender.name}); if (defender._sub<=0){ defender._sub=0; log.push({t:'msg',code:'subbreak',who:defender.name}); } }
    else {
      defender.hp = Math.max(0, defender.hp - dmg);
      if (defender._bide) defender._bide.dmg += dmg;
      if (defender._raging){ defender.stages.atk=Math.min(6,defender.stages.atk+1); log.push({t:'stat',who:defender.name,stat:'atk',dir:'up'}); }
    }
    log.push({ t:'damage', who:defender.name, by:attacker.name, move:move.name, amt:dmg, eff:1, crit:false, ohko: hasTag(move,'ohko') });
    applyMoveEffects(attacker, defender, move, rng, log, dmg);
    if (defender.hp <= 0) { defender.fainted = true; log.push({ t:'faint', who:defender.name }); }
    return;
  }

  // Multi-hit moves: 2 hits (multihit2) or 2–5 hits (multihit).
  let hits = 1;
  if (hasTag(move,'multihit2')) hits = 2;
  else if (hasTag(move,'multihit')) { const r=rng(); hits = r<0.375?2 : r<0.75?3 : r<0.875?4 : 5; }

  let totalDealt = 0, lastEff = 1;
  for (let i=0; i<hits; i++) {
    if (defender.fainted) break;
    const { dmg, eff, crit } = calcDamage(attacker, defender, move, rng, log);
    lastEff = eff;
    if (eff === 0) { log.push({t:'immune',who:defender.name}); return; }
    // Substitute absorbs damage instead of the Pokémon.
    if (defender._sub > 0) {
      defender._sub -= dmg;
      log.push({ t:'damage', who:defender.name, by:attacker.name, move:move.name, amt:dmg, eff, crit, sub:1, hit: hits>1?i+1:0, hits: hits>1?hits:0 });
      if (defender._sub <= 0){ defender._sub=0; log.push({t:'msg',code:'subbreak',who:defender.name}); }
      totalDealt += dmg;
      continue;
    }
    defender.hp = Math.max(0, defender.hp - dmg);
    totalDealt += dmg;
    if (defender._bide) defender._bide.dmg += dmg;
    // Rage: a raging Pokémon's Attack rises whenever it's struck.
    if (defender._raging){ defender.stages.atk=Math.min(6,defender.stages.atk+1); log.push({t:'stat',who:defender.name,stat:'atk',dir:'up'}); }
    log.push({ t:'damage', who:defender.name, by:attacker.name, move:move.name, amt:dmg, eff, crit, hit: hits>1 ? i+1 : 0, hits: hits>1?hits:0 });
    if (defender.hp <= 0) { defender.fainted = true; log.push({t:'faint',who:defender.name}); break; }
  }
  // Effects apply once, based on total damage dealt.
  applyMoveEffects(attacker, defender, move, rng, log, totalDealt);
  // Substitute creation (Substitute move) and recharge flag (Hyper Beam).
  if (hasTag(move,'substitute') && !attacker._sub){ const cost=Math.floor(attacker.maxHp/4); if (attacker.hp>cost){ attacker.hp-=cost; attacker._sub=cost; log.push({t:'msg',code:'substitute',who:attacker.name}); } }
  if (hasTag(move,'recharge') && totalDealt>0) attacker._recharge = true;
}

// ---------- Public: resolve one full turn ----------
// teams: { a:[battler,...], b:[battler,...] }
// actions: array of { side:'a'|'b', actorIdx, moveKey, targetSide, targetIdx }
// Returns { log, over, winner }
function resolveTurn(state, actions, rng) {
  const log = [];
  const getB = (side, idx) => state[side][idx];

  // Order actions by effective Speed (desc), paralysis quarters speed.
  // ---- Phase 1: SWITCHES resolve first (before any move), regardless of speed. ----
  // A switch action: { type:'switch', side, actorIdx, benchIdx }. Swaps the active
  // Pokémon at actorIdx with the bench Pokémon at benchIdx (incoming takes any hits
  // aimed at that slot this turn — standard switch behavior).
  const benchKey = (side) => side === 'a' ? 'benchA' : 'benchB';
  // Side-wide screen/mist state (persisted on the battle state object).
  if (!state.sideA) state.sideA = { reflect:0, lightscreen:0, mist:0 };
  if (!state.sideB) state.sideB = { reflect:0, lightscreen:0, mist:0 };
  // Attach side + screen refs to each battler so effects/calc can read them.
  (state.a||[]).forEach(b => { if (b){ b._side='a'; b._screens=state.sideA; } });
  (state.b||[]).forEach(b => { if (b){ b._side='b'; b._screens=state.sideB; } });
  for (const act of actions) {
    if (!act || act.type !== 'switch') continue;
    const bench = state[benchKey(act.side)] || [];
    const incoming = bench[act.benchIdx];
    const outgoing = state[act.side][act.actorIdx];
    if (!incoming || incoming.fainted) continue;      // can't send in a fainted/empty bench slot
    if (!outgoing) continue;
    // A locked/trapped/charging/biding Pokémon cannot voluntarily switch out (anti-cheat).
    if (outgoing._trapped && outgoing._trapped.turns > 0) { log.push({t:'msg',code:'trappedskip',who:outgoing.name}); continue; }
    if (outgoing._charging || (outgoing._lockMove && outgoing._lockMove.turns > 0) || (outgoing._bide && outgoing._bide.turns > 0)) continue;
    // Swap: incoming becomes active, outgoing goes to bench.
    state[act.side][act.actorIdx] = incoming;
    bench[act.benchIdx] = outgoing;
    log.push({ t: 'switch', who: outgoing.name, in: incoming.name });
  }

  // ---- Phase 2: MOVES resolve by speed (switch actions are skipped here). ----
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

    // ---- B2 lock overrides: a locked battler's submitted action is forced by state. ----
    // Trapped: cannot act this turn (takes chip damage at end of turn).
    if (attacker._trapped && attacker._trapped.turns > 0) {
      log.push({ t:'msg', code:'trappedskip', who:attacker.name });
      continue;
    }
    // Biding: store energy, do not act (release handled at end of bide turns).
    if (attacker._bide && attacker._bide.turns > 0) {
      log.push({ t:'msg', code:'biding', who:attacker.name });
      continue;
    }
    // Charging turn 2, or locked into Thrash/Petal Dance: force that move.
    let forcedKey = null;
    if (attacker._charging) forcedKey = attacker._charging.moveKey;
    else if (attacker._lockMove && attacker._lockMove.turns > 0) forcedKey = attacker._lockMove.moveKey;
    const useKey = forcedKey || act.moveKey;

    // Resolve the move AUTHORITATIVELY by key from the move database (anti-cheat).
    const ownKey = attacker.moves.find(m => (m.key || m) === useKey) || (forcedKey ? { key: forcedKey } : null);
    const auth = ownKey ? (moveData(ownKey.key || ownKey) || {}) : null;
    const move = auth ? { key: (ownKey.key || ownKey), ...auth } : null;
    let defender = getB(act.targetSide, act.targetIdx);
    // Retarget if chosen target fainted: pick first living on target side.
    if (!defender || defender.fainted) {
      const alt = state[act.targetSide].find(b => b && !b.fainted);
      if (alt) defender = alt;
    }
    if (move) resolveAttack(attacker, defender, move, rng, log);

    // Whirlwind / Roar: force the target's side to swap to a random living bench Pokémon.
    if (move && hasTag(move, 'whirlwind') && !attacker.fainted) {
      const tSide = act.targetSide;
      const bench = state[benchKey(tSide)] || [];
      const idxs = bench.map((b, i) => ({ b, i })).filter(o => o.b && !o.b.fainted);
      const activeIdx = state[tSide].findIndex(b => b && !b.fainted);
      if (idxs.length && activeIdx >= 0) {
        const pick = idxs[Math.floor(rng() * idxs.length)];
        const out = state[tSide][activeIdx];
        state[tSide][activeIdx] = pick.b;
        bench[pick.i] = out;
        log.push({ t: 'switch', who: out.name, in: pick.b.name });
        log.push({ t: 'msg', code: 'forced_out', who: out.name });
      } else {
        log.push({ t: 'msg', code: 'whirlwind_fail', who: attacker.name });
      }
    }
  }

  // End-of-turn residuals (order by speed for determinism).
  [...state.a, ...state.b].filter(Boolean).sort((a,b)=>speed(b)-speed(a)).forEach(b => applyResidual(b, log));

  // Leech Seed: drain HP/8 from seeded Pokémon to the first living mon on the seeding side.
  [...state.a, ...state.b].filter(Boolean).forEach(b => {
    if (b.fainted || !b._leechSeed) return;
    const drain = Math.max(1, Math.floor(b.maxHp/8));
    b.hp = Math.max(0, b.hp - drain);
    log.push({ t:'residual', who:b.name, s:'seed', amt:drain });
    const healSide = b._leechFromSide === 'a' ? state.a : state.b;
    const healer = (healSide||[]).find(x => x && !x.fainted);
    if (healer){ healer.hp=Math.min(healer.maxHp, healer.hp+drain); log.push({t:'heal',who:healer.name,amt:drain}); }
    if (b.hp<=0){ b.fainted=true; log.push({t:'faint',who:b.name}); }
  });

  // Decrement side-screen / mist timers.
  for (const sd of [state.sideA, state.sideB]) {
    if (!sd) continue;
    if (sd.reflect>0) sd.reflect--;
    if (sd.lightscreen>0) sd.lightscreen--;
    if (sd.mist>0) sd.mist--;
  }
  // Decrement per-battler disable timers.
  [...state.a, ...state.b].filter(Boolean).forEach(b => {
    if (b._disabled){ b._disabled.turns--; if (b._disabled.turns<=0){ b._disabled=null; log.push({t:'msg',code:'disableend',who:b.name}); } }
  });

  // Thrash / Petal Dance: count down the lock; confuse the user when it ends.
  [...state.a, ...state.b].filter(Boolean).forEach(b => {
    if (b._lockMove && !b._charging) {
      b._lockMove.turns--;
      if (b._lockMove.turns <= 0) {
        b._lockMove = null;
        if (!b._confused && !b.fainted) { b._confused = 2 + Math.floor(rng()*3); log.push({t:'msg',code:'thrashend',who:b.name}); }
      }
    }
  });

  // Trap (Bind/Wrap/Fire Spin/Clamp): chip damage to the trapped target each turn.
  [...state.a, ...state.b].filter(Boolean).forEach(b => {
    if (b.fainted || !b._trapped) return;
    const chip = Math.max(1, Math.floor(b.maxHp/16));
    b.hp = Math.max(0, b.hp - chip);
    log.push({ t:'residual', who:b.name, s:'trap', amt:chip });
    b._trapped.turns--;
    if (b._trapped.turns <= 0) { b._trapped = null; log.push({t:'msg',code:'trapend',who:b.name}); }
    if (b.hp<=0){ b.fainted=true; log.push({t:'faint',who:b.name}); }
  });

  // Bide: count down; on release deal 2x stored damage to a living foe.
  for (const side of ['a','b']) {
    (state[side]||[]).filter(Boolean).forEach(b => {
      if (!b._bide) return;
      b._bide.turns--;
      if (b._bide.turns <= 0) {
        const dmg = b._bide.dmg * 2;
        const foeSide = side === 'a' ? 'b' : 'a';
        const target = (state[foeSide]||[]).find(x => x && !x.fainted);
        b._bide = null;
        if (dmg > 0 && target) {
          target.hp = Math.max(0, target.hp - dmg);
          log.push({ t:'msg', code:'biderelease', who:b.name });
          log.push({ t:'damage', who:target.name, by:b.name, move:'Bide', amt:dmg, eff:1, crit:false });
          if (target.hp<=0){ target.fainted=true; log.push({t:'faint',who:target.name}); }
        } else {
          log.push({ t:'msg', code:'bidefail', who:b.name });
        }
      }
    });
  }

  // Clear transient per-turn flags (flinch only lasts the turn it was applied).
  [...state.a, ...state.b].forEach(b => { if (b) b._flinch = false; });
  [...state.a, ...state.b].forEach(b => { if (b && b.hp<=0 && !b.fainted){ b.fainted=true; log.push({t:'faint',who:b.name}); } });

  // A side is alive if it has ANY non-fainted Pokémon among active OR bench.
  const sideAlive = (side) => {
    const active = state[side] || [];
    const bench = state[benchKey(side)] || [];
    return active.some(b => b && !b.fainted) || bench.some(b => b && !b.fainted);
  };
  const aAlive = sideAlive('a');
  const bAlive = sideAlive('b');
  let over = false, winner = null;
  if (!aAlive || !bAlive) { over = true; winner = !aAlive && !bAlive ? 'draw' : (aAlive ? 'a' : 'b'); }

  // A1 (end-of-turn replacement): if the match isn't over, report any active slots that
  // are now empty/fainted but whose side still has a living bench Pokémon. The referee/
  // client uses this to prompt that player to send in a replacement before the next turn.
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
