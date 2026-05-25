// js/gacha.js — Tall grass encounter + dramatic coin flip catching

const ENC = {
  clicks: 0,    // steps since last encounter
  nextAt: 0,    // steps threshold for next encounter
  phase: 'walk', // 'walk' | 'encounter'
  wildPoke: null,
  incenseActive: false, // one-shot: next roll is a random uncaptured common–rare
};
ENC.nextAt = nextEncAt();

function nextEncAt() { return 4 + Math.floor(Math.random() * 23); }

// ---- Incense: activate (next encounter = uncaptured common–rare) ----
function incenseCount() { return G.bag['incense'] || 0; }

function useIncense() {
  if (ENC.phase !== 'walk') { toast(t('incense_busy')); return; }
  if (incenseCount() <= 0) { toast(t('incense_none')); return; }
  if (ENC.incenseActive) { toast(t('incense_already')); return; }
  G.bag['incense'] = incenseCount() - 1;
  ENC.incenseActive = true;
  save(); updateHUD(); updateIncenseUI();
  toast(t('incense_on'));
}

// Show/refresh the incense button + active banner on the gacha screen.
function updateIncenseUI() {
  const btn = document.getElementById('incenseBtn');
  const banner = document.getElementById('incenseActive');
  if (btn) {
    const n = incenseCount();
    btn.style.display = n > 0 ? 'flex' : 'none';
    const cnt = document.getElementById('incenseBtnCount');
    if (cnt) cnt.textContent = n;
    btn.disabled = ENC.incenseActive;
  }
  if (banner) banner.style.display = ENC.incenseActive ? 'block' : 'none';
}

// ---- Grass tap ----
function onGrassTap() {
  if (ENC.phase !== 'walk') return;

  ENC.clicks++;
  document.getElementById('clickCounter').textContent = ENC.clicks;

  const btn = document.getElementById('grassBtn');
  btn.classList.remove('shake');
  void btn.offsetWidth;            // force reflow so animation restarts on rapid taps
  btn.classList.add('shake');
  setTimeout(() => btn.classList.remove('shake'), 280);

  if (ENC.clicks >= ENC.nextAt) {
    ENC.phase = 'encounter';
    const hint = document.getElementById('grassHint');
    btn.classList.add('excl');
    btn.disabled = true;
    hint.textContent = '! ! !';
    setTimeout(() => {
      btn.classList.remove('excl');
      btn.disabled = false;
      hint.textContent = 'TAP TO WALK';
      triggerEncounter();
    }, 700);
  }
}

