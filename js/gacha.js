// js/gacha.js — Tall grass encounter + dramatic coin flip catching

const ENC = {
  clicks: 0,    // steps since last encounter
  nextAt: 0,    // steps threshold for next encounter
  phase: 'walk', // 'walk' | 'encounter'
  wildPoke: null,
};
ENC.nextAt = nextEncAt();

function nextEncAt() { return 4 + Math.floor(Math.random() * 23); }

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
// Pity now counts encounters (not taps) since last Legendary.
// At 80 consecutive non-legendary encounters, the next is guaranteed Legendary.
function rollPokemon() {
  if (G.pity >= 80) {
    const pool = POKEMON.filter(p => p.rarity === 5);
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const r = Math.random();
  if (r < 0.01) {
    const pool = POKEMON.filter(p => p.rarity === 5);
    return pool[Math.floor(Math.random() * pool.length)];
  }
  if (r < 0.05) {
    const pool = POKEMON.filter(p => p.rarity === 4);
    return pool[Math.floor(Math.random() * pool.length)];
  }
  if (r < 0.20) {
    const pool = POKEMON.filter(p => p.rarity === 3);
    return pool[Math.floor(Math.random() * pool.length)];
  }
  if (r < 0.50) {
    const pool = POKEMON.filter(p => p.rarity === 2);
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const pool = POKEMON.filter(p => p.rarity === 1);
  return pool[Math.floor(Math.random() * pool.length)];
}

// ---- Trigger encounter ----
function triggerEncounter() {
  const poke = rollPokemon();
  ENC.wildPoke = poke;

  // Pity: only reset when a Legendary is rolled; otherwise increment
  if (poke.rarity === 5) {
    G.pity = 0;
  } else {
    G.pity++;
  }

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
  save(); updateHUD();
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
