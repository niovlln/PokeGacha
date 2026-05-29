// @ts-nocheck
// AUTO-GENERATED battle data for the referee Edge Function. Do not edit by hand.
// Embedded so the server is the single source of truth (clients cannot fake move stats).

export const MOVES: Record<string, any> = {
  vicegrip: { name:'Vice Grip', type:'normal', category:'physical', power:55, acc:100, pp:30, effect:null, desc:'Inflicts regular damage with no additional effect.' },
  pound: { name:'Pound', type:'normal', category:'physical', power:40, acc:100, pp:35, effect:null, desc:'' },
  karate_chop: { name:'Karate Chop', type:'fighting', category:'physical', power:50, acc:100, pp:25, effect:'highcrit', desc:'High critical hit ratio.' },
  double_slap: { name:'Double Slap', type:'normal', category:'physical', power:15, acc:85, pp:10, effect:'multihit', desc:'Hits 2-5 times in one turn.' },
  comet_punch: { name:'Comet Punch', type:'normal', category:'physical', power:18, acc:85, pp:15, effect:'multihit', desc:'Hits 2-5 times in one turn.' },
  mega_punch: { name:'Mega Punch', type:'normal', category:'physical', power:80, acc:85, pp:20, effect:null, desc:'' },
  pay_day: { name:'Pay Day', type:'normal', category:'physical', power:40, acc:100, pp:20, effect:'payday', desc:'Money is earned after the battle.' },
  fire_punch: { name:'Fire Punch', type:'fire', category:'physical', power:75, acc:100, pp:15, effect:'may_burn', desc:'May burn opponent.' },
  ice_punch: { name:'Ice Punch', type:'ice', category:'physical', power:75, acc:100, pp:15, effect:'may_freeze', desc:'May freeze opponent.' },
  thunder_punch: { name:'Thunder Punch', type:'electric', category:'physical', power:75, acc:100, pp:15, effect:'may_paralyze', desc:'May paralyze opponent.' },
  scratch: { name:'Scratch', type:'normal', category:'physical', power:40, acc:100, pp:35, effect:null, desc:'' },
  vise_grip: { name:'Vise Grip', type:'normal', category:'physical', power:55, acc:100, pp:30, effect:null, desc:'' },
  guillotine: { name:'Guillotine', type:'normal', category:'physical', power:0, acc:30, pp:5, effect:'ohko', desc:'One-Hit-KO, if it hits.' },
  razor_wind: { name:'Razor Wind', type:'normal', category:'special', power:80, acc:100, pp:10, effect:['highcrit', 'charge'], desc:'Charges on first turn, attacks on second. High critical hit ratio.' },
  swords_dance: { name:'Swords Dance', type:'normal', category:'status', power:0, acc:0, pp:20, effect:'atk_up2', desc:'Sharply raises user\'s Attack.' },
  cut: { name:'Cut', type:'normal', category:'physical', power:50, acc:95, pp:30, effect:null, desc:'' },
  gust: { name:'Gust', type:'flying', category:'special', power:40, acc:100, pp:35, effect:'hit_fly', desc:'Hits Pokémon using Fly/Bounce/Sky Drop with double power.' },
  wing_attack: { name:'Wing Attack', type:'flying', category:'physical', power:60, acc:100, pp:35, effect:null, desc:'' },
  whirlwind: { name:'Whirlwind', type:'normal', category:'status', power:0, acc:0, pp:20, effect:'whirlwind', desc:'In battles, the opponent switches. In the wild, the Pokémon runs.' },
  fly: { name:'Fly', type:'flying', category:'physical', power:90, acc:95, pp:15, effect:'charge', desc:'Flies up on first turn, attacks on second turn.' },
  bind: { name:'Bind', type:'normal', category:'physical', power:15, acc:85, pp:20, effect:'trap', desc:'Traps opponent, damaging them for 4-5 turns.' },
  slam: { name:'Slam', type:'normal', category:'physical', power:80, acc:75, pp:20, effect:null, desc:'' },
  vine_whip: { name:'Vine Whip', type:'grass', category:'physical', power:45, acc:100, pp:25, effect:null, desc:'' },
  stomp: { name:'Stomp', type:'normal', category:'physical', power:65, acc:100, pp:20, effect:'may_flinch', desc:'May cause flinching.' },
  double_kick: { name:'Double Kick', type:'fighting', category:'physical', power:30, acc:100, pp:30, effect:'multihit2', desc:'Hits twice in one turn.' },
  mega_kick: { name:'Mega Kick', type:'normal', category:'physical', power:120, acc:75, pp:5, effect:null, desc:'' },
  jump_kick: { name:'Jump Kick', type:'fighting', category:'physical', power:100, acc:95, pp:10, effect:'crash', desc:'If it misses, the user loses half their HP.' },
  rolling_kick: { name:'Rolling Kick', type:'fighting', category:'physical', power:60, acc:85, pp:15, effect:'may_flinch', desc:'May cause flinching.' },
  sand_attack: { name:'Sand Attack', type:'ground', category:'status', power:0, acc:100, pp:15, effect:'foe_acc_down', desc:'Lowers opponent\'s Accuracy.' },
  headbutt: { name:'Headbutt', type:'normal', category:'physical', power:70, acc:100, pp:15, effect:'may_flinch', desc:'May cause flinching.' },
  horn_attack: { name:'Horn Attack', type:'normal', category:'physical', power:65, acc:100, pp:25, effect:null, desc:'' },
  fury_attack: { name:'Fury Attack', type:'normal', category:'physical', power:15, acc:85, pp:20, effect:'multihit', desc:'Hits 2-5 times in one turn.' },
  horn_drill: { name:'Horn Drill', type:'normal', category:'physical', power:0, acc:30, pp:5, effect:'ohko', desc:'One-Hit-KO, if it hits.' },
  tackle: { name:'Tackle', type:'normal', category:'physical', power:40, acc:100, pp:35, effect:null, desc:'' },
  body_slam: { name:'Body Slam', type:'normal', category:'physical', power:85, acc:100, pp:15, effect:'may_paralyze', desc:'May paralyze opponent.' },
  wrap: { name:'Wrap', type:'normal', category:'physical', power:15, acc:90, pp:20, effect:'trap', desc:'Traps opponent, damaging them for 4-5 turns.' },
  take_down: { name:'Take Down', type:'normal', category:'physical', power:90, acc:85, pp:20, effect:'recoil', desc:'User receives recoil damage.' },
  thrash: { name:'Thrash', type:'normal', category:'physical', power:120, acc:100, pp:10, effect:'thrash', desc:'User attacks for 2-3 turns but then becomes confused.' },
  double_edge: { name:'Double-Edge', type:'normal', category:'physical', power:120, acc:100, pp:15, effect:'recoil', desc:'User receives recoil damage.' },
  tail_whip: { name:'Tail Whip', type:'normal', category:'status', power:0, acc:100, pp:30, effect:'foe_def_down', desc:'Lowers opponent\'s Defense.' },
  poison_sting: { name:'Poison Sting', type:'poison', category:'physical', power:15, acc:100, pp:35, effect:'poison', desc:'May poison the opponent.' },
  twineedle: { name:'Twineedle', type:'bug', category:'physical', power:25, acc:100, pp:20, effect:['multihit2', 'poison'], desc:'Hits twice in one turn. May poison opponent.' },
  pin_missile: { name:'Pin Missile', type:'bug', category:'physical', power:25, acc:95, pp:20, effect:'multihit', desc:'Hits 2-5 times in one turn.' },
  leer: { name:'Leer', type:'normal', category:'status', power:0, acc:100, pp:30, effect:'foe_def_down', desc:'Lowers opponent\'s Defense.' },
  bite: { name:'Bite', type:'dark', category:'physical', power:60, acc:100, pp:25, effect:'may_flinch', desc:'May cause flinching.' },
  growl: { name:'Growl', type:'normal', category:'status', power:0, acc:100, pp:40, effect:'foe_atk_down', desc:'Lowers opponent\'s Attack.' },
  roar: { name:'Roar', type:'normal', category:'status', power:0, acc:0, pp:20, effect:'whirlwind', desc:'In battles, the opponent switches. In the wild, the Pokémon runs.' },
  sing: { name:'Sing', type:'normal', category:'status', power:0, acc:55, pp:15, effect:'sleep', desc:'Puts opponent to sleep.' },
  supersonic: { name:'Supersonic', type:'normal', category:'status', power:0, acc:55, pp:20, effect:'confuse', desc:'Confuses opponent.' },
  sonic_boom: { name:'Sonic Boom', type:'normal', category:'special', power:0, acc:90, pp:20, effect:'fixed20', desc:'Always inflicts 20 HP.' },
  disable: { name:'Disable', type:'normal', category:'status', power:0, acc:100, pp:20, effect:'disable', desc:'Opponent can\'t use its last attack for a few turns.' },
  acid: { name:'Acid', type:'poison', category:'special', power:40, acc:100, pp:30, effect:'foe_spdef_down', desc:'May lower opponent\'s Special Defense.' },
  ember: { name:'Ember', type:'fire', category:'special', power:40, acc:100, pp:25, effect:'may_burn', desc:'May burn opponent.' },
  flamethrower: { name:'Flamethrower', type:'fire', category:'special', power:90, acc:100, pp:15, effect:'may_burn', desc:'May burn opponent.' },
  mist: { name:'Mist', type:'ice', category:'status', power:0, acc:0, pp:30, effect:'mist', desc:'User\'s stats cannot be changed for a period of time.' },
  water_gun: { name:'Water Gun', type:'water', category:'special', power:40, acc:100, pp:25, effect:null, desc:'' },
  hydro_pump: { name:'Hydro Pump', type:'water', category:'special', power:110, acc:80, pp:5, effect:null, desc:'' },
  surf: { name:'Surf', type:'water', category:'special', power:90, acc:100, pp:15, effect:null, desc:'Hits all adjacent Pokémon.' },
  ice_beam: { name:'Ice Beam', type:'ice', category:'special', power:90, acc:100, pp:10, effect:'may_freeze', desc:'May freeze opponent.' },
  blizzard: { name:'Blizzard', type:'ice', category:'special', power:110, acc:70, pp:5, effect:'may_freeze', desc:'May freeze opponent.' },
  psybeam: { name:'Psybeam', type:'psychic', category:'special', power:65, acc:100, pp:20, effect:'may_confuse', desc:'May confuse opponent.' },
  bubble_beam: { name:'Bubble Beam', type:'water', category:'special', power:65, acc:100, pp:20, effect:'foe_spd_down', desc:'May lower opponent\'s Speed.' },
  aurora_beam: { name:'Aurora Beam', type:'ice', category:'special', power:65, acc:100, pp:20, effect:null, desc:'May lower opponent\'s Attack.' },
  hyper_beam: { name:'Hyper Beam', type:'normal', category:'special', power:150, acc:90, pp:5, effect:'recharge', desc:'User must recharge next turn.' },
  peck: { name:'Peck', type:'flying', category:'physical', power:35, acc:100, pp:35, effect:null, desc:'' },
  drill_peck: { name:'Drill Peck', type:'flying', category:'physical', power:80, acc:100, pp:20, effect:null, desc:'' },
  submission: { name:'Submission', type:'fighting', category:'physical', power:80, acc:80, pp:20, effect:'recoil', desc:'User receives recoil damage.' },
  low_kick: { name:'Low Kick', type:'fighting', category:'physical', power:0, acc:100, pp:20, effect:'weight_dmg', desc:'The heavier the opponent, the stronger the attack.' },
  counter: { name:'Counter', type:'fighting', category:'physical', power:0, acc:100, pp:20, effect:'counter', desc:'When hit by a Physical Attack, user strikes back with 2x power.' },
  seismic_toss: { name:'Seismic Toss', type:'fighting', category:'physical', power:0, acc:100, pp:20, effect:'level_dmg', desc:'Inflicts damage equal to user\'s level.' },
  strength: { name:'Strength', type:'normal', category:'physical', power:80, acc:100, pp:15, effect:null, desc:'' },
  absorb: { name:'Absorb', type:'grass', category:'special', power:20, acc:100, pp:25, effect:'drain', desc:'User recovers half the HP inflicted on opponent.' },
  mega_drain: { name:'Mega Drain', type:'grass', category:'special', power:40, acc:100, pp:15, effect:'drain', desc:'User recovers half the HP inflicted on opponent.' },
  leech_seed: { name:'Leech Seed', type:'grass', category:'status', power:0, acc:90, pp:10, effect:'leechseed', desc:'Drains HP from opponent each turn.' },
  growth: { name:'Growth', type:'grass', category:'status', power:0, acc:0, pp:20, effect:'atk_spatk_up', desc:'Raises user\'s Attack and Special Attack.' },
  razor_leaf: { name:'Razor Leaf', type:'grass', category:'physical', power:55, acc:95, pp:25, effect:'highcrit', desc:'High critical hit ratio.' },
  solar_beam: { name:'Solar Beam', type:'grass', category:'special', power:120, acc:100, pp:10, effect:'charge', desc:'Charges on first turn, attacks on second.' },
  poison_powder: { name:'Poison Powder', type:'poison', category:'status', power:0, acc:75, pp:35, effect:'poison', desc:'Poisons opponent.' },
  stun_spore: { name:'Stun Spore', type:'grass', category:'status', power:0, acc:75, pp:30, effect:'paralyze', desc:'Paralyzes opponent.' },
  sleep_powder: { name:'Sleep Powder', type:'grass', category:'status', power:0, acc:75, pp:15, effect:'sleep', desc:'Puts opponent to sleep.' },
  petal_dance: { name:'Petal Dance', type:'grass', category:'special', power:120, acc:100, pp:10, effect:'thrash', desc:'User attacks for 2-3 turns but then becomes confused.' },
  string_shot: { name:'String Shot', type:'bug', category:'status', power:0, acc:95, pp:40, effect:'foe_spd_down2', desc:'Sharply lowers opponent\'s Speed.' },
  dragon_rage: { name:'Dragon Rage', type:'dragon', category:'special', power:0, acc:100, pp:10, effect:'fixed40', desc:'Always inflicts 40 HP.' },
  fire_spin: { name:'Fire Spin', type:'fire', category:'special', power:35, acc:85, pp:15, effect:'trap', desc:'Traps opponent, damaging them for 4-5 turns.' },
  thunder_shock: { name:'Thunder Shock', type:'electric', category:'special', power:40, acc:100, pp:30, effect:'may_paralyze', desc:'May paralyze opponent.' },
  thunderbolt: { name:'Thunderbolt', type:'electric', category:'special', power:90, acc:100, pp:15, effect:'may_paralyze', desc:'May paralyze opponent.' },
  thunder_wave: { name:'Thunder Wave', type:'electric', category:'status', power:0, acc:90, pp:20, effect:'paralyze', desc:'Paralyzes opponent.' },
  thunder: { name:'Thunder', type:'electric', category:'special', power:110, acc:70, pp:10, effect:'may_paralyze', desc:'May paralyze opponent.' },
  rock_throw: { name:'Rock Throw', type:'rock', category:'physical', power:50, acc:90, pp:15, effect:null, desc:'' },
  earthquake: { name:'Earthquake', type:'ground', category:'physical', power:100, acc:100, pp:10, effect:'hit_dig', desc:'Power is doubled if opponent is underground from using Dig.' },
  fissure: { name:'Fissure', type:'ground', category:'physical', power:0, acc:30, pp:5, effect:'ohko', desc:'One-Hit-KO, if it hits.' },
  dig: { name:'Dig', type:'ground', category:'physical', power:80, acc:100, pp:10, effect:'charge', desc:'Digs underground on first turn, attacks on second. Can also escape from caves.' },
  toxic: { name:'Toxic', type:'poison', category:'status', power:0, acc:90, pp:10, effect:'badpoison', desc:'Badly poisons opponent.' },
  confusion: { name:'Confusion', type:'psychic', category:'special', power:50, acc:100, pp:25, effect:'may_confuse', desc:'May confuse opponent.' },
  psychic: { name:'Psychic', type:'psychic', category:'special', power:90, acc:100, pp:10, effect:'foe_spdef_down', desc:'May lower opponent\'s Special Defense.' },
  hypnosis: { name:'Hypnosis', type:'psychic', category:'status', power:0, acc:60, pp:20, effect:'sleep', desc:'Puts opponent to sleep.' },
  meditate: { name:'Meditate', type:'psychic', category:'status', power:0, acc:0, pp:40, effect:'atk_up', desc:'Raises user\'s Attack.' },
  agility: { name:'Agility', type:'psychic', category:'status', power:0, acc:0, pp:30, effect:'spd_up2', desc:'Sharply raises user\'s Speed.' },
  quick_attack: { name:'Quick Attack', type:'normal', category:'physical', power:40, acc:100, pp:30, effect:'priority', desc:'User attacks first.' },
  rage: { name:'Rage', type:'normal', category:'physical', power:20, acc:100, pp:20, effect:['atk_up', 'rage'], desc:'Raises user\'s Attack when hit.' },
  teleport: { name:'Teleport', type:'psychic', category:'status', power:0, acc:0, pp:20, effect:null, desc:'Allows user to flee wild battles; also warps player to last PokéCenter.' },
  night_shade: { name:'Night Shade', type:'ghost', category:'special', power:0, acc:100, pp:15, effect:'level_dmg', desc:'Inflicts damage equal to user\'s level.' },
  mimic: { name:'Mimic', type:'normal', category:'status', power:0, acc:0, pp:10, effect:'mimic', desc:'Copies the opponent\'s last move.' },
  screech: { name:'Screech', type:'normal', category:'status', power:0, acc:85, pp:40, effect:'foe_def_down2', desc:'Sharply lowers opponent\'s Defense.' },
  double_team: { name:'Double Team', type:'normal', category:'status', power:0, acc:0, pp:15, effect:'evasion_up', desc:'Raises user\'s Evasiveness.' },
  recover: { name:'Recover', type:'normal', category:'status', power:0, acc:0, pp:5, effect:'heal50', desc:'User recovers half its max HP.' },
  harden: { name:'Harden', type:'normal', category:'status', power:0, acc:0, pp:30, effect:'def_up', desc:'Raises user\'s Defense.' },
  minimize: { name:'Minimize', type:'normal', category:'status', power:0, acc:0, pp:10, effect:'evasion_up2', desc:'Sharply raises user\'s Evasiveness.' },
  smokescreen: { name:'Smokescreen', type:'normal', category:'status', power:0, acc:100, pp:20, effect:'foe_acc_down', desc:'Lowers opponent\'s Accuracy.' },
  confuse_ray: { name:'Confuse Ray', type:'ghost', category:'status', power:0, acc:100, pp:10, effect:'confuse', desc:'Confuses opponent.' },
  withdraw: { name:'Withdraw', type:'water', category:'status', power:0, acc:0, pp:40, effect:'def_up', desc:'Raises user\'s Defense.' },
  defense_curl: { name:'Defense Curl', type:'normal', category:'status', power:0, acc:0, pp:40, effect:'def_up', desc:'Raises user\'s Defense.' },
  barrier: { name:'Barrier', type:'psychic', category:'status', power:0, acc:0, pp:20, effect:'def_up2', desc:'Sharply raises user\'s Defense.' },
  light_screen: { name:'Light Screen', type:'psychic', category:'status', power:0, acc:0, pp:30, effect:'lightscreen', desc:'Halves damage from Special attacks for 5 turns.' },
  haze: { name:'Haze', type:'ice', category:'status', power:0, acc:0, pp:30, effect:'haze', desc:'Resets all stat changes.' },
  reflect: { name:'Reflect', type:'psychic', category:'status', power:0, acc:0, pp:20, effect:'reflect', desc:'Halves damage from Physical attacks for 5 turns.' },
  focus_energy: { name:'Focus Energy', type:'normal', category:'status', power:0, acc:0, pp:30, effect:'crit_up', desc:'Increases critical hit ratio.' },
  bide: { name:'Bide', type:'normal', category:'physical', power:0, acc:0, pp:10, effect:'bide', desc:'User takes damage for two turns then strikes back double.' },
  metronome: { name:'Metronome', type:'normal', category:'status', power:0, acc:0, pp:10, effect:'metronome', desc:'User performs almost any move in the game at random.' },
  mirror_move: { name:'Mirror Move', type:'flying', category:'status', power:0, acc:0, pp:20, effect:'mirror', desc:'User performs the opponent\'s last move.' },
  self_destruct: { name:'Self-Destruct', type:'normal', category:'physical', power:200, acc:100, pp:5, effect:'faint_user', desc:'User faints.' },
  egg_bomb: { name:'Egg Bomb', type:'normal', category:'physical', power:100, acc:75, pp:10, effect:null, desc:'' },
  lick: { name:'Lick', type:'ghost', category:'physical', power:30, acc:100, pp:30, effect:'may_paralyze', desc:'May paralyze opponent.' },
  smog: { name:'Smog', type:'poison', category:'special', power:30, acc:70, pp:20, effect:'poison', desc:'May poison opponent.' },
  sludge: { name:'Sludge', type:'poison', category:'special', power:65, acc:100, pp:20, effect:'poison', desc:'May poison opponent.' },
  bone_club: { name:'Bone Club', type:'ground', category:'physical', power:65, acc:85, pp:20, effect:'may_flinch', desc:'May cause flinching.' },
  fire_blast: { name:'Fire Blast', type:'fire', category:'special', power:110, acc:85, pp:5, effect:'may_burn', desc:'May burn opponent.' },
  waterfall: { name:'Waterfall', type:'water', category:'physical', power:80, acc:100, pp:15, effect:'may_flinch', desc:'May cause flinching.' },
  clamp: { name:'Clamp', type:'water', category:'physical', power:35, acc:85, pp:15, effect:'trap', desc:'Traps opponent, damaging them for 4-5 turns.' },
  swift: { name:'Swift', type:'normal', category:'special', power:60, acc:0, pp:20, effect:'nevermiss', desc:'Ignores Accuracy and Evasiveness.' },
  skull_bash: { name:'Skull Bash', type:'normal', category:'physical', power:130, acc:100, pp:10, effect:'charge', desc:'Raises Defense on first turn, attacks on second.' },
  spike_cannon: { name:'Spike Cannon', type:'normal', category:'physical', power:20, acc:100, pp:15, effect:'multihit', desc:'Hits 2-5 times in one turn.' },
  constrict: { name:'Constrict', type:'normal', category:'physical', power:10, acc:100, pp:35, effect:'foe_spd_down', desc:'May lower opponent\'s Speed by one stage.' },
  amnesia: { name:'Amnesia', type:'psychic', category:'status', power:0, acc:0, pp:20, effect:'spdef_up2', desc:'Sharply raises user\'s Special Defense.' },
  kinesis: { name:'Kinesis', type:'psychic', category:'status', power:0, acc:80, pp:15, effect:'foe_acc_down', desc:'Lowers opponent\'s Accuracy.' },
  soft_boiled: { name:'Soft-Boiled', type:'normal', category:'status', power:0, acc:0, pp:5, effect:'heal50', desc:'User recovers half its max HP.' },
  high_jump_kick: { name:'High Jump Kick', type:'fighting', category:'physical', power:130, acc:90, pp:10, effect:'crash', desc:'If it misses, the user loses half their HP.' },
  glare: { name:'Glare', type:'normal', category:'status', power:0, acc:100, pp:30, effect:'paralyze', desc:'Paralyzes opponent.' },
  dream_eater: { name:'Dream Eater', type:'psychic', category:'special', power:100, acc:100, pp:15, effect:'dreameater', desc:'User recovers half the HP inflicted on a sleeping opponent.' },
  poison_gas: { name:'Poison Gas', type:'poison', category:'status', power:0, acc:90, pp:40, effect:'poison', desc:'Poisons opponent.' },
  barrage: { name:'Barrage', type:'normal', category:'physical', power:15, acc:85, pp:20, effect:'multihit', desc:'Hits 2-5 times in one turn.' },
  leech_life: { name:'Leech Life', type:'bug', category:'physical', power:80, acc:100, pp:10, effect:'drain', desc:'User recovers half the HP inflicted on opponent.' },
  lovely_kiss: { name:'Lovely Kiss', type:'normal', category:'status', power:0, acc:75, pp:10, effect:'sleep', desc:'Puts opponent to sleep.' },
  sky_attack: { name:'Sky Attack', type:'flying', category:'physical', power:140, acc:90, pp:5, effect:['highcrit', 'charge', 'may_flinch'], desc:'Charges on first turn, attacks on second. May cause flinching. High critical hit ratio.' },
  transform: { name:'Transform', type:'normal', category:'status', power:0, acc:0, pp:10, effect:'transform', desc:'User takes on the form and attacks of the opponent.' },
  bubble: { name:'Bubble', type:'water', category:'special', power:40, acc:100, pp:30, effect:'foe_spd_down', desc:'May lower opponent\'s Speed.' },
  dizzy_punch: { name:'Dizzy Punch', type:'normal', category:'physical', power:70, acc:100, pp:10, effect:'may_confuse', desc:'May confuse opponent.' },
  spore: { name:'Spore', type:'grass', category:'status', power:0, acc:100, pp:15, effect:'sleep', desc:'Puts opponent to sleep.' },
  flash: { name:'Flash', type:'normal', category:'status', power:0, acc:100, pp:20, effect:'foe_acc_down', desc:'Lowers opponent\'s Accuracy.' },
  psywave: { name:'Psywave', type:'psychic', category:'special', power:0, acc:100, pp:15, effect:'psywave', desc:'Inflicts damage 50-150% of user\'s level.' },
  splash: { name:'Splash', type:'normal', category:'status', power:0, acc:0, pp:40, effect:'noop', desc:'Doesn\'t do ANYTHING.' },
  acid_armor: { name:'Acid Armor', type:'poison', category:'status', power:0, acc:0, pp:20, effect:'def_up2', desc:'Sharply raises user\'s Defense.' },
  crabhammer: { name:'Crabhammer', type:'water', category:'physical', power:100, acc:95, pp:10, effect:'highcrit', desc:'High critical hit ratio.' },
  explosion: { name:'Explosion', type:'normal', category:'physical', power:250, acc:100, pp:5, effect:'faint_user', desc:'User faints.' },
  fury_swipes: { name:'Fury Swipes', type:'normal', category:'physical', power:18, acc:80, pp:15, effect:'multihit', desc:'Hits 2-5 times in one turn.' },
  bonemerang: { name:'Bonemerang', type:'ground', category:'physical', power:50, acc:90, pp:10, effect:'multihit2', desc:'Hits twice in one turn.' },
  rest: { name:'Rest', type:'psychic', category:'status', power:0, acc:0, pp:5, effect:'rest', desc:'User sleeps for 2 turns, but user is fully healed.' },
  rock_slide: { name:'Rock Slide', type:'rock', category:'physical', power:75, acc:90, pp:10, effect:'may_flinch', desc:'May cause flinching.' },
  hyper_fang: { name:'Hyper Fang', type:'normal', category:'physical', power:80, acc:90, pp:15, effect:'may_flinch', desc:'May cause flinching.' },
  sharpen: { name:'Sharpen', type:'normal', category:'status', power:0, acc:0, pp:30, effect:'atk_up', desc:'Raises user\'s Attack.' },
  conversion: { name:'Conversion', type:'normal', category:'status', power:0, acc:0, pp:30, effect:'conversion', desc:'Changes user\'s type to that of its first move.' },
  tri_attack: { name:'Tri Attack', type:'normal', category:'special', power:80, acc:100, pp:10, effect:'tri_status', desc:'May paralyze, burn or freeze opponent.' },
  super_fang: { name:'Super Fang', type:'normal', category:'physical', power:0, acc:90, pp:10, effect:'halve_hp', desc:'Always takes off half of the opponent\'s HP.' },
  slash: { name:'Slash', type:'normal', category:'physical', power:70, acc:100, pp:20, effect:'highcrit', desc:'High critical hit ratio.' },
  substitute: { name:'Substitute', type:'normal', category:'status', power:0, acc:0, pp:10, effect:'substitute', desc:'Uses HP to creates a decoy that takes hits.' },
  struggle: { name:'Struggle', type:'normal', category:'physical', power:0, acc:0, pp:15, effect:'struggle', desc:'Only usable when all PP are gone. Hurts the user.' },
};