// ---- Roll pokemon ----
// Pity advances on successful CAPTURE (see catchPokemon).
// Odds 1 — at pity (>=80): the forced reward is 80% Epic / 20% Legendary.
// Odds 2 — whenever a Legendary is chosen: 80% chance it's one the player has
//          NOT caught yet, 20% chance it's one they already have (with safe
//          fallback when either bucket is empty).
function pickRandom(pool) {
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

// Incense reward: a random UNCAPTURED Pokémon in rarities 1–3 (common–rare).
// Falls back to any common–rare if the player has already caught them all.
function pickIncensePokemon() {
  const pool = POKEMON.filter(p => p.rarity >= 1 && p.rarity <= 3);
  const uncaught = pool.filter(p => !(G.collection[p.id] && G.collection[p.id].count > 0));
  return pickRandom(uncaught.length ? uncaught : pool);
}

function pickLegendary() {
  const legendaries = POKEMON.filter(p => p.rarity === 5);
  const uncaught = legendaries.filter(p => !(G.collection[p.id] && G.collection[p.id].count > 0));
  const caught   = legendaries.filter(p =>  (G.collection[p.id] && G.collection[p.id].count > 0));

  // 80% uncaught / 20% caught — but fall back to whichever bucket has members.
  const wantUncaught = Math.random() < 0.80;
  let pool;
  if (wantUncaught) pool = uncaught.length ? uncaught : caught;
  else              pool = caught.length   ? caught   : uncaught;
  // Final safety: if somehow both empty, use the full legendary list.
  return pickRandom(pool.length ? pool : legendaries);
}

function rollPokemon() {
  // INCENSE: one-shot override — next encounter is a random UNCAPTURED Pokémon
  // in the common–rare range (rarities 1–3). Consumed here.
  if (ENC.incenseActive) {
    ENC.incenseActive = false;
    return pickIncensePokemon();
  }

  // Odds 1: pity reached → 80% Epic, 20% Legendary (no longer a flat guarantee).
  if (G.pity >= 80) {
    if (Math.random() < 0.20) return pickLegendary();
    return pickRandom(POKEMON.filter(p => p.rarity === 4));
  }
  const r = Math.random();
  if (r < 0.01) {
    return pickLegendary();                                   // Odds 2 applies here too
  }
  if (r < 0.05) {
    return pickRandom(POKEMON.filter(p => p.rarity === 4));
  }
  if (r < 0.20) {
    return pickRandom(POKEMON.filter(p => p.rarity === 3));
  }
  if (r < 0.50) {
    return pickRandom(POKEMON.filter(p => p.rarity === 2));
  }
  return pickRandom(POKEMON.filter(p => p.rarity === 1));
}

// ---- Trigger encounter ----
function triggerEncounter() {
  const poke = rollPokemon();
  ENC.wildPoke = poke;

  // (Pity now advances on successful CAPTURE, not on encounter — see catchPokemon.)
  // rollPokemon() consumes any active incense; refresh its button/banner.
  updateIncenseUI();

  ENC.clicks = 0;
  ENC.nextAt = nextEncAt();
  save();

  // Update pity bar immediately
  updatePityBar();

  // Screen flash — legendary gets an extra gold flash
  const f = document.createElement('div');
  f.className = poke.rarity === 5 ? 'screen-flash legendary-flash' : 'screen-flash';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 600);

  // Populate overlay
  document.getElementById('wildSprite').src = spriteAnimated(poke.id);
  document.getElementById('wildName').textContent = t('wild_appeared', { name: poke.name.toUpperCase() });
  document.getElementById('wildRarity').textContent = rarityStars(poke.rarity);
  document.getElementById('wildTypes').innerHTML = poke.types.map(typeBadge).join(' ');

  // Captured/collected indicator: tell the player if this Pokémon is already
  // in their Box (and how many) so they can decide whether to spend Poké Balls.
  const ownedEl = document.getElementById('wildOwned');
  const ownedCount = (G.collection[poke.id] && G.collection[poke.id].count) || 0;
  if (ownedCount > 0) {
    ownedEl.className = 'wild-owned-plate owned';
    ownedEl.innerHTML = `${svgIcon('check', '#4ade80', 13)} ${t('wild_owned', { n: ownedCount })}`;
  } else {
    ownedEl.className = 'wild-owned-plate is-new';
    ownedEl.innerHTML = `${svgIcon('star', '#ffd700', 13)} ${t('wild_new')}`;
  }
  ownedEl.style.display = 'inline-flex';

  // Apply rarity glow + animation to sprite
  const spriteEl = document.getElementById('wildSprite');
  if (poke.rarity === 5) {
    spriteEl.style.filter = 'drop-shadow(0 0 24px #ffd700aa) drop-shadow(0 0 8px #ffd70066)';
    spriteEl.style.animation = 'legendaryFloat 2s ease-in-out infinite';
  } else if (poke.rarity === 4) {
    spriteEl.style.filter = 'drop-shadow(0 0 16px #f43f5e88)';
    spriteEl.style.animation = '';
  } else if (poke.rarity === 3) {
    spriteEl.style.filter = 'drop-shadow(0 0 16px #38bdf888)';
    spriteEl.style.animation = '';
  } else if (poke.rarity === 2) {
    spriteEl.style.filter = 'drop-shadow(0 0 16px #4ade8088)';
    spriteEl.style.animation = '';
  } else {
    spriteEl.style.filter = 'none';
    spriteEl.style.animation = '';
  }

  resetCoinUI();
  document.getElementById('wildPokeWrap').style.display = 'block';
  document.getElementById('encounterOverlay').classList.add('open');
  updateHUD();
}

// ---- Coin UI reset ----
function resetCoinUI() {
  const coin = document.getElementById('theCoin');
  coin.className = 'coin';
  coin.innerHTML = coinHTML('coin', 'tails');
  const res = document.getElementById('coinResult');
  res.textContent = t('flip_prompt');
  res.className = 'coin-result';
  document.getElementById('flipBtn').style.display = '';
  document.getElementById('flipBtn').disabled = false;
  document.getElementById('ballBtn').style.display = 'none';
  document.getElementById('buyBallBtn').style.display = 'none';
  document.getElementById('runBtn').disabled = false;
  // Remove any leftover particles
  document.querySelectorAll('.coin-particle').forEach(p => p.remove());
  updateHUD();
}

// ---- Dramatic Coin Flip ----
function doFlip() {
  runDramaticFlip(false);
}

