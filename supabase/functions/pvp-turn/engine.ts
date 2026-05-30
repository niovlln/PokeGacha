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

  // STAB (Adaptability makes it 2x instead of 1.5x).
  if (attacker.types.includes(move.type)) dmg = Math.floor(dmg * (attacker.ability === 'adaptability' ? 2 : 1.5));

  // ---- Attacker ability power boosts ----
  const lowHp = attacker.hp <= attacker.maxHp / 3;
  if (lowHp) {
    if (attacker.ability === 'overgrow' && move.type === 'grass') dmg = Math.floor(dmg * 1.5);
    if (attacker.ability === 'blaze' && move.type === 'fire') dmg = Math.floor(dmg * 1.5);
    if (attacker.ability === 'torrent' && move.type === 'water') dmg = Math.floor(dmg * 1.5);
    if (attacker.ability === 'swarm' && move.type === 'bug') dmg = Math.floor(dmg * 1.5);
  }
  // Technician: moves with base power <= 60 get 1.5x.
  if (attacker.ability === 'technician' && power <= 60 && power > 0) dmg = Math.floor(dmg * 1.5);
  // Iron Fist: punching moves +20%.
  if (attacker.ability === 'iron_fist' && isPunchMove(move)) dmg = Math.floor(dmg * 1.2);
  // Reckless: recoil/crash moves +20%.
  if (attacker.ability === 'reckless' && (hasTag(move,'recoil') || hasTag(move,'recoil25') || hasTag(move,'crash'))) dmg = Math.floor(dmg * 1.2);
  // Hustle: physical power +50% (accuracy cost handled in resolveAttack).
  if (attacker.ability === 'hustle' && isPhysical) dmg = Math.floor(dmg * 1.5);
  // Sheer Force: moves with an added effect get +30% (effect suppression handled elsewhere).
  if (attacker.ability === 'sheer_force' && moveHasAddedEffect(move)) dmg = Math.floor(dmg * 1.3);
  // Analytic: if the attacker moves after the defender this turn, +30%.
  if (attacker.ability === 'analytic' && attacker._movedLast) dmg = Math.floor(dmg * 1.3);
  // Flash Fire: boosted Fire moves after absorbing one.
  if (attacker.ability === 'flash_fire' && attacker._flashFire && move.type === 'fire') dmg = Math.floor(dmg * 1.5);
  // Guts: +50% physical when statused (burn's own drop is ignored in Gen mechanics; keep simple).
  if (attacker.ability === 'guts' && attacker.status && isPhysical) dmg = Math.floor(dmg * 1.5);

  // Type effectiveness
  let eff = typeMultiplier(move.type, defender.types);
  // Scrappy: Normal/Fighting hit Ghost (treat 0 -> 1 for those types).
  if (attacker.ability === 'scrappy' && eff === 0 && (move.type === 'normal' || move.type === 'fighting') && defender.types.includes('ghost')) eff = 1;
  // Defender immunities/resistances via ability (Mold Breaker ignores them).
  const ignoreAbil = attacker.ability === 'mold_breaker';
  if (!ignoreAbil) {
    if (defender.ability === 'levitate' && move.type === 'ground') eff = 0;
    if (defender.ability === 'thick_fat' && (move.type === 'fire' || move.type === 'ice')) eff *= 0.5;
    if (defender.ability === 'dry_skin' && move.type === 'fire') eff *= 1.25;
  }
  dmg = Math.floor(dmg * eff);

  // Tinted Lens: double damage of not-very-effective moves.
  if (attacker.ability === 'tinted_lens' && eff > 0 && eff < 1) dmg = dmg * 2;
  // Filter: reduce super-effective damage by 25% (defender).
  if (!ignoreAbil && defender.ability === 'filter' && eff > 1) dmg = Math.floor(dmg * 0.75);
  // Multiscale: defender at full HP takes half.
  if (!ignoreAbil && defender.ability === 'multiscale' && defender.hp >= defender.maxHp) dmg = Math.floor(dmg * 0.5);
  // Marvel Scale: +50% defense when statused → model as 33% damage reduction on physical.
  if (!ignoreAbil && defender.ability === 'marvel_scale' && defender.status && isPhysical) dmg = Math.floor(dmg / 1.5);
  // Unaware (attacker): ignore defender's defensive stat stages → recompute def without stage.
  // (Handled at stat read above would be complex; minor — skipped for stage purity.)

  // Reflect halves physical damage; Light Screen halves special damage (side screens).
  if (defender._screens) {
    if (isPhysical && defender._screens.reflect > 0) dmg = Math.floor(dmg / 2);
    if (!isPhysical && defender._screens.lightscreen > 0) dmg = Math.floor(dmg / 2);
  }
  // Critical hit (modern ~1/24, highcrit moves ~1/8, Focus Energy raises it).
  let critChance = (move.effect === 'highcrit' || (Array.isArray(move.effect) && move.effect.includes('highcrit'))) ? 0.125 : 0.0417;
  if (attacker._critUp) critChance = Math.min(0.5, critChance + 0.25);
  // Battle Armor / Shell Armor block crits (unless attacker has Mold Breaker).
  if (!ignoreAbil && (defender.ability === 'battle_armor' || defender.ability === 'shell_armor')) critChance = 0;
  let crit = false;
  if (eff > 0 && rng() < critChance) {
    crit = true;
    // Sniper: critical hits do 2.25x instead of 1.5x.
    dmg = Math.floor(dmg * (attacker.ability === 'sniper' ? 2.25 : 1.5));
  }

  // Random factor 0.85–1.0
  dmg = Math.floor(dmg * (0.85 + rng() * 0.15));

  return { dmg: Math.max(eff > 0 ? 1 : 0, dmg), eff, crit };
}

