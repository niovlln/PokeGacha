// data/abilities.js — Gen-3+ abilities for all 151 Gen-1 Pokemon.
// Ability assignments transcribed EXACTLY from Serebii's Gen-1 list (real data).
// Gen 1 had no abilities; these are each species' official later-gen abilities.
// SPECIES_ABILITIES[id] = array of ability keys (player picks ONE in the editor).

const ABILITIES = {
  adaptability: { name:"Adaptability", desc:"Powers up same-type moves more." },
  aftermath: { name:"Aftermath", desc:"Damages a contact attacker on fainting." },
  analytic: { name:"Analytic", desc:"Boosts power if moving last." },
  anger_point: { name:"Anger Point", desc:"Maxes Attack after a critical hit." },
  anticipation: { name:"Anticipation", desc:"Senses dangerous foe moves." },
  arena_trap: { name:"Arena Trap", desc:"Prevents the foe from fleeing." },
  battle_armor: { name:"Battle Armor", desc:"Blocks critical hits." },
  big_pecks: { name:"Big Pecks", desc:"Protects from Defense-lowering effects." },
  blaze: { name:"Blaze", desc:"Powers up Fire moves in a pinch." },
  chlorophyll: { name:"Chlorophyll", desc:"Boosts Speed in harsh sunlight." },
  clear_body: { name:"Clear Body", desc:"Prevents stat reduction." },
  cloud_nine: { name:"Cloud Nine", desc:"Negates weather effects." },
  competitive: { name:"Competitive", desc:"Sharply boosts Sp. Atk when a stat is lowered." },
  compound_eyes: { name:"Compound Eyes", desc:"Boosts the accuracy of moves." },
  cursed_body: { name:"Cursed Body", desc:"May disable a move that hits it." },
  cute_charm: { name:"Cute Charm", desc:"May infatuate on contact." },
  damp: { name:"Damp", desc:"Prevents self-destruct moves." },
  defiant: { name:"Defiant", desc:"Sharply boosts Attack when a stat is lowered." },
  download: { name:"Download", desc:"Boosts Attack or Sp. Atk on entry." },
  drought: { name:"Drought", desc:"Summons harsh sunlight on entry." },
  dry_skin: { name:"Dry Skin", desc:"Hurt by Fire, healed by Water/rain." },
  early_bird: { name:"Early Bird", desc:"Wakes from sleep faster." },
  effect_spore: { name:"Effect Spore", desc:"Contact may poison, paralyze, or sleep." },
  filter: { name:"Filter", desc:"Reduces super-effective damage." },
  flame_body: { name:"Flame Body", desc:"May burn on contact." },
  flash_fire: { name:"Flash Fire", desc:"Absorbs Fire moves to power up its own." },
  forewarn: { name:"Forewarn", desc:"Reveals the foe's strongest move." },
  friend_guard: { name:"Friend Guard", desc:"Reduces ally damage." },
  frisk: { name:"Frisk", desc:"Can check the foe's held item." },
  gluttony: { name:"Gluttony", desc:"Eats held Berry early." },
  guts: { name:"Guts", desc:"Boosts Attack if statused." },
  harvest: { name:"Harvest", desc:"May reuse a held Berry." },
  healer: { name:"Healer", desc:"May heal an ally's status." },
  hustle: { name:"Hustle", desc:"Boosts Attack but lowers accuracy." },
  hydration: { name:"Hydration", desc:"Heals status in rain." },
  hyper_cutter: { name:"Hyper Cutter", desc:"Prevents Attack reduction." },
  ice_body: { name:"Ice Body", desc:"Heals gradually in hail." },
  illuminate: { name:"Illuminate", desc:"Keeps accuracy from dropping." },
  immunity: { name:"Immunity", desc:"Prevents poison." },
  imposter: { name:"Imposter", desc:"Transforms into the foe on entry." },
  infiltrator: { name:"Infiltrator", desc:"Bypasses screens and substitutes." },
  inner_focus: { name:"Inner Focus", desc:"Protects from flinching." },
  insomnia: { name:"Insomnia", desc:"Prevents sleep." },
  intimidate: { name:"Intimidate", desc:"Lowers the foe's Attack on entry." },
  iron_fist: { name:"Iron Fist", desc:"Powers up punching moves." },
  justified: { name:"Justified", desc:"Boosts Attack when hit by a Dark move." },
  keen_eye: { name:"Keen Eye", desc:"Prevents accuracy loss." },
  leaf_guard: { name:"Leaf Guard", desc:"Prevents status in sun." },
  levitate: { name:"Levitate", desc:"Immune to Ground moves." },
  lightning_rod: { name:"Lightning Rod", desc:"Draws in and nullifies Electric moves." },
  limber: { name:"Limber", desc:"Prevents paralysis." },
  liquid_ooze: { name:"Liquid Ooze", desc:"Damages foes that drain HP." },
  magic_guard: { name:"Magic Guard", desc:"Only takes damage from attacks." },
  magnet_pull: { name:"Magnet Pull", desc:"Prevents Steel types from fleeing." },
  marvel_scale: { name:"Marvel Scale", desc:"Boosts Defense if statused." },
  mold_breaker: { name:"Mold Breaker", desc:"Ignores the foe's ability." },
  moxie: { name:"Moxie", desc:"Boosts Attack after a KO." },
  multiscale: { name:"Multiscale", desc:"Reduces damage at full HP." },
  natural_cure: { name:"Natural Cure", desc:"Heals status on switching out." },
  neutralizing_gas: { name:"Neutralizing Gas", desc:"Nullifies all abilities." },
  no_guard: { name:"No Guard", desc:"Ensures moves by and against it hit." },
  oblivious: { name:"Oblivious", desc:"Prevents infatuation and taunt." },
  overcoat: { name:"Overcoat", desc:"Protects from powder and weather." },
  overgrow: { name:"Overgrow", desc:"Powers up Grass moves in a pinch." },
  own_tempo: { name:"Own Tempo", desc:"Prevents confusion." },
  pickup: { name:"Pickup", desc:"May pick up items." },
  poison_point: { name:"Poison Point", desc:"May poison on contact." },
  poison_touch: { name:"Poison Touch", desc:"May poison on contact." },
  pressure: { name:"Pressure", desc:"Makes the foe use more PP." },
  quick_feet: { name:"Quick Feet", desc:"Boosts Speed if statused." },
  rain_dish: { name:"Rain Dish", desc:"Gradually restores HP in rain." },
  rattled: { name:"Rattled", desc:"Boosts Speed when hit by Bug/Ghost/Dark." },
  reckless: { name:"Reckless", desc:"Powers up recoil moves." },
  regenerator: { name:"Regenerator", desc:"Restores HP on switching out." },
  rivalry: { name:"Rivalry", desc:"Deals more damage to the same gender." },
  rock_head: { name:"Rock Head", desc:"Protects from recoil damage." },
  run_away: { name:"Run Away", desc:"Enables a sure getaway from wild Pokemon." },
  sand_force: { name:"Sand Force", desc:"Boosts some moves in a sandstorm." },
  sand_rush: { name:"Sand Rush", desc:"Boosts Speed in a sandstorm." },
  sand_veil: { name:"Sand Veil", desc:"Boosts evasion in a sandstorm." },
  scrappy: { name:"Scrappy", desc:"Hits Ghost types with Normal/Fighting." },
  serene_grace: { name:"Serene Grace", desc:"Boosts added-effect chances." },
  shed_skin: { name:"Shed Skin", desc:"May heal its own status conditions." },
  sheer_force: { name:"Sheer Force", desc:"Removes added effects to boost power." },
  shell_armor: { name:"Shell Armor", desc:"Blocks critical hits." },
  shield_dust: { name:"Shield Dust", desc:"Blocks added effects of attacks." },
  skill_link: { name:"Skill Link", desc:"Multi-hit moves always hit max." },
  sniper: { name:"Sniper", desc:"Powers up its critical hits." },
  snow_cloak: { name:"Snow Cloak", desc:"Boosts evasion in hail." },
  solar_power: { name:"Solar Power", desc:"Boosts Sp. Atk in sun, but loses HP." },
  soundproof: { name:"Soundproof", desc:"Immune to sound-based moves." },
  static: { name:"Static", desc:"May paralyze on contact." },
  steadfast: { name:"Steadfast", desc:"Boosts Speed each time it flinches." },
  stench: { name:"Stench", desc:"May cause flinching." },
  sticky_hold: { name:"Sticky Hold", desc:"Prevents item theft." },
  sturdy: { name:"Sturdy", desc:"Survives a one-hit KO from full HP." },
  swarm: { name:"Swarm", desc:"Powers up Bug moves in a pinch." },
  swift_swim: { name:"Swift Swim", desc:"Boosts Speed in rain." },
  synchronize: { name:"Synchronize", desc:"Passes status to the foe." },
  tangled_feet: { name:"Tangled Feet", desc:"Raises evasion if confused." },
  technician: { name:"Technician", desc:"Powers up weaker moves." },
  thick_fat: { name:"Thick Fat", desc:"Halves Fire and Ice damage." },
  tinted_lens: { name:"Tinted Lens", desc:"Doubles power of not-very-effective moves." },
  torrent: { name:"Torrent", desc:"Powers up Water moves in a pinch." },
  trace: { name:"Trace", desc:"Copies the foe's ability." },
  unaware: { name:"Unaware", desc:"Ignores the foe's stat changes." },
  unburden: { name:"Unburden", desc:"Boosts Speed when item is used." },
  unnerve: { name:"Unnerve", desc:"Makes the foe unable to eat Berries." },
  vital_spirit: { name:"Vital Spirit", desc:"Prevents sleep." },
  volt_absorb: { name:"Volt Absorb", desc:"Heals when hit by Electric moves." },
  water_absorb: { name:"Water Absorb", desc:"Heals when hit by Water moves." },
  water_veil: { name:"Water Veil", desc:"Prevents burns." },
  weak_armor: { name:"Weak Armor", desc:"Hit lowers Defense, raises Speed." },
  wonder_skin: { name:"Wonder Skin", desc:"Makes status moves more likely to miss." },
};