function runDramaticFlip(usingBall) {
  const coin = document.getElementById('theCoin');
  const res = document.getElementById('coinResult');
  const flipBtn = document.getElementById('flipBtn');
  const ballBtn = document.getElementById('ballBtn');
  const buyBallBtn = document.getElementById('buyBallBtn');
  const runBtn = document.getElementById('runBtn');

  flipBtn.disabled = true;
  ballBtn.style.display = 'none';
  buyBallBtn.style.display = 'none';
  runBtn.disabled = true;

  // Phase 1: Launch into fast spin
  coin.className = 'coin flipping-dramatic';
  coin.innerHTML = coinHTML(usingBall ? 'ball' : 'coin', 'tails');
  res.textContent = t('flipping');
  res.className = 'coin-result';

  // Shake the whole coin-wrap
  const wrap = document.querySelector('.coin-wrap');
  wrap.classList.add('shake');
  setTimeout(() => wrap.classList.remove('shake'), 600);

  setTimeout(() => {
    // Phase 2: Slow-down tease
    coin.className = 'coin slowing';

      setTimeout(() => {
        // Phase 4: Reveal
        const heads = Math.random() < 0.5;
        coin.className = 'coin ' + (heads ? 'heads' : 'tails') + ' land';
        coin.innerHTML = coinHTML('heads', 'tails');

        // Burst particles
        burstParticles(coin, heads);

        if (heads) {
          res.textContent = usingBall ? t('heads_ball') : t('heads_gotcha');
          res.className = 'coin-result ok';
          flipBtn.style.display = 'none';
          // Screen flash green
          flashScreen('#00ff6633');
          setTimeout(() => catchPokemon(ENC.wildPoke), 950);
        } else {
          res.className = 'coin-result bad';
          // Screen flash red
          flashScreen('#ff000022');
          setTimeout(() => {
            if (usingBall) {
              ballBtn.disabled = false;
              showTailsOptions();
            } else {
              showTailsOptions();
            }
          }, 400);
        }
      }, 480); // slow-down duration
  }, 700); // fast spin duration
}