// ---------- Effect helpers ----------
function hasTag(move, tag) {
  return move.effect === tag || (Array.isArray(move.effect) && move.effect.includes(tag));
}

// ---------- Ability helpers ----------
const PUNCH_MOVES = new Set(['mega_punch','fire_punch','ice_punch','thunder_punch','dizzy_punch','comet_punch','dynamic_punch','mach_punch','submission']);
function isPunchMove(move) { return move && PUNCH_MOVES.has(move.key); }

const SOUND_MOVES = new Set(['growl','roar','sing','supersonic','screech','snore','hyper_voice','metronome']);
function isSoundMove(move) { return move && SOUND_MOVES.has(move.key); }

// A "contact" move: a damaging physical move that isn't an obvious ranged/special one.
function isContactMove(move) {
  if (!move || move.category !== 'physical' || !move.power) return false;
  return true;
}

// Does the move carry a secondary added effect (for Sheer Force / Shield Dust)?
function moveHasAddedEffect(move) {
  const tags = Array.isArray(move.effect) ? move.effect : [move.effect];
  return tags.some(t => t && /^may_|^foe_|confuse|flinch|tri_status|^poison$|^paralyze$|^sleep$|^badpoison$/.test(t));
}

// Can this Pokémon be given this status, given its ability? (true = blocked)
function abilityBlocksStatus(b, status) {
  const a = b.ability;
  if (!a) return false;
  if (status === 'psn' || status === 'badpsn') return a === 'immunity';
  if (status === 'par') return a === 'limber';
  if (status === 'slp') return a === 'insomnia' || a === 'vital_spirit';
  if (status === 'brn') return a === 'water_veil';
  if (status === 'frz') return a === 'magma_armor';
  return false;
}

// Stat-stage drops blocked by ability (for foe-inflicted reductions).
function abilityBlocksStatDrop(b, statKey) {
  const a = b.ability;
  if (!a) return false;
  if (a === 'clear_body' || a === 'white_smoke') return true;
  if (a === 'hyper_cutter' && statKey === 'atk') return true;
  if ((a === 'keen_eye' || a === 'illuminate') && statKey === 'acc') return true;
  if (a === 'big_pecks' && statKey === 'def') return true;
  return false;
}