const SPECIES_ABILITIES = {
  1: ['overgrow', 'chlorophyll'], // Bulbasaur
  2: ['overgrow', 'chlorophyll'], // Ivysaur
  3: ['overgrow', 'chlorophyll'], // Venusaur
  4: ['blaze', 'solar_power'], // Charmander
  5: ['blaze', 'solar_power'], // Charmeleon
  6: ['blaze', 'solar_power'], // Charizard
  7: ['torrent', 'rain_dish'], // Squirtle
  8: ['torrent', 'rain_dish'], // Wartortle
  9: ['torrent', 'rain_dish'], // Blastoise
  10: ['shield_dust', 'run_away'], // Caterpie
  11: ['shed_skin'], // Metapod
  12: ['compound_eyes', 'tinted_lens'], // Butterfree
  13: ['shield_dust', 'run_away'], // Weedle
  14: ['shed_skin'], // Kakuna
  15: ['swarm', 'sniper'], // Beedrill
  16: ['keen_eye', 'tangled_feet', 'big_pecks'], // Pidgey
  17: ['keen_eye', 'tangled_feet', 'big_pecks'], // Pidgeotto
  18: ['keen_eye', 'tangled_feet', 'big_pecks'], // Pidgeot
  19: ['run_away', 'guts', 'hustle'], // Rattata
  20: ['run_away', 'guts', 'hustle'], // Raticate
  21: ['keen_eye', 'sniper'], // Spearow
  22: ['keen_eye', 'sniper'], // Fearow
  23: ['intimidate', 'shed_skin', 'unnerve'], // Ekans
  24: ['intimidate', 'shed_skin', 'unnerve'], // Arbok
  25: ['static', 'lightning_rod'], // Pikachu
  26: ['static', 'lightning_rod'], // Raichu
  27: ['sand_veil', 'sand_rush'], // Sandshrew
  28: ['sand_veil', 'sand_rush'], // Sandslash
  29: ['poison_point', 'rivalry', 'hustle'], // Nidoran-F
  30: ['poison_point', 'rivalry', 'hustle'], // Nidorina
  31: ['poison_point', 'rivalry', 'sheer_force'], // Nidoqueen
  32: ['poison_point', 'rivalry', 'hustle'], // Nidoran-M
  33: ['poison_point', 'rivalry', 'hustle'], // Nidorino
  34: ['poison_point', 'rivalry', 'sheer_force'], // Nidoking
  35: ['cute_charm', 'magic_guard', 'friend_guard'], // Clefairy
  36: ['cute_charm', 'magic_guard', 'unaware'], // Clefable
  37: ['flash_fire', 'drought'], // Vulpix
  38: ['flash_fire', 'drought'], // Ninetales
  39: ['cute_charm', 'competitive', 'friend_guard'], // Jigglypuff
  40: ['cute_charm', 'competitive', 'frisk'], // Wigglytuff
  41: ['inner_focus', 'infiltrator'], // Zubat
  42: ['inner_focus', 'infiltrator'], // Golbat
  43: ['chlorophyll', 'run_away'], // Oddish
  44: ['chlorophyll', 'stench'], // Gloom
  45: ['chlorophyll', 'effect_spore'], // Vileplume
  46: ['effect_spore', 'dry_skin', 'damp'], // Paras
  47: ['effect_spore', 'dry_skin', 'damp'], // Parasect
  48: ['compound_eyes', 'tinted_lens', 'run_away'], // Venonat
  49: ['shield_dust', 'tinted_lens', 'wonder_skin'], // Venomoth
  50: ['sand_veil', 'arena_trap', 'sand_force'], // Diglett
  51: ['sand_veil', 'arena_trap', 'sand_force'], // Dugtrio
  52: ['pickup', 'technician', 'unnerve'], // Meowth
  53: ['limber', 'technician', 'unnerve'], // Persian
  54: ['damp', 'cloud_nine', 'swift_swim'], // Psyduck
  55: ['damp', 'cloud_nine', 'swift_swim'], // Golduck
  56: ['vital_spirit', 'anger_point', 'defiant'], // Mankey
  57: ['vital_spirit', 'anger_point', 'defiant'], // Primeape
  58: ['intimidate', 'flash_fire', 'justified'], // Growlithe
  59: ['intimidate', 'flash_fire', 'justified'], // Arcanine
  60: ['water_absorb', 'damp', 'swift_swim'], // Poliwag
  61: ['water_absorb', 'damp', 'swift_swim'], // Poliwhirl
  62: ['water_absorb', 'damp', 'swift_swim'], // Poliwrath
  63: ['synchronize', 'inner_focus', 'magic_guard'], // Abra
  64: ['synchronize', 'inner_focus', 'magic_guard'], // Kadabra
  65: ['synchronize', 'inner_focus', 'magic_guard'], // Alakazam
  66: ['guts', 'no_guard', 'steadfast'], // Machop
  67: ['guts', 'no_guard', 'steadfast'], // Machoke
  68: ['guts', 'no_guard', 'steadfast'], // Machamp
  69: ['chlorophyll', 'gluttony'], // Bellsprout
  70: ['chlorophyll', 'gluttony'], // Weepinbell
  71: ['chlorophyll', 'gluttony'], // Victreebel
  72: ['clear_body', 'liquid_ooze', 'rain_dish'], // Tentacool
  73: ['clear_body', 'liquid_ooze', 'rain_dish'], // Tentacruel
  74: ['rock_head', 'sturdy', 'sand_veil'], // Geodude
  75: ['rock_head', 'sturdy', 'sand_veil'], // Graveler
  76: ['rock_head', 'sturdy', 'sand_veil'], // Golem
  77: ['run_away', 'flash_fire', 'flame_body'], // Ponyta
  78: ['run_away', 'flash_fire', 'flame_body'], // Rapidash
  79: ['oblivious', 'own_tempo', 'regenerator'], // Slowpoke
  80: ['oblivious', 'own_tempo', 'regenerator'], // Slowbro
  81: ['magnet_pull', 'sturdy', 'analytic'], // Magnemite
  82: ['magnet_pull', 'sturdy', 'analytic'], // Magneton
  83: ['keen_eye', 'inner_focus', 'defiant'], // Farfetchd
  84: ['run_away', 'early_bird', 'tangled_feet'], // Doduo
  85: ['run_away', 'early_bird', 'tangled_feet'], // Dodrio
  86: ['thick_fat', 'hydration', 'ice_body'], // Seel
  87: ['thick_fat', 'hydration', 'ice_body'], // Dewgong
  88: ['stench', 'sticky_hold', 'poison_touch'], // Grimer
  89: ['stench', 'sticky_hold', 'poison_touch'], // Muk
  90: ['shell_armor', 'skill_link', 'overcoat'], // Shellder
  91: ['shell_armor', 'skill_link', 'overcoat'], // Cloyster
  92: ['levitate'], // Gastly
  93: ['levitate'], // Haunter
  94: ['cursed_body'], // Gengar
  95: ['rock_head', 'sturdy', 'weak_armor'], // Onix
  96: ['insomnia', 'forewarn', 'inner_focus'], // Drowzee
  97: ['insomnia', 'forewarn', 'inner_focus'], // Hypno
  98: ['hyper_cutter', 'shell_armor', 'sheer_force'], // Krabby
  99: ['hyper_cutter', 'shell_armor', 'sheer_force'], // Kingler
  100: ['soundproof', 'static', 'aftermath'], // Voltorb
  101: ['soundproof', 'static', 'aftermath'], // Electrode
  102: ['chlorophyll', 'harvest'], // Exeggcute
  103: ['chlorophyll', 'harvest'], // Exeggutor
  104: ['rock_head', 'lightning_rod', 'battle_armor'], // Cubone
  105: ['rock_head', 'lightning_rod', 'battle_armor'], // Marowak
  106: ['limber', 'reckless', 'unburden'], // Hitmonlee
  107: ['keen_eye', 'iron_fist', 'inner_focus'], // Hitmonchan
  108: ['own_tempo', 'oblivious', 'cloud_nine'], // Lickitung
  109: ['levitate', 'neutralizing_gas', 'stench'], // Koffing
  110: ['levitate', 'neutralizing_gas', 'stench'], // Weezing
  111: ['lightning_rod', 'rock_head', 'reckless'], // Rhyhorn
  112: ['lightning_rod', 'rock_head', 'reckless'], // Rhydon
  113: ['natural_cure', 'serene_grace', 'healer'], // Chansey
  114: ['chlorophyll', 'leaf_guard', 'regenerator'], // Tangela
  115: ['early_bird', 'scrappy', 'inner_focus'], // Kangaskhan
  116: ['swift_swim', 'sniper', 'damp'], // Horsea
  117: ['poison_point', 'sniper', 'damp'], // Seadra
  118: ['swift_swim', 'water_veil', 'lightning_rod'], // Goldeen
  119: ['swift_swim', 'water_veil', 'lightning_rod'], // Seaking
  120: ['illuminate', 'natural_cure', 'analytic'], // Staryu
  121: ['illuminate', 'natural_cure', 'analytic'], // Starmie
  122: ['soundproof', 'filter', 'technician'], // Mr. Mime
  123: ['swarm', 'technician', 'steadfast'], // Scyther
  124: ['oblivious', 'forewarn', 'dry_skin'], // Jynx
  125: ['static', 'vital_spirit'], // Electabuzz
  126: ['flame_body', 'vital_spirit'], // Magmar
  127: ['hyper_cutter', 'mold_breaker', 'moxie'], // Pinsir
  128: ['intimidate', 'anger_point', 'sheer_force'], // Tauros
  129: ['swift_swim', 'rattled'], // Magikarp
  130: ['intimidate', 'moxie'], // Gyarados
  131: ['water_absorb', 'shell_armor', 'hydration'], // Lapras
  132: ['limber', 'imposter'], // Ditto
  133: ['run_away', 'adaptability', 'anticipation'], // Eevee
  134: ['water_absorb', 'hydration'], // Vaporeon
  135: ['volt_absorb', 'quick_feet'], // Jolteon
  136: ['flash_fire', 'guts'], // Flareon
  137: ['trace', 'download', 'analytic'], // Porygon
  138: ['swift_swim', 'shell_armor', 'weak_armor'], // Omanyte
  139: ['swift_swim', 'shell_armor', 'weak_armor'], // Omastar
  140: ['swift_swim', 'battle_armor', 'weak_armor'], // Kabuto
  141: ['swift_swim', 'battle_armor', 'weak_armor'], // Kabutops
  142: ['rock_head', 'pressure', 'unnerve'], // Aerodactyl
  143: ['immunity', 'thick_fat', 'gluttony'], // Snorlax
  144: ['pressure', 'snow_cloak'], // Articuno
  145: ['pressure', 'static'], // Zapdos
  146: ['pressure', 'flame_body'], // Moltres
  147: ['shed_skin', 'marvel_scale'], // Dratini
  148: ['shed_skin', 'marvel_scale'], // Dragonair
  149: ['inner_focus', 'multiscale'], // Dragonite
  150: ['pressure', 'unnerve'], // Mewtwo
  151: ['synchronize'], // Mew
};

function abilityData(key) { return ABILITIES[key] || null; }
function legalAbilities(speciesId) { return SPECIES_ABILITIES[speciesId] || []; }