// ---- Particle burst on coin land ----
function burstParticles(coinEl, heads) {
  const colors = heads
    ? ['#ffd700', '#ffe566', '#ffec99', '#4ade80', '#ffffff']
    : ['#6b7280', '#94a3b8', '#e94560', '#444466'];
  const rect = coinEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < (heads ? 22 : 10); i++) {
    const p = document.createElement('div');
    p.className = 'coin-particle';
    const angle = (i / (heads ? 22 : 10)) * 360;
    const dist = 40 + Math.random() * 70;
    const size = 5 + Math.random() * 8;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const dur = 500 + Math.random() * 400;
    p.style.cssText = `
      position:fixed;
      left:${cx}px; top:${cy}px;
      width:${size}px; height:${size}px;
      border-radius:50%;
      background:${color};
      pointer-events:none;
      z-index:9999;
      transform:translate(-50%,-50%);
      animation: particleBurst ${dur}ms ease-out forwards;
      --dx: ${Math.cos(angle * Math.PI / 180) * dist}px;
      --dy: ${Math.sin(angle * Math.PI / 180) * dist}px;
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), dur + 50);
  }
}

// ---- Quick screen color flash ----
function flashScreen(color) {
  const f = document.createElement('div');
  f.style.cssText = `
    position:fixed;inset:0;background:${color};pointer-events:none;
    z-index:9990;animation:flashColor .4s ease forwards;
  `;
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 450);
}

// Show options after tails
function showTailsOptions() {
  const hasBalls = balls() > 0;
  const res = document.getElementById('coinResult');
  if (hasBalls) {
    res.textContent = t('tails_reflip');
    document.getElementById('ballBtn').style.display = '';
    document.getElementById('ballBtn').disabled = false;
  } else {
    res.textContent = t('tails_noballs');
    document.getElementById('buyBallBtn').style.display = '';
  }
  document.getElementById('runBtn').disabled = false;
}

// ---- Use pokeball: re-flip (not guaranteed) ----
function usePokeballFlip() {
  if (balls() <= 0) { toast(t('no_balls')); return; }
  G.bag['pokeball'] = (G.bag['pokeball'] || 1) - 1;
  save(); updateHUD();

  const coin = document.getElementById('theCoin');
  const res = document.getElementById('coinResult');
  document.getElementById('ballBtn').disabled = true;
  document.getElementById('buyBallBtn').style.display = 'none';
  document.getElementById('runBtn').disabled = true;
  coin.className = 'coin';
  coin.innerHTML = coinHTML('ball', 'tails');
  res.textContent = t('ball_thrown');
  res.className = 'coin-result';

  setTimeout(() => runDramaticFlip(true), 300);
}

// ---- Buy a ball mid-encounter ----
function buyBallInEncounter() {
  if (G.coins < 200) {
    toast(t('not_enough_buy'));
    return;
  }
  G.coins -= 200;
  G.bag['pokeball'] = (G.bag['pokeball'] || 0) + 1;
  save(); updateHUD();
  toast(t('bought_ball_enc'));
  document.getElementById('buyBallBtn').style.display = 'none';
  document.getElementById('ballBtn').style.display = '';
  document.getElementById('ballBtn').disabled = false;
  document.getElementById('coinResult').textContent = t('tails_useball');
}

// ---- Run away ----
function runAway() {
  document.getElementById('encounterOverlay').classList.remove('open');
  ENC.phase = 'walk';
  toast(t('got_away'));
}

// ---- Catch ----
function catchPokemon(poke) {
  const isNew = !G.collection[poke.id] || G.collection[poke.id].count === 0;
  addToCollection(poke);

  // Pity advances only on a SUCCESSFUL capture. Capturing a Legendary resets it;
  // capturing anything else moves it toward the guaranteed-Legendary threshold.
  if (poke.rarity === 5) {
    G.pity = 0;
  } else {
    G.pity = Math.min(80, G.pity + 1);
  }

  save(); updateHUD();
  updatePityBar();
  document.getElementById('encounterOverlay').classList.remove('open');
  ENC.phase = 'walk';
  showResult(poke, isNew);
}

// ---- Result modal ----
function showResult(poke, isNew) {
  const isDupe = !isNew;
  const dupeReward = isDupe ? rarityReward(poke.rarity) : 0;
  document.getElementById('resultContent').innerHTML = `
    <div class="pull-card ${poke.rarity === 5 ? 'legendary' : poke.rarity === 4 ? 'epic' : poke.rarity === 3 ? 'rare' : poke.rarity === 2 ? 'uncommon' : 'common'}"
         style="border-color:${rarityColor(poke.rarity)}">
      <div style="font-size:11px;color:${rarityColor(poke.rarity)};font-family:'Orbitron',monospace;letter-spacing:1px;margin-bottom:8px">
        ${rarityLabel(poke.rarity)}
      </div>
      <img class="sprite" src="${spriteAnimated(poke.id)}" width="120" height="120"
           style="filter:drop-shadow(0 0 10px ${rarityColor(poke.rarity)})">
      <div style="font-size:18px;font-weight:800;text-transform:capitalize;margin-top:6px">${poke.name}</div>
      <div style="margin:5px 0">${poke.types.map(typeBadge).join(' ')}</div>
      <div style="color:${rarityColor(poke.rarity)};font-size:13px">${rarityStars(poke.rarity)}</div>
      <div style="margin-top:10px;background:var(--card2);border-radius:8px;padding:8px;
                  font-size:11px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px;text-align:left">
        <span style="display:flex;align-items:center;gap:3px">${statIcon('hp','#f87171')} HP ${poke.hp}</span>
        <span style="display:flex;align-items:center;gap:3px">${statIcon('atk','#fb923c')} ATK ${poke.atk}</span>
        <span style="display:flex;align-items:center;gap:3px">${statIcon('def','#fbbf24')} DEF ${poke.def}</span>
        <span style="display:flex;align-items:center;gap:3px">${statIcon('spatk','#38bdf8')} S.ATK ${poke.spAtk}</span>
        <span style="display:flex;align-items:center;gap:3px">${statIcon('spdef','#4ade80')} S.DEF ${poke.spDef}</span>
        <span style="display:flex;align-items:center;gap:3px">${statIcon('spd','#c084fc')} SPD ${poke.spd}</span>
      </div>
      ${isDupe ? `
        <div style="margin-top:10px;background:#ffd70015;border:1px solid #ffd70033;border-radius:8px;padding:10px;text-align:center">
          <div style="font-size:11px;color:var(--muted);margin-bottom:6px">${t('duplicate_q')}</div>
          <div style="display:flex;gap:8px;justify-content:center">
            <button class="btn-sm-gold" onclick="convertAndClose(${poke.id})">
              ${t('convert_to')} ${dupeReward} ${coinIcon(13)}
            </button>
            <button class="btn-sm-ghost" onclick="keepAndClose()">${t('keep_it')}</button>
          </div>
        </div>
      ` : `
        <div style="margin-top:8px;font-size:11px;color:#4ade80;font-weight:700">${t('new_catch')}</div>
      `}
    </div>
  `;
  document.getElementById('resultModal').classList.add('open');
}

function convertAndClose(pokeId) {
  const reward = convertDuplicate(pokeId);
  document.getElementById('resultModal').classList.remove('open');
  updateHUD();
  renderCollection();
  if (reward) toast(t('converted', { n: reward }));
}

function keepAndClose() {
  document.getElementById('resultModal').classList.remove('open');
  renderCollection();
}

function closeModal() {
  document.getElementById('resultModal').classList.remove('open');
  renderCollection();
}