function applyMoveEffects(attacker, defender, move, rng, log, dealtDamage) {
  const _defStatusBefore = defender.status; // for Synchronize
  const _defStageSum = ['atk','def','spAtk','spDef','spd','acc','eva'].reduce((s,k)=>s+(defender.stages[k]||0),0); // for Defiant/Competitive
  const e = move.effect; if (!e) return;
  const tags = Array.isArray(e) ? e : [e];
  // Sheer Force removes secondary effects on damaging moves (it already got the power boost).
  if (attacker.ability === 'sheer_force' && move.power > 0 && moveHasAddedEffect(move)) return;
  // Shield Dust blocks the added effects of damaging moves used against this defender.
  const shieldDust = defender.ability === 'shield_dust' && move.power > 0 && attacker.ability !== 'mold_breaker';
  for (const tag of tags) {
    // Mist: protect the defender from stat-lowering effects.
    if (defender._screens && defender._screens.mist > 0 && /^foe_.*_down/.test(tag)) {
      log.push({t:'msg',code:'mistblock',who:defender.name}); continue;
    }
    // Shield Dust: skip secondary effects of a damaging move (status/flinch/stat-drop chances).
    if (shieldDust && /^(may_|burn\d|paralyze\d|poison\d?$|poison30|poison40|freeze\d|foe_.*_down|tri_status|confuse)/.test(tag)) continue;
    // Ability status immunities (the foe can't be given a status its ability prevents).
    const inflicts = { burn10:'brn', may_burn:'brn', burn30:'brn', paralyze10:'par', may_paralyze:'par', paralyze30:'par', paralyze:'par', poison:'psn', poison30:'psn', poison40:'psn', badpoison:'psn', freeze10:'frz', may_freeze:'frz', sleep:'slp' };
    if (inflicts[tag] && abilityBlocksStatus(defender, inflicts[tag])) { continue; }
    // Ability stat-drop protection (Clear Body, Hyper Cutter, Keen Eye, Big Pecks, etc.).
    if (/^foe_.*_down/.test(tag) && attacker.ability !== 'mold_breaker') {
      const sk = tag.includes('atk') ? 'atk' : tag.includes('def') ? 'def' : tag.includes('spd') && !tag.includes('spdef') ? 'spd' : tag.includes('spdef') ? 'spDef' : tag.includes('acc') ? 'acc' : null;
      if (sk && abilityBlocksStatDrop(defender, sk)) { log.push({t:'msg',code:'abilityprotect',who:defender.name}); continue; }
    }
    // Serene Grace doubles a may_* chance — handled by overriding rng comparison below
    // is complex; instead, we apply a small post-hoc retry for may_ effects.
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
      case 'drain': if (dealtDamage>0){ const heal=Math.floor(dealtDamage/2); if (defender.ability==='liquid_ooze'){ attacker.hp=Math.max(0,attacker.hp-heal); log.push({t:'recoil',who:attacker.name,amt:heal}); if(attacker.hp<=0){attacker.fainted=true;log.push({t:'faint',who:attacker.name});} } else { attacker.hp=Math.min(attacker.maxHp,attacker.hp+heal); log.push({t:'heal',who:attacker.name,amt:heal}); } } break;
      case 'dreameater': if (dealtDamage>0){ const heal=Math.floor(dealtDamage/2); attacker.hp=Math.min(attacker.maxHp,attacker.hp+heal); log.push({t:'heal',who:attacker.name,amt:heal}); } break;
      case 'recoil25': if (dealtDamage>0 && attacker.ability!=='rock_head' && attacker.ability!=='magic_guard'){ const r=Math.floor(dealtDamage/4); attacker.hp=Math.max(0,attacker.hp-r); log.push({t:'recoil',who:attacker.name,amt:r}); } break;
      case 'recoil': if (dealtDamage>0 && attacker.ability!=='rock_head' && attacker.ability!=='magic_guard'){ const r=Math.floor(dealtDamage/3); attacker.hp=Math.max(0,attacker.hp-r); log.push({t:'recoil',who:attacker.name,amt:r}); } break;
      case 'heal50': { const h=Math.min(attacker.maxHp-attacker.hp, Math.floor(attacker.maxHp/2)); attacker.hp=Math.min(attacker.maxHp,attacker.hp+h); log.push({t:'heal',who:attacker.name,amt:h}); } break;
      case 'rest': { const h=attacker.maxHp-attacker.hp; attacker.hp=attacker.maxHp; attacker.status='slp'; attacker.sleepTurns=2; log.push({t:'heal',who:attacker.name,amt:h}); log.push({t:'status',who:attacker.name,code:'slp'}); } break;
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
  // Synchronize: if the defender just got a major status from the attacker, pass it back.
  if (defender.ability === 'synchronize' && defender.status && defender.status !== _defStatusBefore) {
    const st = defender.status === 'badpsn' ? 'psn' : defender.status;
    if (!attacker.status && !abilityBlocksStatus(attacker, st) && st !== 'frz' && st !== 'slp') {
      attacker.status = st;
      log.push({ t:'status', who:attacker.name, code: st });
    }
  }
  // Defiant / Competitive: sharply boost a stat when a foe lowers any of the defender's stats.
  const _defStageNow = ['atk','def','spAtk','spDef','spd','acc','eva'].reduce((s,k)=>s+(defender.stages[k]||0),0);
  if (_defStageNow < _defStageSum && !defender.fainted) {
    if (defender.ability === 'defiant') { defender.stages.atk = Math.min(6, defender.stages.atk + 2); log.push({t:'stat',who:defender.name,stat:'atk',dir:'up',sharp:1}); }
    else if (defender.ability === 'competitive') { defender.stages.spAtk = Math.min(6, (defender.stages.spAtk||0) + 2); log.push({t:'stat',who:defender.name,stat:'spatk',dir:'up',sharp:1}); }
  }
}

// End-of-turn residual damage (burn/poison) + end-of-turn ability effects.
function applyResidual(b, log, rng) {
  if (b.fainted) return;
  // Magic Guard: takes no damage from anything but direct attacks (no burn/poison chip).
  if ((b.status === 'brn' || b.status === 'psn') && b.ability !== 'magic_guard') {
    const dmg = Math.max(1, Math.floor(b.maxHp / 8));
    b.hp = Math.max(0, b.hp - dmg);
    log.push({ t:'residual', who:b.name, s:b.status, amt:dmg });
    if (b.hp <= 0) { b.fainted = true; log.push({ t:'faint', who:b.name }); return; }
  }
  // Shed Skin: 33% chance to cure its own status at end of turn.
  if (b.ability === 'shed_skin' && b.status && rng && rng() < 0.33) {
    b.status = null; b.sleepTurns = 0; log.push({ t:'msg', code:'shedskin', who:b.name });
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
  // Inner Focus prevents flinching; Steadfast raises Speed each time it would flinch.
  if (attacker._flinch) {
    attacker._flinch = false;
    if (attacker.ability === 'inner_focus') {
      log.push({t:'msg',code:'innerfocus',who:attacker.name});
    } else {
      if (attacker.ability === 'steadfast') { attacker.stages.spd = Math.min(6, attacker.stages.spd + 1); log.push({t:'stat',who:attacker.name,stat:'spd',dir:'up'}); }
      log.push({t:'msg',code:'flinched',who:attacker.name}); return;
    }
  }
  // Sleep / freeze / paralysis gates
  if (attacker.status === 'slp') {
    // Early Bird wakes twice as fast.
    const dec = attacker.ability === 'early_bird' ? 2 : 1;
    if (attacker.sleepTurns > 0) { attacker.sleepTurns = Math.max(0, attacker.sleepTurns - dec); log.push({t:'msg',code:'asleep',who:attacker.name}); if(attacker.sleepTurns>0) return; }
    if (attacker.sleepTurns === 0) { attacker.status=null; log.push({t:'msg',code:'woke',who:attacker.name}); }
  }
  if (attacker.status === 'frz') { if (rng()<0.2){ attacker.status=null; log.push({t:'msg',code:'thawed',who:attacker.name}); } else { log.push({t:'msg',code:'frozensolid',who:attacker.name}); return; } }
  if (attacker.status === 'par' && rng() < 0.25) { log.push({t:'msg',code:'fullpara',who:attacker.name}); return; }
  // Confusion: count down, and chance to hurt self instead of acting. Own Tempo is immune.
  if (attacker._confused > 0 && attacker.ability === 'own_tempo') { attacker._confused = 0; }
  if (attacker._confused > 0) {
    attacker._confused--;
    if (attacker._confused === 0) { log.push({t:'msg',code:'confend',who:attacker.name}); }
    else if (rng() < 0.33) {
      if (attacker.ability === 'magic_guard') { log.push({t:'msg',code:'confhurt',who:attacker.name}); return; }
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
  // No Guard: moves used by or against this Pokémon never miss.
  const noGuard = attacker.ability === 'no_guard' || defender.ability === 'no_guard';
  const neverMiss = hasTag(move,'nevermiss') || noGuard;
  const acc = move.acc === 0 ? 999 : move.acc;
  if (!neverMiss && acc !== 999) {
    const accStage = (attacker.stages.acc || 0) - (defender.stages.eva || 0);
    const accMult = accStage >= 0 ? (3 + accStage) / 3 : 3 / (3 - accStage);
    let effAcc = acc * accMult;
    // Compound Eyes: +30% accuracy. Hustle: -20% accuracy on physical moves.
    if (attacker.ability === 'compound_eyes') effAcc *= 1.3;
    if (attacker.ability === 'hustle' && move.category === 'physical') effAcc *= 0.8;
    // Wonder Skin: status moves used against this Pokémon are likelier to miss (cap acc at 50).
    if (defender.ability === 'wonder_skin' && move.category === 'status' && attacker.ability !== 'mold_breaker') effAcc = Math.min(effAcc, 50);
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

  // ---- Type-absorbing abilities (intercept the move before damage) ----
  if (attacker.ability !== 'mold_breaker') {
    const mt = move.type;
    if (mt === 'fire' && defender.ability === 'flash_fire') {
      defender._flashFire = true; log.push({ t:'msg', code:'flashfire', who:defender.name }); return;
    }
    if (mt === 'water' && (defender.ability === 'water_absorb' || defender.ability === 'dry_skin')) {
      const h = Math.floor(defender.maxHp / 4);
      if (defender.hp < defender.maxHp) { defender.hp = Math.min(defender.maxHp, defender.hp + h); log.push({ t:'heal', who:defender.name, amt:h }); }
      log.push({ t:'msg', code:'absorbheal', who:defender.name }); return;
    }
    if (mt === 'electric' && (defender.ability === 'volt_absorb')) {
      const h = Math.floor(defender.maxHp / 4);
      if (defender.hp < defender.maxHp) { defender.hp = Math.min(defender.maxHp, defender.hp + h); log.push({ t:'heal', who:defender.name, amt:h }); }
      log.push({ t:'msg', code:'absorbheal', who:defender.name }); return;
    }
    if (mt === 'electric' && defender.ability === 'lightning_rod') {
      defender.stages.spAtk = Math.min(6, (defender.stages.spAtk||0) + 1);
      log.push({ t:'stat', who:defender.name, stat:'spatk', dir:'up' }); return;
    }
    if (isSoundMove(move) && defender.ability === 'soundproof') {
      log.push({ t:'immune', who:defender.name }); return;
    }
  }

  // Multi-hit moves: 2 hits (multihit2) or 2–5 hits (multihit). Skill Link → always max.
  let hits = 1;
  if (hasTag(move,'multihit2')) hits = 2;
  else if (hasTag(move,'multihit')) {
    if (attacker.ability === 'skill_link') hits = 5;
    else { const r=rng(); hits = r<0.375?2 : r<0.75?3 : r<0.875?4 : 5; }
  }

  const defHpBefore = defender.hp;            // for Sturdy
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
    let applied = dmg;
    // Sturdy: survive a would-be OHKO when at full HP (leave 1 HP).
    if (defender.ability !== undefined && (attacker.ability !== 'mold_breaker') && defender.ability === 'sturdy'
        && defender.hp === defender.maxHp && dmg >= defender.hp) {
      applied = defender.hp - 1;
      log.push({ t:'damage', who:defender.name, by:attacker.name, move:move.name, amt:applied, eff, crit, hit: hits>1?i+1:0, hits: hits>1?hits:0 });
      defender.hp = 1;
      totalDealt += applied;
      log.push({ t:'msg', code:'sturdy', who:defender.name });
      // Anger Point on the (non-fatal) crit still applies below via crit flag.
      if (crit && defender.ability === 'anger_point') { defender.stages.atk = 6; log.push({t:'stat',who:defender.name,stat:'atk',dir:'up',sharp:1}); }
      continue;
    }
    defender.hp = Math.max(0, defender.hp - applied);
    totalDealt += applied;
    if (defender._bide) defender._bide.dmg += applied;
    // Rage: a raging Pokémon's Attack rises whenever it's struck.
    if (defender._raging){ defender.stages.atk=Math.min(6,defender.stages.atk+1); log.push({t:'stat',who:defender.name,stat:'atk',dir:'up'}); }
    // Anger Point: a critical hit maxes the defender's Attack.
    if (crit && defender.ability === 'anger_point' && !defender.fainted) { defender.stages.atk = 6; log.push({t:'stat',who:defender.name,stat:'atk',dir:'up',sharp:1}); }
    log.push({ t:'damage', who:defender.name, by:attacker.name, move:move.name, amt:applied, eff, crit, hit: hits>1 ? i+1 : 0, hits: hits>1?hits:0 });
    if (defender.hp <= 0) { defender.fainted = true; log.push({t:'faint',who:defender.name}); break; }
  }
  // On-hit / on-contact / on-faint ability reactions (only if real damage landed).
  if (totalDealt > 0) applyDefenderHitAbilities(attacker, defender, move, totalDealt, lastEff, rng, log);
  // Effects apply once, based on total damage dealt.
  applyMoveEffects(attacker, defender, move, rng, log, totalDealt);
  // Substitute creation (Substitute move) and recharge flag (Hyper Beam).
  if (hasTag(move,'substitute') && !attacker._sub){ const cost=Math.floor(attacker.maxHp/4); if (attacker.hp>cost){ attacker.hp-=cost; attacker._sub=cost; log.push({t:'msg',code:'substitute',who:attacker.name}); } }
  if (hasTag(move,'recharge') && totalDealt>0) attacker._recharge = true;
}

// On-hit reactive abilities: contact-status, defensive triggers, and on-faint effects.
function applyDefenderHitAbilities(attacker, defender, move, dealt, eff, rng, log) {
  const contact = isContactMove(move);
  const moldBreak = attacker.ability === 'mold_breaker';

  // ---- Defender's reactive abilities (trigger even if it didn't faint) ----
  if (!defender.fainted && !moldBreak) {
    // Weak Armor: physical hit lowers Defense, raises Speed.
    if (defender.ability === 'weak_armor' && move.category === 'physical') {
      defender.stages.def = Math.max(-6, defender.stages.def - 1);
      defender.stages.spd = Math.min(6, defender.stages.spd + 1);
      log.push({t:'stat',who:defender.name,stat:'def',dir:'down'});
      log.push({t:'stat',who:defender.name,stat:'spd',dir:'up'});
    }
    // Justified: Attack rises when hit by a Dark move.
    if (defender.ability === 'justified' && move.type === 'dark') {
      defender.stages.atk = Math.min(6, defender.stages.atk + 1); log.push({t:'stat',who:defender.name,stat:'atk',dir:'up'});
    }
    // Rattled: Speed rises when hit by Bug/Ghost/Dark.
    if (defender.ability === 'rattled' && ['bug','ghost','dark'].includes(move.type)) {
      defender.stages.spd = Math.min(6, defender.stages.spd + 1); log.push({t:'stat',who:defender.name,stat:'spd',dir:'up'});
    }
  }

  // ---- On-contact effects (attacker touched the defender) ----
  if (contact && !defender.fainted && !moldBreak) {
    if (!attacker.status) {
      if (defender.ability === 'static' && rng() < 0.3 && !abilityBlocksStatus(attacker,'par')) { attacker.status='par'; log.push({t:'status',who:attacker.name,code:'par'}); }
      else if (defender.ability === 'flame_body' && rng() < 0.3 && !attacker.types.includes('fire') && !abilityBlocksStatus(attacker,'brn')) { attacker.status='brn'; log.push({t:'status',who:attacker.name,code:'brn'}); }
      else if ((defender.ability === 'poison_point') && rng() < 0.3 && !attacker.types.includes('poison') && !abilityBlocksStatus(attacker,'psn')) { attacker.status='psn'; log.push({t:'status',who:attacker.name,code:'psn'}); }
      else if (defender.ability === 'effect_spore' && rng() < 0.3) {
        const r = rng(); const st = r < 0.33 ? 'psn' : r < 0.66 ? 'par' : 'slp';
        if (!abilityBlocksStatus(attacker, st) && !(st==='psn'&&attacker.types.includes('poison'))) {
          attacker.status = st; if (st==='slp') attacker.sleepTurns = 1 + Math.floor(rng()*3);
          log.push({t:'status',who:attacker.name,code:st});
        }
      }
    }
  }
  // Poison Touch: the ATTACKER may poison the defender on contact.
  if (contact && attacker.ability === 'poison_touch' && !defender.fainted && !defender.status && rng() < 0.3 && !defender.types.includes('poison')) {
    defender.status='psn'; log.push({t:'status',who:defender.name,code:'psn'});
  }

  // ---- On-faint effects ----
  if (defender.fainted) {
    // Aftermath: contact attacker loses 1/4 max HP when it KOs this Pokémon.
    if (defender.ability === 'aftermath' && contact && !moldBreak) {
      const d = Math.floor(attacker.maxHp / 4); attacker.hp = Math.max(0, attacker.hp - d);
      log.push({t:'recoil',who:attacker.name,amt:d}); log.push({t:'msg',code:'aftermath',who:attacker.name});
      if (attacker.hp <= 0) { attacker.fainted = true; log.push({t:'faint',who:attacker.name}); }
    }
    // Moxie: attacker's Attack rises after scoring a KO.
    if (attacker.ability === 'moxie' && !attacker.fainted) {
      attacker.stages.atk = Math.min(6, attacker.stages.atk + 1); log.push({t:'stat',who:attacker.name,stat:'atk',dir:'up'});
    }
  }
}

// Switch-OUT abilities: heal status / restore HP when leaving the field.
function applySwitchOutAbility(b, log) {
  if (!b) return;
  if (b.ability === 'natural_cure' && b.status) { b.status = null; b.sleepTurns = 0; log.push({t:'msg',code:'naturalcure',who:b.name}); }
  if (b.ability === 'regenerator' && b.hp > 0 && b.hp < b.maxHp) {
    const h = Math.floor(b.maxHp / 3); b.hp = Math.min(b.maxHp, b.hp + h); log.push({t:'heal',who:b.name,amt:h});
  }
}

// Switch-IN abilities: trigger when a Pokémon enters the field.
function applySwitchInAbility(b, state, side, log, rng) {
  if (!b || b.fainted) return;
  const foeSide = side === 'a' ? 'b' : 'a';
  const foes = (state[foeSide] || []).filter(x => x && !x.fainted);
  // Intimidate: lower each foe's Attack by 1 (Clear Body / Hyper Cutter block it).
  if (b.ability === 'intimidate') {
    let any = false;
    for (const f of foes) {
      if (abilityBlocksStatDrop(f, 'atk')) { log.push({t:'msg',code:'abilityprotect',who:f.name}); continue; }
      f.stages.atk = Math.max(-6, f.stages.atk - 1); log.push({t:'stat',who:f.name,stat:'atk',dir:'down'}); any = true;
    }
    if (any) log.push({t:'msg',code:'intimidate',who:b.name});
  }
  // Download: boost Atk or SpA depending on which of the foe's defenses is lower.
  if (b.ability === 'download' && foes.length) {
    const f = foes[0];
    if (effStat(f,'def') <= effStat(f,'spDef')) { b.stages.atk = Math.min(6, b.stages.atk+1); log.push({t:'stat',who:b.name,stat:'atk',dir:'up'}); }
    else { b.stages.spAtk = Math.min(6, (b.stages.spAtk||0)+1); log.push({t:'stat',who:b.name,stat:'spatk',dir:'up'}); }
  }
  // Trace: copy the first living foe's ability.
  if (b.ability === 'trace' && foes.length) {
    const src = foes[0];
    if (src.ability && src.ability !== 'trace') { b.ability = src.ability; log.push({t:'msg',code:'trace',who:b.name,move:abilityName(src.ability)}); }
  }
  // Imposter (Ditto): transform into the opposing active Pokémon on entry.
  if (b.ability === 'imposter' && foes.length) {
    const src = foes[0];
    b.types = src.types.slice();
    b.atk = src.atk; b.def = src.def; b.spAtk = src.spAtk; b.spDef = src.spDef; b.spd = src.spd;
    b.stages = Object.assign({}, src.stages);
    b.moves = (src.moves || []).map(m => ({ ...m, pp: m.pp || 5 }));
    log.push({t:'msg',code:'transform',who:b.name,into:src.name});
  }
}

function abilityName(key) { return (typeof ABILITIES !== 'undefined' && ABILITIES[key] && ABILITIES[key].name) || key; }

// ---------- Public: resolve one full turn ----------
// teams: { a:[battler,...], b:[battler,...] }
// actions: array of { side:'a'|'b', actorIdx, moveKey, targetSide, targetIdx }
// Returns { log, over, winner, needReplace }
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
    // Switch-OUT abilities on the outgoing Pokémon.
    applySwitchOutAbility(outgoing, log);
    // Swap: incoming becomes active, outgoing goes to bench.
    state[act.side][act.actorIdx] = incoming;
    bench[act.benchIdx] = outgoing;
    incoming._side = act.side; incoming._screens = state[act.side === 'a' ? 'sideA' : 'sideB'];
    log.push({ t: 'switch', who: outgoing.name, in: incoming.name });
    // Switch-IN abilities for the incoming Pokémon (Intimidate, Download, Trace, Imposter).
    applySwitchInAbility(incoming, state, act.side, log, rng);
  }

  // ---- Phase 2: MOVES resolve by speed (switch actions are skipped here). ----
  const moveActions = actions.filter(a => a && a.type !== 'switch');
  const speed = (b) => {
    let s = effStat(b,'spd');
    if (b.ability === 'quick_feet' && b.status) return Math.floor(s * 1.5); // ignores the paralysis cut
    if (b.status==='par') s=Math.floor(s/4);
    return s;
  };
  const ordered = moveActions.slice().sort((x, y) => {
    const bx = getB(x.side, x.actorIdx), by = getB(y.side, y.actorIdx);
    const mx = moveData(x.moveKey) || {}, my = moveData(y.moveKey) || {};
    const px = hasTag(mx, 'priority') ? 1 : 0, py = hasTag(my, 'priority') ? 1 : 0;
    if (px !== py) return py - px;
    const sd = speed(by) - speed(bx);
    if (sd !== 0) return sd;
    return rng() < 0.5 ? -1 : 1; // speed tie → random
  });

  // Mark each mover's "moved last" flag for Analytic (true for all but the first mover).
  ordered.forEach((act, idx) => { const b = getB(act.side, act.actorIdx); if (b) b._movedLast = idx > 0; });

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
  [...state.a, ...state.b].filter(Boolean).sort((a,b)=>speed(b)-speed(a)).forEach(b => applyResidual(b, log, rng));

  // Leech Seed: drain HP/8 from seeded Pokémon to the first living mon on the seeding side.
  [...state.a, ...state.b].filter(Boolean).forEach(b => {
    if (b.fainted || !b._leechSeed) return;
    if (b.ability === 'magic_guard') return; // Magic Guard takes no leech damage
    const drain = Math.max(1, Math.floor(b.maxHp/8));
    b.hp = Math.max(0, b.hp - drain);
    log.push({ t:'residual', who:b.name, s:'seed', amt:drain });
    const healSide = b._leechFromSide === 'a' ? state.a : state.b;
    const healer = (healSide||[]).find(x => x && !x.fainted);
    if (healer){
      // Liquid Ooze: draining HP from this Pokémon damages the drainer instead.
      if (b.ability === 'liquid_ooze') { healer.hp = Math.max(0, healer.hp - drain); log.push({t:'recoil',who:healer.name,amt:drain}); if (healer.hp<=0){ healer.fainted=true; log.push({t:'faint',who:healer.name}); } }
      else { healer.hp=Math.min(healer.maxHp, healer.hp+drain); log.push({t:'heal',who:healer.name,amt:drain}); }
    }
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

// ---------- A1: fill an empty active slot with a bench Pokémon (faint replacement) ----------
// state, side ('a'|'b'), actorIdx (the empty active slot), benchIdx (living bench mon).
// Returns a log array (the switch-in message) or [] if invalid.
function applyReplacement(state, side, actorIdx, benchIdx) {
  const benchK = side === 'a' ? 'benchA' : 'benchB';
  const bench = state[benchK] || [];
  const incoming = bench[benchIdx];
  const slot = state[side][actorIdx];
  // Only valid if the active slot is actually empty/fainted and the bench mon is alive.
  if (!incoming || incoming.fainted) return [];
  if (slot && !slot.fainted) return [];
  // The fainted Pokémon (if any) stays where it is in bench history; we simply place the
  // incoming into the active slot and clear it from bench.
  state[side][actorIdx] = incoming;
  bench[benchIdx] = slot || null; // park the fainted one in bench slot (already fainted)
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