export const ABILITIES: Record<string, any> = {
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

export const SPECIES_ABILITIES: Record<string, string[]> = {
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

export const LEARNSETS: Record<string, string[]> = {
  1: ['tackle', 'growl', 'leech_seed', 'vine_whip', 'poison_powder', 'razor_leaf', 'growth', 'sleep_powder', 'solar_beam', 'swords_dance', 'toxic', 'body_slam', 'take_down', 'double_edge', 'rage', 'mega_drain', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute', 'cut'],
  2: ['tackle', 'growl', 'leech_seed', 'vine_whip', 'poison_powder', 'razor_leaf', 'growth', 'sleep_powder', 'solar_beam', 'swords_dance', 'toxic', 'body_slam', 'take_down', 'double_edge', 'rage', 'mega_drain', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute', 'cut'],
  3: ['tackle', 'growl', 'leech_seed', 'vine_whip', 'poison_powder', 'razor_leaf', 'growth', 'sleep_powder', 'solar_beam', 'swords_dance', 'toxic', 'body_slam', 'take_down', 'double_edge', 'rage', 'mega_drain', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute', 'cut'],
  4: ['scratch', 'growl', 'ember', 'leer', 'rage', 'slash', 'flamethrower', 'fire_spin', 'mega_punch', 'swords_dance', 'whirlwind', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'submission', 'counter', 'seismic_toss', 'dragon_rage', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'skull_bash', 'rest', 'substitute', 'cut', 'strength'],
  5: ['scratch', 'growl', 'ember', 'leer', 'rage', 'slash', 'flamethrower', 'fire_spin', 'mega_punch', 'swords_dance', 'whirlwind', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'submission', 'counter', 'seismic_toss', 'dragon_rage', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'skull_bash', 'rest', 'substitute', 'cut', 'strength'],
  6: ['scratch', 'growl', 'ember', 'leer', 'rage', 'slash', 'flamethrower', 'fire_spin', 'mega_punch', 'razor_wind', 'swords_dance', 'whirlwind', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'submission', 'counter', 'seismic_toss', 'dragon_rage', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'swift', 'skull_bash', 'sky_attack', 'rest', 'substitute', 'cut', 'fly', 'strength'],
  7: ['tackle', 'tail_whip', 'bubble', 'water_gun', 'bite', 'withdraw', 'skull_bash', 'hydro_pump', 'swords_dance', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'seismic_toss', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'thunder_wave', 'substitute', 'surf', 'strength', 'flash'],
  8: ['tackle', 'tail_whip', 'bubble', 'water_gun', 'bite', 'withdraw', 'skull_bash', 'hydro_pump', 'swords_dance', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'seismic_toss', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'thunder_wave', 'substitute', 'surf', 'strength', 'flash'],
  9: ['tackle', 'tail_whip', 'bubble', 'water_gun', 'bite', 'withdraw', 'skull_bash', 'hydro_pump', 'swords_dance', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'seismic_toss', 'rage', 'earthquake', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'thunder_wave', 'substitute', 'surf', 'strength', 'flash'],
  10: ['tackle', 'string_shot'],
  11: ['harden'],
  12: ['confusion', 'poison_powder', 'stun_spore', 'sleep_powder', 'supersonic', 'whirlwind', 'psybeam', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mega_drain', 'solar_beam', 'psychic', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'fly'],
  13: ['poison_sting', 'string_shot'],
  14: ['harden'],
  15: ['fury_attack', 'focus_energy', 'twineedle', 'rage', 'pin_missile', 'agility', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  16: ['gust', 'sand_attack', 'quick_attack', 'whirlwind', 'wing_attack', 'agility', 'mirror_move', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'swift', 'sky_attack', 'rest', 'substitute', 'fly'],
  17: ['gust', 'sand_attack', 'quick_attack', 'whirlwind', 'wing_attack', 'agility', 'mirror_move', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'swift', 'sky_attack', 'rest', 'substitute', 'fly'],
  18: ['gust', 'sand_attack', 'quick_attack', 'whirlwind', 'wing_attack', 'agility', 'mirror_move', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'swift', 'sky_attack', 'rest', 'substitute', 'fly'],
  19: ['tackle', 'tail_whip', 'quick_attack', 'hyper_fang', 'focus_energy', 'super_fang', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'thunderbolt', 'mimic', 'double_team', 'reflect', 'bide', 'swift', 'rest', 'substitute'],
  20: ['tackle', 'tail_whip', 'quick_attack', 'hyper_fang', 'focus_energy', 'super_fang', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'thunderbolt', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'swift', 'rest', 'substitute', 'cut'],
  21: ['peck', 'growl', 'leer', 'fury_attack', 'mirror_move', 'drill_peck', 'agility', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'swift', 'sky_attack', 'rest', 'substitute', 'fly'],
  22: ['peck', 'growl', 'leer', 'fury_attack', 'mirror_move', 'drill_peck', 'agility', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'swift', 'sky_attack', 'rest', 'substitute', 'fly'],
  23: ['wrap', 'leer', 'poison_sting', 'bite', 'glare', 'screech', 'acid', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  24: ['wrap', 'leer', 'poison_sting', 'bite', 'glare', 'screech', 'acid', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  25: ['thunder_shock', 'growl', 'thunder_wave', 'quick_attack', 'swift', 'agility', 'thunder', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'thunderbolt', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute', 'flash'],
  26: ['thunder_shock', 'growl', 'thunder_wave', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'thunderbolt', 'thunder', 'mimic', 'double_team', 'reflect', 'bide', 'swift', 'rest', 'substitute', 'flash'],
  27: ['scratch', 'sand_attack', 'slash', 'poison_sting', 'swift', 'fury_swipes', 'mega_punch', 'swords_dance', 'whirlwind', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'submission', 'counter', 'rage', 'earthquake', 'fissure', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'cut', 'surf', 'strength'],
  28: ['scratch', 'sand_attack', 'slash', 'poison_sting', 'swift', 'fury_swipes', 'mega_punch', 'swords_dance', 'whirlwind', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'submission', 'counter', 'rage', 'earthquake', 'fissure', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'cut', 'surf', 'strength'],
  29: ['growl', 'tackle', 'scratch', 'poison_sting', 'tail_whip', 'bite', 'fury_swipes', 'double_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute'],
  30: ['growl', 'tackle', 'scratch', 'poison_sting', 'tail_whip', 'bite', 'fury_swipes', 'double_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute'],
  31: ['growl', 'tackle', 'scratch', 'body_slam', 'poison_sting', 'mega_punch', 'swords_dance', 'whirlwind', 'mega_kick', 'toxic', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'submission', 'counter', 'seismic_toss', 'rage', 'dragon_rage', 'thunderbolt', 'thunder', 'earthquake', 'fissure', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'skull_bash', 'rest', 'substitute', 'cut', 'surf', 'strength'],
  32: ['leer', 'tackle', 'horn_attack', 'poison_sting', 'focus_energy', 'fury_attack', 'horn_drill', 'double_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute'],
  33: ['leer', 'tackle', 'horn_attack', 'poison_sting', 'focus_energy', 'fury_attack', 'horn_drill', 'double_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute'],
  34: ['leer', 'tackle', 'horn_attack', 'thrash', 'poison_sting', 'mega_punch', 'swords_dance', 'whirlwind', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'submission', 'counter', 'seismic_toss', 'rage', 'dragon_rage', 'thunderbolt', 'thunder', 'earthquake', 'fissure', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'skull_bash', 'rest', 'substitute', 'cut', 'surf', 'strength'],
  35: ['pound', 'growl', 'sing', 'double_slap', 'minimize', 'metronome', 'defense_curl', 'light_screen', 'mega_punch', 'swords_dance', 'mega_kick', 'toxic', 'horn_drill', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'pay_day', 'submission', 'counter', 'seismic_toss', 'rage', 'thunderbolt', 'thunder', 'psychic', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'skull_bash', 'dream_eater', 'rest', 'thunder_wave', 'psywave', 'substitute', 'flash'],
  36: ['sing', 'double_slap', 'minimize', 'metronome', 'mega_punch', 'swords_dance', 'mega_kick', 'toxic', 'horn_drill', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'pay_day', 'submission', 'counter', 'seismic_toss', 'rage', 'thunderbolt', 'thunder', 'psychic', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'skull_bash', 'dream_eater', 'rest', 'thunder_wave', 'psywave', 'substitute', 'flash'],
  37: ['ember', 'tail_whip', 'quick_attack', 'roar', 'confuse_ray', 'flamethrower', 'fire_spin', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'swift', 'rest', 'substitute'],
  38: ['ember', 'tail_whip', 'quick_attack', 'roar', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'swift', 'rest', 'substitute'],
  39: ['sing', 'pound', 'disable', 'defense_curl', 'double_slap', 'rest', 'body_slam', 'double_edge', 'mega_punch', 'swords_dance', 'mega_kick', 'toxic', 'horn_drill', 'take_down', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'pay_day', 'submission', 'counter', 'seismic_toss', 'rage', 'thunderbolt', 'thunder', 'psychic', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'metronome', 'fire_blast', 'skull_bash', 'dream_eater', 'thunder_wave', 'psywave', 'substitute', 'flash'],
  40: ['sing', 'disable', 'defense_curl', 'double_slap', 'mega_punch', 'swords_dance', 'mega_kick', 'toxic', 'horn_drill', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'pay_day', 'submission', 'counter', 'seismic_toss', 'rage', 'thunderbolt', 'thunder', 'psychic', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'metronome', 'fire_blast', 'skull_bash', 'dream_eater', 'rest', 'thunder_wave', 'psywave', 'substitute', 'flash'],
  41: ['leech_life', 'supersonic', 'bite', 'confuse_ray', 'wing_attack', 'haze', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute', 'fly'],
  42: ['leech_life', 'supersonic', 'bite', 'confuse_ray', 'wing_attack', 'haze', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute', 'fly'],
  43: ['absorb', 'poison_powder', 'stun_spore', 'sleep_powder', 'acid', 'petal_dance', 'solar_beam', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mega_drain', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  44: ['absorb', 'poison_powder', 'stun_spore', 'sleep_powder', 'acid', 'petal_dance', 'solar_beam', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mega_drain', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  45: ['stun_spore', 'sleep_powder', 'acid', 'petal_dance', 'poison_powder', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mega_drain', 'solar_beam', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  46: ['scratch', 'stun_spore', 'leech_life', 'spore', 'slash', 'growth', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mega_drain', 'solar_beam', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute', 'cut'],
  47: ['scratch', 'stun_spore', 'leech_life', 'spore', 'slash', 'growth', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mega_drain', 'solar_beam', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute', 'cut'],
  48: ['tackle', 'disable', 'poison_powder', 'leech_life', 'stun_spore', 'psybeam', 'sleep_powder', 'psychic', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  49: ['tackle', 'disable', 'poison_powder', 'leech_life', 'stun_spore', 'psybeam', 'sleep_powder', 'psychic', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  50: ['scratch', 'growl', 'dig', 'sand_attack', 'slash', 'earthquake', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'fissure', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  51: ['scratch', 'growl', 'dig', 'sand_attack', 'slash', 'earthquake', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'fissure', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  52: ['scratch', 'growl', 'bite', 'pay_day', 'screech', 'fury_swipes', 'slash', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'swift', 'skull_bash', 'rest', 'thunder_wave', 'substitute'],
  53: ['scratch', 'growl', 'bite', 'screech', 'pay_day', 'fury_swipes', 'slash', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'swift', 'skull_bash', 'rest', 'thunder_wave', 'substitute'],
  54: ['scratch', 'tail_whip', 'disable', 'confusion', 'fury_swipes', 'hydro_pump', 'swords_dance', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'psychic', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'thunder_wave', 'psywave', 'substitute', 'surf', 'strength'],
  55: ['scratch', 'tail_whip', 'disable', 'confusion', 'fury_swipes', 'hydro_pump', 'swords_dance', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'psychic', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'thunder_wave', 'psywave', 'substitute', 'surf', 'strength'],
  56: ['scratch', 'leer', 'karate_chop', 'fury_swipes', 'focus_energy', 'seismic_toss', 'thrash', 'mega_punch', 'swords_dance', 'whirlwind', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'submission', 'counter', 'rage', 'earthquake', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'strength'],
  57: ['scratch', 'leer', 'karate_chop', 'fury_swipes', 'focus_energy', 'seismic_toss', 'thrash', 'mega_punch', 'swords_dance', 'whirlwind', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'submission', 'counter', 'rage', 'earthquake', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'strength'],
  58: ['bite', 'roar', 'ember', 'leer', 'take_down', 'agility', 'flamethrower', 'toxic', 'body_slam', 'double_edge', 'hyper_beam', 'rage', 'dragon_rage', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'swift', 'rest', 'substitute'],
  59: ['roar', 'ember', 'leer', 'take_down', 'toxic', 'body_slam', 'double_edge', 'hyper_beam', 'rage', 'dragon_rage', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'swift', 'rest', 'substitute'],
  60: ['bubble', 'hypnosis', 'water_gun', 'double_slap', 'body_slam', 'amnesia', 'hydro_pump', 'toxic', 'take_down', 'double_edge', 'bubble_beam', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'surf', 'strength'],
  61: ['bubble', 'hypnosis', 'water_gun', 'double_slap', 'body_slam', 'amnesia', 'hydro_pump', 'toxic', 'take_down', 'double_edge', 'bubble_beam', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'surf', 'strength'],
  62: ['hypnosis', 'water_gun', 'double_slap', 'body_slam', 'toxic', 'take_down', 'double_edge', 'bubble_beam', 'ice_beam', 'blizzard', 'hyper_beam', 'submission', 'counter', 'seismic_toss', 'rage', 'earthquake', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'surf', 'strength'],
  63: ['teleport', 'mega_punch', 'swords_dance', 'whirlwind', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'pay_day', 'submission', 'counter', 'seismic_toss', 'rage', 'thunderbolt', 'thunder', 'psychic', 'mimic', 'double_team', 'reflect', 'bide', 'metronome', 'fire_blast', 'skull_bash', 'dream_eater', 'sky_attack', 'rest', 'thunder_wave', 'psywave', 'substitute', 'flash'],
  64: ['teleport', 'confusion', 'disable', 'psybeam', 'recover', 'psychic', 'reflect', 'mega_punch', 'swords_dance', 'whirlwind', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'pay_day', 'submission', 'counter', 'seismic_toss', 'rage', 'thunderbolt', 'thunder', 'mimic', 'double_team', 'bide', 'metronome', 'fire_blast', 'skull_bash', 'dream_eater', 'sky_attack', 'rest', 'thunder_wave', 'psywave', 'substitute', 'flash'],
  65: ['teleport', 'confusion', 'disable', 'psybeam', 'recover', 'psychic', 'reflect', 'mega_punch', 'swords_dance', 'whirlwind', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'pay_day', 'submission', 'counter', 'seismic_toss', 'rage', 'thunderbolt', 'thunder', 'mimic', 'double_team', 'bide', 'metronome', 'fire_blast', 'skull_bash', 'dream_eater', 'sky_attack', 'rest', 'thunder_wave', 'psywave', 'substitute', 'flash'],
  66: ['karate_chop', 'low_kick', 'leer', 'focus_energy', 'seismic_toss', 'submission', 'mega_punch', 'swords_dance', 'whirlwind', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'counter', 'rage', 'earthquake', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'strength'],
  67: ['karate_chop', 'low_kick', 'leer', 'focus_energy', 'seismic_toss', 'submission', 'mega_punch', 'swords_dance', 'whirlwind', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'counter', 'rage', 'earthquake', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'strength'],
  68: ['karate_chop', 'low_kick', 'leer', 'focus_energy', 'seismic_toss', 'submission', 'mega_punch', 'swords_dance', 'whirlwind', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'counter', 'rage', 'earthquake', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'strength'],
  69: ['vine_whip', 'growth', 'wrap', 'poison_powder', 'sleep_powder', 'stun_spore', 'acid', 'razor_leaf', 'slam', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mega_drain', 'solar_beam', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  70: ['vine_whip', 'growth', 'wrap', 'poison_powder', 'sleep_powder', 'stun_spore', 'acid', 'razor_leaf', 'slam', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mega_drain', 'solar_beam', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  71: ['sleep_powder', 'stun_spore', 'acid', 'razor_leaf', 'wrap', 'poison_powder', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mega_drain', 'solar_beam', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  72: ['acid', 'supersonic', 'wrap', 'poison_sting', 'water_gun', 'constrict', 'barrier', 'screech', 'hydro_pump', 'toxic', 'take_down', 'double_edge', 'bubble_beam', 'ice_beam', 'blizzard', 'hyper_beam', 'rage', 'mega_drain', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute', 'surf'],
  73: ['acid', 'supersonic', 'wrap', 'poison_sting', 'water_gun', 'constrict', 'barrier', 'screech', 'hydro_pump', 'toxic', 'take_down', 'double_edge', 'bubble_beam', 'ice_beam', 'blizzard', 'hyper_beam', 'rage', 'mega_drain', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute', 'surf'],
  74: ['tackle', 'defense_curl', 'rock_throw', 'self_destruct', 'harden', 'earthquake', 'explosion', 'mega_punch', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'submission', 'seismic_toss', 'rage', 'fissure', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'rock_slide', 'substitute', 'strength'],
  75: ['tackle', 'defense_curl', 'rock_throw', 'self_destruct', 'harden', 'earthquake', 'explosion', 'mega_punch', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'submission', 'seismic_toss', 'rage', 'fissure', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'rock_slide', 'substitute', 'strength'],
  76: ['tackle', 'defense_curl', 'rock_throw', 'self_destruct', 'harden', 'earthquake', 'explosion', 'mega_punch', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'submission', 'seismic_toss', 'rage', 'fissure', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'rock_slide', 'substitute', 'strength'],
  77: ['ember', 'tail_whip', 'stomp', 'growl', 'fire_spin', 'take_down', 'agility', 'toxic', 'body_slam', 'double_edge', 'hyper_beam', 'rage', 'dragon_rage', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'swift', 'rest', 'substitute'],
  78: ['ember', 'tail_whip', 'stomp', 'growl', 'fire_spin', 'take_down', 'agility', 'toxic', 'body_slam', 'double_edge', 'hyper_beam', 'rage', 'dragon_rage', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'swift', 'rest', 'substitute'],
  79: ['confusion', 'disable', 'headbutt', 'growl', 'water_gun', 'amnesia', 'psychic', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'thunder_wave', 'psywave', 'substitute', 'surf', 'strength'],
  80: ['confusion', 'disable', 'headbutt', 'growl', 'water_gun', 'withdraw', 'amnesia', 'psychic', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'thunder_wave', 'psywave', 'substitute', 'surf', 'strength'],
  81: ['tackle', 'sonic_boom', 'thunder_shock', 'supersonic', 'thunder_wave', 'swift', 'screech', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'thunderbolt', 'thunder', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  82: ['tackle', 'sonic_boom', 'thunder_shock', 'supersonic', 'thunder_wave', 'swift', 'screech', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'thunderbolt', 'thunder', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  83: ['peck', 'sand_attack', 'leer', 'fury_attack', 'swords_dance', 'agility', 'slash', 'razor_wind', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'swift', 'skull_bash', 'sky_attack', 'rest', 'substitute', 'cut', 'fly'],
  84: ['peck', 'growl', 'fury_attack', 'drill_peck', 'rage', 'tri_attack', 'agility', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'mimic', 'double_team', 'reflect', 'bide', 'swift', 'sky_attack', 'rest', 'substitute', 'fly'],
  85: ['peck', 'growl', 'fury_attack', 'drill_peck', 'rage', 'tri_attack', 'agility', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'mimic', 'double_team', 'reflect', 'bide', 'swift', 'sky_attack', 'rest', 'substitute', 'fly'],
  86: ['headbutt', 'growl', 'aurora_beam', 'rest', 'take_down', 'ice_beam', 'toxic', 'body_slam', 'double_edge', 'blizzard', 'hyper_beam', 'counter', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'substitute', 'surf'],
  87: ['headbutt', 'growl', 'aurora_beam', 'rest', 'take_down', 'ice_beam', 'toxic', 'body_slam', 'double_edge', 'blizzard', 'hyper_beam', 'counter', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'substitute', 'surf'],
  88: ['pound', 'disable', 'poison_gas', 'minimize', 'sludge', 'harden', 'screech', 'acid_armor', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute'],
  89: ['pound', 'disable', 'poison_gas', 'minimize', 'sludge', 'harden', 'screech', 'acid_armor', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute'],
  90: ['tackle', 'withdraw', 'supersonic', 'clamp', 'aurora_beam', 'leer', 'ice_beam', 'toxic', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'blizzard', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'surf'],
  91: ['withdraw', 'supersonic', 'clamp', 'aurora_beam', 'spike_cannon', 'toxic', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'surf'],
  92: ['lick', 'confuse_ray', 'night_shade', 'hypnosis', 'dream_eater', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'thunderbolt', 'thunder', 'psychic', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'psywave', 'substitute'],
  93: ['lick', 'confuse_ray', 'night_shade', 'hypnosis', 'dream_eater', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'thunderbolt', 'thunder', 'psychic', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'psywave', 'substitute'],
  94: ['lick', 'confuse_ray', 'night_shade', 'hypnosis', 'dream_eater', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'thunderbolt', 'thunder', 'earthquake', 'fissure', 'psychic', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'self_destruct', 'rest', 'psywave', 'explosion', 'substitute'],
  95: ['tackle', 'screech', 'bind', 'rock_throw', 'rage', 'slam', 'harden', 'mega_punch', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'submission', 'seismic_toss', 'earthquake', 'fissure', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'self_destruct', 'rest', 'explosion', 'rock_slide', 'substitute', 'strength'],
  96: ['pound', 'hypnosis', 'disable', 'confusion', 'headbutt', 'poison_gas', 'psychic', 'meditate', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'metronome', 'skull_bash', 'dream_eater', 'rest', 'thunder_wave', 'psywave', 'substitute', 'flash'],
  97: ['pound', 'hypnosis', 'disable', 'confusion', 'headbutt', 'poison_gas', 'psychic', 'meditate', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'metronome', 'skull_bash', 'dream_eater', 'rest', 'thunder_wave', 'psywave', 'substitute', 'flash'],
  98: ['bubble', 'leer', 'vicegrip', 'guillotine', 'stomp', 'crabhammer', 'harden', 'mega_punch', 'swords_dance', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'surf', 'strength'],
  99: ['bubble', 'leer', 'vicegrip', 'guillotine', 'stomp', 'crabhammer', 'harden', 'mega_punch', 'swords_dance', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'surf', 'strength'],
  100: ['tackle', 'screech', 'sonic_boom', 'self_destruct', 'light_screen', 'swift', 'explosion', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'thunderbolt', 'thunder', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'thunder_wave', 'substitute'],
  101: ['tackle', 'screech', 'sonic_boom', 'self_destruct', 'light_screen', 'swift', 'explosion', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'thunderbolt', 'thunder', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'thunder_wave', 'substitute'],
  102: ['barrage', 'hypnosis', 'reflect', 'leech_seed', 'stun_spore', 'poison_powder', 'sleep_powder', 'solar_beam', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mega_drain', 'psychic', 'teleport', 'mimic', 'double_team', 'bide', 'dream_eater', 'rest', 'psywave', 'substitute'],
  103: ['barrage', 'hypnosis', 'stomp', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mega_drain', 'solar_beam', 'psychic', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'dream_eater', 'rest', 'psywave', 'substitute'],
  104: ['bone_club', 'growl', 'leer', 'focus_energy', 'thrash', 'bonemerang', 'rage', 'mega_punch', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'submission', 'earthquake', 'fissure', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'strength'],
  105: ['bone_club', 'growl', 'leer', 'focus_energy', 'thrash', 'bonemerang', 'rage', 'mega_punch', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'submission', 'earthquake', 'fissure', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'strength'],
  106: ['double_kick', 'meditate', 'rolling_kick', 'jump_kick', 'focus_energy', 'high_jump_kick', 'mega_kick', 'mega_punch', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'submission', 'counter', 'seismic_toss', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  107: ['comet_punch', 'agility', 'fire_punch', 'ice_punch', 'thunder_punch', 'counter', 'mega_punch', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'submission', 'seismic_toss', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  108: ['wrap', 'supersonic', 'stomp', 'disable', 'defense_curl', 'slam', 'screech', 'swords_dance', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'seismic_toss', 'rage', 'thunderbolt', 'thunder', 'psychic', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'skull_bash', 'rest', 'thunder_wave', 'substitute', 'cut', 'surf', 'strength'],
  109: ['tackle', 'smog', 'sludge', 'smokescreen', 'self_destruct', 'haze', 'explosion', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  110: ['tackle', 'smog', 'sludge', 'smokescreen', 'self_destruct', 'haze', 'explosion', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  111: ['horn_attack', 'stomp', 'tail_whip', 'fury_attack', 'horn_drill', 'leer', 'take_down', 'mega_punch', 'mega_kick', 'toxic', 'body_slam', 'double_edge', 'hyper_beam', 'submission', 'seismic_toss', 'rage', 'dragon_rage', 'thunderbolt', 'thunder', 'earthquake', 'fissure', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'skull_bash', 'rest', 'rock_slide', 'substitute', 'surf', 'strength'],
  112: ['horn_attack', 'stomp', 'tail_whip', 'fury_attack', 'horn_drill', 'leer', 'take_down', 'mega_punch', 'mega_kick', 'toxic', 'body_slam', 'double_edge', 'hyper_beam', 'submission', 'seismic_toss', 'rage', 'dragon_rage', 'thunderbolt', 'thunder', 'earthquake', 'fissure', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'skull_bash', 'rest', 'rock_slide', 'substitute', 'surf', 'strength'],
  113: ['pound', 'double_slap', 'sing', 'growl', 'minimize', 'defense_curl', 'light_screen', 'double_edge', 'mega_punch', 'swords_dance', 'mega_kick', 'toxic', 'horn_drill', 'body_slam', 'take_down', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'pay_day', 'counter', 'seismic_toss', 'rage', 'thunderbolt', 'thunder', 'psychic', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'metronome', 'fire_blast', 'skull_bash', 'soft_boiled', 'dream_eater', 'rest', 'thunder_wave', 'psywave', 'substitute', 'flash'],
  114: ['constrict', 'bind', 'absorb', 'poison_powder', 'stun_spore', 'sleep_powder', 'slam', 'growth', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mega_drain', 'solar_beam', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  115: ['comet_punch', 'rage', 'bite', 'tail_whip', 'mega_punch', 'leer', 'dizzy_punch', 'swords_dance', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'submission', 'counter', 'seismic_toss', 'thunderbolt', 'thunder', 'earthquake', 'fissure', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'skull_bash', 'rest', 'substitute', 'cut', 'surf', 'strength'],
  116: ['bubble', 'smokescreen', 'leer', 'water_gun', 'agility', 'hydro_pump', 'toxic', 'take_down', 'double_edge', 'bubble_beam', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'surf'],
  117: ['bubble', 'smokescreen', 'leer', 'water_gun', 'agility', 'hydro_pump', 'toxic', 'take_down', 'double_edge', 'bubble_beam', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'surf'],
  118: ['peck', 'tail_whip', 'supersonic', 'horn_attack', 'fury_attack', 'waterfall', 'horn_drill', 'agility', 'toxic', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'surf'],
  119: ['peck', 'tail_whip', 'supersonic', 'horn_attack', 'fury_attack', 'waterfall', 'horn_drill', 'agility', 'toxic', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'surf'],
  120: ['tackle', 'water_gun', 'harden', 'recover', 'swift', 'minimize', 'light_screen', 'hydro_pump', 'toxic', 'take_down', 'double_edge', 'bubble_beam', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'thunderbolt', 'thunder', 'psychic', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'thunder_wave', 'psywave', 'substitute', 'surf'],
  121: ['tackle', 'water_gun', 'harden', 'recover', 'toxic', 'take_down', 'double_edge', 'bubble_beam', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'thunderbolt', 'thunder', 'psychic', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'swift', 'skull_bash', 'rest', 'thunder_wave', 'psywave', 'substitute', 'surf'],
  122: ['confusion', 'barrier', 'light_screen', 'double_slap', 'meditate', 'substitute', 'mega_punch', 'swords_dance', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'pay_day', 'submission', 'counter', 'seismic_toss', 'rage', 'thunderbolt', 'thunder', 'psychic', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'metronome', 'fire_blast', 'skull_bash', 'dream_eater', 'rest', 'thunder_wave', 'psywave', 'flash'],
  123: ['quick_attack', 'leer', 'focus_energy', 'double_team', 'slash', 'swords_dance', 'agility', 'razor_wind', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'reflect', 'bide', 'swift', 'skull_bash', 'sky_attack', 'rest', 'substitute', 'cut', 'fly'],
  124: ['pound', 'lovely_kiss', 'lick', 'double_slap', 'ice_punch', 'body_slam', 'thrash', 'blizzard', 'toxic', 'take_down', 'double_edge', 'ice_beam', 'hyper_beam', 'counter', 'seismic_toss', 'rage', 'thunderbolt', 'thunder', 'psychic', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'metronome', 'fire_blast', 'skull_bash', 'dream_eater', 'rest', 'thunder_wave', 'psywave', 'substitute', 'flash'],
  125: ['quick_attack', 'leer', 'thunder_shock', 'screech', 'thunder_punch', 'light_screen', 'thunder', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'counter', 'seismic_toss', 'rage', 'thunderbolt', 'mimic', 'double_team', 'reflect', 'bide', 'swift', 'skull_bash', 'rest', 'thunder_wave', 'substitute', 'flash'],
  126: ['ember', 'leer', 'fire_punch', 'smokescreen', 'smog', 'flamethrower', 'confuse_ray', 'fire_blast', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'submission', 'counter', 'seismic_toss', 'rage', 'dragon_rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute'],
  127: ['vicegrip', 'bind', 'seismic_toss', 'guillotine', 'focus_energy', 'harden', 'slash', 'swords_dance', 'mega_punch', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'submission', 'counter', 'rage', 'earthquake', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'cut'],
  128: ['tackle', 'tail_whip', 'stomp', 'leer', 'rage', 'take_down', 'swords_dance', 'toxic', 'body_slam', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'seismic_toss', 'thunderbolt', 'thunder', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'skull_bash', 'rest', 'thunder_wave', 'substitute', 'surf', 'strength'],
  129: ['splash', 'tackle'],
  130: ['bite', 'dragon_rage', 'leer', 'hydro_pump', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'earthquake', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'skull_bash', 'rest', 'substitute', 'surf'],
  131: ['water_gun', 'growl', 'sing', 'mist', 'body_slam', 'confuse_ray', 'ice_beam', 'hydro_pump', 'toxic', 'take_down', 'double_edge', 'bubble_beam', 'blizzard', 'hyper_beam', 'counter', 'seismic_toss', 'rage', 'thunderbolt', 'thunder', 'psychic', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'skull_bash', 'rest', 'thunder_wave', 'substitute', 'surf', 'strength'],
  132: ['transform'],
  133: ['tackle', 'sand_attack', 'quick_attack', 'tail_whip', 'bite', 'take_down', 'toxic', 'body_slam', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  134: ['tackle', 'sand_attack', 'quick_attack', 'water_gun', 'tail_whip', 'bite', 'acid_armor', 'haze', 'mist', 'hydro_pump', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'dig', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'surf'],
  135: ['tackle', 'sand_attack', 'quick_attack', 'thunder_shock', 'tail_whip', 'thunder_wave', 'double_kick', 'agility', 'pin_missile', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'thunderbolt', 'thunder', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute'],
  136: ['tackle', 'sand_attack', 'quick_attack', 'ember', 'tail_whip', 'fire_spin', 'rage', 'leer', 'flamethrower', 'toxic', 'body_slam', 'take_down', 'double_edge', 'hyper_beam', 'dragon_rage', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'rest', 'substitute'],
  137: ['tackle', 'sharpen', 'conversion', 'psybeam', 'recover', 'agility', 'tri_attack', 'swords_dance', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'thunderbolt', 'thunder', 'psychic', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'swift', 'skull_bash', 'rest', 'thunder_wave', 'psywave', 'substitute'],
  138: ['water_gun', 'withdraw', 'horn_attack', 'leer', 'spike_cannon', 'hydro_pump', 'toxic', 'take_down', 'double_edge', 'bubble_beam', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute', 'surf'],
  139: ['water_gun', 'withdraw', 'horn_attack', 'leer', 'spike_cannon', 'hydro_pump', 'toxic', 'take_down', 'double_edge', 'bubble_beam', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute', 'surf'],
  140: ['scratch', 'harden', 'absorb', 'slash', 'leer', 'hydro_pump', 'toxic', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'rest', 'substitute', 'surf'],
  141: ['scratch', 'harden', 'absorb', 'slash', 'leer', 'hydro_pump', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'counter', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'skull_bash', 'rest', 'substitute', 'cut', 'surf'],
  142: ['wing_attack', 'agility', 'supersonic', 'bite', 'take_down', 'hyper_beam', 'toxic', 'double_edge', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'swift', 'sky_attack', 'rest', 'substitute', 'fly'],
  143: ['headbutt', 'amnesia', 'rest', 'body_slam', 'harden', 'double_edge', 'hyper_beam', 'mega_punch', 'swords_dance', 'mega_kick', 'toxic', 'take_down', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'submission', 'counter', 'seismic_toss', 'rage', 'dragon_rage', 'thunderbolt', 'thunder', 'earthquake', 'fissure', 'dig', 'psychic', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'metronome', 'self_destruct', 'fire_blast', 'skull_bash', 'soft_boiled', 'dream_eater', 'thunder_wave', 'explosion', 'rock_slide', 'substitute', 'cut', 'surf', 'strength'],
  144: ['peck', 'ice_beam', 'blizzard', 'agility', 'mist', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'swift', 'sky_attack', 'rest', 'substitute', 'fly'],
  145: ['thunder_shock', 'drill_peck', 'thunder', 'agility', 'light_screen', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'thunderbolt', 'mimic', 'double_team', 'reflect', 'bide', 'swift', 'sky_attack', 'rest', 'thunder_wave', 'substitute', 'fly'],
  146: ['peck', 'fire_spin', 'leer', 'agility', 'sky_attack', 'toxic', 'take_down', 'double_edge', 'hyper_beam', 'rage', 'dragon_rage', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'swift', 'rest', 'substitute', 'fly'],
  147: ['wrap', 'leer', 'thunder_wave', 'agility', 'slam', 'dragon_rage', 'hyper_beam', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'submission', 'counter', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'skull_bash', 'rest', 'substitute', 'surf'],
  148: ['wrap', 'leer', 'thunder_wave', 'agility', 'slam', 'dragon_rage', 'hyper_beam', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'submission', 'counter', 'rage', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'skull_bash', 'rest', 'substitute', 'surf'],
  149: ['wrap', 'leer', 'thunder_wave', 'agility', 'slam', 'dragon_rage', 'hyper_beam', 'mega_punch', 'swords_dance', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'submission', 'counter', 'rage', 'earthquake', 'mimic', 'double_team', 'reflect', 'bide', 'fire_blast', 'skull_bash', 'rest', 'substitute', 'fly', 'surf'],
  150: ['confusion', 'disable', 'swift', 'psychic', 'barrier', 'recover', 'mist', 'amnesia', 'mega_punch', 'swords_dance', 'mega_kick', 'toxic', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'pay_day', 'submission', 'counter', 'seismic_toss', 'rage', 'thunderbolt', 'thunder', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'metronome', 'fire_blast', 'skull_bash', 'dream_eater', 'rest', 'thunder_wave', 'psywave', 'substitute', 'surf', 'strength', 'flash'],
  151: ['pound', 'transform', 'mega_punch', 'metronome', 'psychic', 'razor_wind', 'swords_dance', 'whirlwind', 'mega_kick', 'toxic', 'horn_drill', 'body_slam', 'take_down', 'double_edge', 'bubble_beam', 'water_gun', 'ice_beam', 'blizzard', 'hyper_beam', 'pay_day', 'submission', 'counter', 'seismic_toss', 'rage', 'mega_drain', 'solar_beam', 'dragon_rage', 'thunderbolt', 'thunder', 'earthquake', 'fissure', 'dig', 'teleport', 'mimic', 'double_team', 'reflect', 'bide', 'self_destruct', 'egg_bomb', 'fire_blast', 'swift', 'skull_bash', 'soft_boiled', 'dream_eater', 'sky_attack', 'rest', 'thunder_wave', 'psywave', 'explosion', 'rock_slide', 'tri_attack', 'substitute', 'cut', 'fly', 'surf', 'strength', 'flash'],
};

export const POKEMON: any[] = [
  {id:1,  name:'bulbasaur',   types:['grass','poison'],  rarity:3, hp:45,  atk:49,  def:49,  spAtk:65, spDef:65, spd:45},
  {id:2,  name:'ivysaur',     types:['grass','poison'],  rarity:3, hp:60,  atk:62,  def:63,  spAtk:80, spDef:80, spd:60},
  {id:3,  name:'venusaur',    types:['grass','poison'],  rarity:4, hp:80,  atk:82,  def:83,  spAtk:100,spDef:100,spd:80},
  {id:4,  name:'charmander',  types:['fire'],            rarity:3, hp:39,  atk:52,  def:43,  spAtk:60, spDef:50, spd:65},
  {id:5,  name:'charmeleon',  types:['fire'],            rarity:3, hp:58,  atk:64,  def:58,  spAtk:80, spDef:65, spd:80},
  {id:6,  name:'charizard',   types:['fire','flying'],   rarity:4, hp:78,  atk:84,  def:78,  spAtk:109,spDef:85, spd:100},
  {id:7,  name:'squirtle',    types:['water'],           rarity:3, hp:44,  atk:48,  def:65,  spAtk:50, spDef:64, spd:43},
  {id:8,  name:'wartortle',   types:['water'],           rarity:3, hp:59,  atk:63,  def:80,  spAtk:65, spDef:80, spd:58},
  {id:9,  name:'blastoise',   types:['water'],           rarity:4, hp:79,  atk:83,  def:100, spAtk:85, spDef:105,spd:78},
  {id:10, name:'caterpie',    types:['bug'],             rarity:1, hp:45,  atk:30,  def:35,  spAtk:20, spDef:20, spd:45},
  {id:11, name:'metapod',     types:['bug'],             rarity:1, hp:50,  atk:20,  def:55,  spAtk:25, spDef:25, spd:30},
  {id:12, name:'butterfree',  types:['bug','flying'],    rarity:3, hp:60,  atk:45,  def:50,  spAtk:90, spDef:80, spd:70},
  {id:13, name:'weedle',      types:['bug','poison'],    rarity:1, hp:40,  atk:35,  def:30,  spAtk:20, spDef:20, spd:50},
  {id:14, name:'kakuna',      types:['bug','poison'],    rarity:1, hp:45,  atk:25,  def:50,  spAtk:25, spDef:25, spd:35},
  {id:15, name:'beedrill',    types:['bug','poison'],    rarity:3, hp:65,  atk:90,  def:40,  spAtk:45, spDef:80, spd:75},
  {id:16, name:'pidgey',      types:['normal','flying'], rarity:1, hp:40,  atk:45,  def:40,  spAtk:35, spDef:35, spd:56},
  {id:17, name:'pidgeotto',   types:['normal','flying'], rarity:2, hp:63,  atk:60,  def:55,  spAtk:50, spDef:50, spd:71},
  {id:18, name:'pidgeot',     types:['normal','flying'], rarity:3, hp:83,  atk:80,  def:75,  spAtk:70, spDef:70, spd:101},
  {id:19, name:'rattata',     types:['normal'],          rarity:1, hp:30,  atk:56,  def:35,  spAtk:25, spDef:35, spd:72},
  {id:20, name:'raticate',    types:['normal'],          rarity:2, hp:55,  atk:81,  def:60,  spAtk:50, spDef:70, spd:97},
  {id:21, name:'spearow',     types:['normal','flying'], rarity:1, hp:40,  atk:60,  def:30,  spAtk:31, spDef:31, spd:70},
  {id:22, name:'fearow',      types:['normal','flying'], rarity:2, hp:65,  atk:90,  def:65,  spAtk:61, spDef:61, spd:100},
  {id:23, name:'ekans',       types:['poison'],          rarity:1, hp:35,  atk:60,  def:44,  spAtk:40, spDef:54, spd:55},
  {id:24, name:'arbok',       types:['poison'],          rarity:2, hp:60,  atk:95,  def:69,  spAtk:65, spDef:79, spd:80},
  {id:25, name:'pikachu',     types:['electric'],        rarity:2, hp:35,  atk:55,  def:40,  spAtk:50, spDef:50, spd:90},
  {id:26, name:'raichu',      types:['electric'],        rarity:3, hp:60,  atk:90,  def:55,  spAtk:90, spDef:80, spd:110},
  {id:27, name:'sandshrew',   types:['ground'],          rarity:1, hp:50,  atk:75,  def:85,  spAtk:20, spDef:30, spd:40},
  {id:28, name:'sandslash',   types:['ground'],          rarity:2, hp:75,  atk:100, def:110, spAtk:45, spDef:55, spd:65},
  {id:29, name:'nidoran-f',   types:['poison'],          rarity:1, hp:55,  atk:47,  def:52,  spAtk:40, spDef:40, spd:41},
  {id:30, name:'nidorina',    types:['poison'],          rarity:2, hp:70,  atk:62,  def:67,  spAtk:55, spDef:55, spd:56},
  {id:31, name:'nidoqueen',   types:['poison','ground'], rarity:3, hp:90,  atk:92,  def:87,  spAtk:75, spDef:85, spd:76},
  {id:32, name:'nidoran-m',   types:['poison'],          rarity:1, hp:46,  atk:57,  def:40,  spAtk:40, spDef:40, spd:50},
  {id:33, name:'nidorino',    types:['poison'],          rarity:2, hp:61,  atk:72,  def:57,  spAtk:55, spDef:55, spd:65},
  {id:34, name:'nidoking',    types:['poison','ground'], rarity:3, hp:81,  atk:102, def:77,  spAtk:85, spDef:75, spd:85},
  {id:35, name:'clefairy',    types:['normal'],          rarity:3, hp:70,  atk:45,  def:48,  spAtk:60, spDef:65, spd:35},
  {id:36, name:'clefable',    types:['normal'],          rarity:3, hp:95,  atk:70,  def:73,  spAtk:95, spDef:90, spd:60},
  {id:37, name:'vulpix',      types:['fire'],            rarity:3, hp:38,  atk:41,  def:40,  spAtk:50, spDef:65, spd:65},
  {id:38, name:'ninetales',   types:['fire'],            rarity:3, hp:73,  atk:76,  def:75,  spAtk:81, spDef:100,spd:100},
  {id:39, name:'jigglypuff',  types:['normal'],          rarity:3, hp:115, atk:45,  def:20,  spAtk:45, spDef:25, spd:20},
  {id:40, name:'wigglytuff',  types:['normal'],          rarity:3, hp:140, atk:70,  def:45,  spAtk:85, spDef:50, spd:45},
  {id:41, name:'zubat',       types:['poison','flying'], rarity:1, hp:40,  atk:45,  def:35,  spAtk:30, spDef:40, spd:55},
  {id:42, name:'golbat',      types:['poison','flying'], rarity:2, hp:75,  atk:80,  def:70,  spAtk:65, spDef:75, spd:90},
  {id:43, name:'oddish',      types:['grass','poison'],  rarity:1, hp:45,  atk:50,  def:55,  spAtk:75, spDef:65, spd:30},
  {id:44, name:'gloom',       types:['grass','poison'],  rarity:2, hp:60,  atk:65,  def:70,  spAtk:85, spDef:75, spd:40},
  {id:45, name:'vileplume',   types:['grass','poison'],  rarity:3, hp:75,  atk:80,  def:85,  spAtk:110,spDef:90, spd:50},
  {id:46, name:'paras',       types:['bug','grass'],     rarity:1, hp:35,  atk:70,  def:55,  spAtk:45, spDef:55, spd:25},
  {id:47, name:'parasect',    types:['bug','grass'],     rarity:2, hp:60,  atk:95,  def:80,  spAtk:60, spDef:80, spd:30},
  {id:48, name:'venonat',     types:['bug','poison'],    rarity:1, hp:60,  atk:55,  def:50,  spAtk:40, spDef:55, spd:45},
  {id:49, name:'venomoth',    types:['bug','poison'],    rarity:2, hp:70,  atk:65,  def:60,  spAtk:90, spDef:75, spd:90},
  {id:50, name:'diglett',     types:['ground'],          rarity:1, hp:10,  atk:55,  def:25,  spAtk:35, spDef:45, spd:95},
  {id:51, name:'dugtrio',     types:['ground'],          rarity:2, hp:35,  atk:100, def:50,  spAtk:50, spDef:70, spd:120},
  {id:52, name:'meowth',      types:['normal'],          rarity:1, hp:40,  atk:45,  def:35,  spAtk:40, spDef:40, spd:90},
  {id:53, name:'persian',     types:['normal'],          rarity:2, hp:65,  atk:70,  def:60,  spAtk:65, spDef:65, spd:115},
  {id:54, name:'psyduck',     types:['water'],           rarity:1, hp:50,  atk:52,  def:48,  spAtk:65, spDef:50, spd:55},
  {id:55, name:'golduck',     types:['water'],           rarity:2, hp:80,  atk:82,  def:78,  spAtk:95, spDef:80, spd:85},
  {id:56, name:'mankey',      types:['fighting'],        rarity:1, hp:40,  atk:80,  def:35,  spAtk:35, spDef:45, spd:70},
  {id:57, name:'primeape',    types:['fighting'],        rarity:2, hp:65,  atk:105, def:60,  spAtk:60, spDef:70, spd:95},
  {id:58, name:'growlithe',   types:['fire'],            rarity:1, hp:55,  atk:70,  def:45,  spAtk:70, spDef:50, spd:60},
  {id:59, name:'arcanine',    types:['fire'],            rarity:3, hp:90,  atk:110, def:80,  spAtk:100,spDef:80, spd:95},
  {id:60, name:'poliwag',     types:['water'],           rarity:1, hp:40,  atk:50,  def:40,  spAtk:40, spDef:40, spd:90},
  {id:61, name:'poliwhirl',   types:['water'],           rarity:2, hp:65,  atk:65,  def:65,  spAtk:50, spDef:50, spd:90},
  {id:62, name:'poliwrath',   types:['water','fighting'],rarity:3, hp:90,  atk:95,  def:95,  spAtk:70, spDef:90, spd:70},
  {id:63, name:'abra',        types:['psychic'],         rarity:2, hp:25,  atk:20,  def:15,  spAtk:105,spDef:55, spd:90},
  {id:64, name:'kadabra',     types:['psychic'],         rarity:3, hp:40,  atk:35,  def:30,  spAtk:120,spDef:70, spd:105},
  {id:65, name:'alakazam',    types:['psychic'],         rarity:4, hp:55,  atk:50,  def:45,  spAtk:135,spDef:95, spd:120},
  {id:66, name:'machop',      types:['fighting'],        rarity:2, hp:70,  atk:80,  def:50,  spAtk:35, spDef:35, spd:35},
  {id:67, name:'machoke',     types:['fighting'],        rarity:3, hp:80,  atk:100, def:70,  spAtk:50, spDef:60, spd:45},
  {id:68, name:'machamp',     types:['fighting'],        rarity:4, hp:90,  atk:130, def:80,  spAtk:65, spDef:85, spd:55},
  {id:69, name:'bellsprout',  types:['grass','poison'],  rarity:1, hp:50,  atk:75,  def:35,  spAtk:70, spDef:30, spd:40},
  {id:70, name:'weepinbell',  types:['grass','poison'],  rarity:2, hp:65,  atk:90,  def:50,  spAtk:85, spDef:45, spd:55},
  {id:71, name:'victreebel',  types:['grass','poison'],  rarity:3, hp:80,  atk:105, def:65,  spAtk:100,spDef:70, spd:70},
  {id:72, name:'tentacool',   types:['water','poison'],  rarity:1, hp:40,  atk:40,  def:35,  spAtk:50, spDef:100,spd:70},
  {id:73, name:'tentacruel',  types:['water','poison'],  rarity:2, hp:80,  atk:70,  def:65,  spAtk:80, spDef:120,spd:100},
  {id:74, name:'geodude',     types:['rock','ground'],   rarity:1, hp:40,  atk:80,  def:100, spAtk:30, spDef:30, spd:20},
  {id:75, name:'graveler',    types:['rock','ground'],   rarity:2, hp:55,  atk:95,  def:115, spAtk:45, spDef:45, spd:35},
  {id:76, name:'golem',       types:['rock','ground'],   rarity:4, hp:80,  atk:120, def:130, spAtk:55, spDef:65, spd:45},
  {id:77, name:'ponyta',      types:['fire'],            rarity:2, hp:50,  atk:85,  def:55,  spAtk:65, spDef:65, spd:90},
  {id:78, name:'rapidash',    types:['fire'],            rarity:3, hp:65,  atk:100, def:70,  spAtk:80, spDef:80, spd:105},
  {id:79, name:'slowpoke',    types:['water','psychic'], rarity:3, hp:90,  atk:65,  def:65,  spAtk:40, spDef:40, spd:15},
  {id:80, name:'slowbro',     types:['water','psychic'], rarity:3, hp:95,  atk:75,  def:110, spAtk:100,spDef:80, spd:30},
  {id:81, name:'magnemite',   types:['electric','steel'],rarity:1, hp:25,  atk:35,  def:70,  spAtk:95, spDef:55, spd:45},
  {id:82, name:'magneton',    types:['electric','steel'],rarity:2, hp:50,  atk:60,  def:95,  spAtk:120,spDef:70, spd:70},
  {id:83, name:"farfetch'd",  types:['normal','flying'], rarity:3, hp:52,  atk:65,  def:55,  spAtk:58, spDef:62, spd:60},
  {id:84, name:'doduo',       types:['normal','flying'], rarity:1, hp:35,  atk:85,  def:45,  spAtk:35, spDef:35, spd:75},
  {id:85, name:'dodrio',      types:['normal','flying'], rarity:2, hp:60,  atk:110, def:70,  spAtk:60, spDef:60, spd:110},
  {id:86, name:'seel',        types:['water'],           rarity:1, hp:65,  atk:45,  def:55,  spAtk:45, spDef:70, spd:45},
  {id:87, name:'dewgong',     types:['water','ice'],     rarity:2, hp:90,  atk:70,  def:80,  spAtk:70, spDef:95, spd:70},
  {id:88, name:'grimer',      types:['poison'],          rarity:1, hp:80,  atk:80,  def:50,  spAtk:40, spDef:50, spd:25},
  {id:89, name:'muk',         types:['poison'],          rarity:2, hp:105, atk:105, def:75,  spAtk:65, spDef:100,spd:50},
  {id:90, name:'shellder',    types:['water'],           rarity:1, hp:30,  atk:65,  def:100, spAtk:45, spDef:25, spd:40},
  {id:91, name:'cloyster',    types:['water','ice'],     rarity:2, hp:50,  atk:95,  def:180, spAtk:85, spDef:45, spd:70},
  {id:92, name:'gastly',      types:['ghost','poison'],  rarity:1, hp:30,  atk:35,  def:30,  spAtk:100,spDef:35, spd:80},
  {id:93, name:'haunter',     types:['ghost','poison'],  rarity:2, hp:45,  atk:50,  def:45,  spAtk:115,spDef:55, spd:95},
  {id:94, name:'gengar',      types:['ghost','poison'],  rarity:4, hp:60,  atk:65,  def:60,  spAtk:130,spDef:75, spd:110},
  {id:95, name:'onix',        types:['rock','ground'],   rarity:3, hp:35,  atk:45,  def:160, spAtk:30, spDef:45, spd:70},
  {id:96, name:'drowzee',     types:['psychic'],         rarity:2, hp:60,  atk:48,  def:45,  spAtk:43, spDef:90, spd:42},
  {id:97, name:'hypno',       types:['psychic'],         rarity:2, hp:85,  atk:73,  def:70,  spAtk:73, spDef:115,spd:67},
  {id:98, name:'krabby',      types:['water'],           rarity:1, hp:30,  atk:105, def:90,  spAtk:25, spDef:25, spd:50},
  {id:99, name:'kingler',     types:['water'],           rarity:2, hp:55,  atk:130, def:115, spAtk:50, spDef:50, spd:75},
  {id:100,name:'voltorb',     types:['electric'],        rarity:1, hp:40,  atk:30,  def:50,  spAtk:55, spDef:55, spd:100},
  {id:101,name:'electrode',   types:['electric'],        rarity:2, hp:60,  atk:50,  def:70,  spAtk:80, spDef:80, spd:140},
  {id:102,name:'exeggcute',   types:['grass','psychic'], rarity:3, hp:60,  atk:40,  def:80,  spAtk:60, spDef:45, spd:40},
  {id:103,name:'exeggutor',   types:['grass','psychic'], rarity:4, hp:95,  atk:95,  def:85,  spAtk:125,spDef:75, spd:55},
  {id:104,name:'cubone',      types:['ground'],          rarity:3, hp:50,  atk:50,  def:95,  spAtk:40, spDef:50, spd:35},
  {id:105,name:'marowak',     types:['ground'],          rarity:3, hp:60,  atk:80,  def:110, spAtk:50, spDef:80, spd:45},
  {id:106,name:'hitmonlee',   types:['fighting'],        rarity:3, hp:50,  atk:120, def:53,  spAtk:35, spDef:110,spd:87},
  {id:107,name:'hitmonchan',  types:['fighting'],        rarity:3, hp:50,  atk:105, def:79,  spAtk:35, spDef:110,spd:76},
  {id:108,name:'lickitung',   types:['normal'],          rarity:3, hp:90,  atk:55,  def:75,  spAtk:60, spDef:75, spd:30},
  {id:109,name:'koffing',     types:['poison'],          rarity:1, hp:40,  atk:65,  def:95,  spAtk:60, spDef:45, spd:35},
  {id:110,name:'weezing',     types:['poison'],          rarity:2, hp:65,  atk:90,  def:120, spAtk:85, spDef:70, spd:60},
  {id:111,name:'rhyhorn',     types:['ground','rock'],   rarity:2, hp:80,  atk:85,  def:95,  spAtk:30, spDef:30, spd:25},
  {id:112,name:'rhydon',      types:['ground','rock'],   rarity:3, hp:105, atk:130, def:120, spAtk:45, spDef:45, spd:40},
  {id:113,name:'chansey',     types:['normal'],          rarity:3, hp:250, atk:5,   def:5,   spAtk:35, spDef:105,spd:50},
  {id:114,name:'tangela',     types:['grass'],           rarity:3, hp:65,  atk:55,  def:115, spAtk:100,spDef:40, spd:60},
  {id:115,name:'kangaskhan',  types:['normal'],          rarity:3, hp:105, atk:95,  def:80,  spAtk:40, spDef:80, spd:90},
  {id:116,name:'horsea',      types:['water'],           rarity:2, hp:30,  atk:40,  def:70,  spAtk:70, spDef:25, spd:60},
  {id:117,name:'seadra',      types:['water'],           rarity:2, hp:55,  atk:65,  def:95,  spAtk:95, spDef:45, spd:85},
  {id:118,name:'goldeen',     types:['water'],           rarity:1, hp:45,  atk:67,  def:60,  spAtk:35, spDef:50, spd:63},
  {id:119,name:'seaking',     types:['water'],           rarity:2, hp:80,  atk:92,  def:65,  spAtk:65, spDef:80, spd:68},
  {id:120,name:'staryu',      types:['water'],           rarity:1, hp:30,  atk:45,  def:55,  spAtk:70, spDef:55, spd:85},
  {id:121,name:'starmie',     types:['water','psychic'], rarity:2, hp:60,  atk:75,  def:85,  spAtk:100,spDef:85, spd:115},
  {id:122,name:"mr. mime",    types:['psychic'],         rarity:3, hp:40,  atk:45,  def:65,  spAtk:100,spDef:120,spd:90},
  {id:123,name:'scyther',     types:['bug','flying'],    rarity:3, hp:70,  atk:110, def:80,  spAtk:55, spDef:80, spd:105},
  {id:124,name:'jynx',        types:['ice','psychic'],   rarity:3, hp:65,  atk:50,  def:35,  spAtk:115,spDef:95, spd:95},
  {id:125,name:'electabuzz',  types:['electric'],        rarity:3, hp:65,  atk:83,  def:57,  spAtk:105,spDef:85, spd:105},
  {id:126,name:'magmar',      types:['fire'],            rarity:3, hp:65,  atk:95,  def:57,  spAtk:100,spDef:85, spd:93},
  {id:127,name:'pinsir',      types:['bug'],             rarity:3, hp:65,  atk:125, def:100, spAtk:55, spDef:70, spd:85},
  {id:128,name:'tauros',      types:['normal'],          rarity:3, hp:75,  atk:100, def:95,  spAtk:40, spDef:70, spd:110},
  {id:129,name:'magikarp',    types:['water'],           rarity:1, hp:20,  atk:10,  def:55,  spAtk:15, spDef:20, spd:80},
  {id:130,name:'gyarados',    types:['water','flying'],  rarity:4, hp:95,  atk:125, def:79,  spAtk:60, spDef:100,spd:81},
  {id:131,name:'lapras',      types:['water','ice'],     rarity:4, hp:130, atk:85,  def:80,  spAtk:85, spDef:95, spd:60},
  {id:132,name:'ditto',       types:['normal'],          rarity:3, hp:48,  atk:48,  def:48,  spAtk:48, spDef:48, spd:48},
  {id:133,name:'eevee',       types:['normal'],          rarity:3, hp:55,  atk:55,  def:50,  spAtk:45, spDef:65, spd:55},
  {id:134,name:'vaporeon',    types:['water'],           rarity:4, hp:130, atk:65,  def:60,  spAtk:110,spDef:95, spd:65},
  {id:135,name:'jolteon',     types:['electric'],        rarity:4, hp:65,  atk:65,  def:60,  spAtk:110,spDef:95, spd:130},
  {id:136,name:'flareon',     types:['fire'],            rarity:4, hp:65,  atk:130, def:60,  spAtk:95, spDef:110,spd:65},
  {id:137,name:'porygon',     types:['normal'],          rarity:4, hp:65,  atk:60,  def:70,  spAtk:85, spDef:75, spd:40},
  {id:138,name:'omanyte',     types:['rock','water'],    rarity:4, hp:35,  atk:40,  def:100, spAtk:90, spDef:55, spd:35},
  {id:139,name:'omastar',     types:['rock','water'],    rarity:4, hp:70,  atk:60,  def:125, spAtk:115,spDef:70, spd:55},
  {id:140,name:'kabuto',      types:['rock','water'],    rarity:4, hp:30,  atk:80,  def:90,  spAtk:55, spDef:45, spd:55},
  {id:141,name:'kabutops',    types:['rock','water'],    rarity:4, hp:60,  atk:115, def:105, spAtk:65, spDef:70, spd:80},
  {id:142,name:'aerodactyl',  types:['rock','flying'],   rarity:4, hp:80,  atk:105, def:65,  spAtk:60, spDef:75, spd:130},
  {id:143,name:'snorlax',     types:['normal'],          rarity:4, hp:160, atk:110, def:65,  spAtk:65, spDef:110,spd:30},
  {id:144,name:'articuno',    types:['ice','flying'],    rarity:5, hp:90,  atk:85,  def:100, spAtk:95, spDef:125,spd:85},
  {id:145,name:'zapdos',      types:['electric','flying'],rarity:5,hp:90,  atk:90,  def:85,  spAtk:125,spDef:90, spd:100},
  {id:146,name:'moltres',     types:['fire','flying'],   rarity:5, hp:90,  atk:100, def:90,  spAtk:125,spDef:85, spd:90},
  {id:147,name:'dratini',     types:['dragon'],          rarity:4, hp:41,  atk:64,  def:45,  spAtk:50, spDef:50, spd:50},
  {id:148,name:'dragonair',   types:['dragon'],          rarity:4, hp:61,  atk:84,  def:65,  spAtk:70, spDef:70, spd:70},
  {id:149,name:'dragonite',   types:['dragon','flying'], rarity:4, hp:91,  atk:134, def:95,  spAtk:100,spDef:100,spd:80},
  {id:150,name:'mewtwo',      types:['psychic'],         rarity:5, hp:106, atk:110, def:90,  spAtk:154,spDef:90, spd:130},
  {id:151,name:'mew',         types:['psychic'],         rarity:5, hp:100, atk:100, def:100, spAtk:100,spDef:100,spd:100},
];
