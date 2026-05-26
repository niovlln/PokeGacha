// js/shop.js — Shop (Poké Ball only). Danger zone moved to Settings. Fully translated.

function renderShop() {
  const owned = balls();
  document.getElementById('shopContent').innerHTML = `

    <!-- Poké Ball ×1 -->
    <div class="shop-item" onclick="buyBall(1)">
      <div class="shop-item-icon">${pokeballIcon(36)}</div>
      <div style="flex:1">
        <div class="shop-item-name">${t('pokeball_x1')}</div>
        <div class="shop-item-desc">${t('pokeball_x1_desc')}</div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:6px;flex-wrap:wrap">
          <div class="shop-item-price">200 ${coinIcon()}</div>
          ${owned > 0 ? `<div class="shop-owned">${t('owned_n', { n: owned })}</div>` : ''}
        </div>
      </div>
    </div>

    <!-- Poké Ball ×5 bundle -->
    <div class="shop-item" onclick="buyBall(5)" style="border-color:#ffd70022">
      <div class="shop-item-icon" style="position:relative;width:40px;height:40px">
        <span style="position:absolute;left:0;top:4px">${pokeballIcon(26)}</span>
        <span style="position:absolute;right:0;bottom:0">${pokeballIcon(26)}</span>
      </div>
      <div style="flex:1">
        <div class="shop-item-name" style="color:var(--gold)">${t('bundle')} <span style="font-size:10px;color:#4ade80;font-weight:700;margin-left:4px">${t('save_100')} ${coinIcon(12)}</span></div>
        <div class="shop-item-desc">${t('bundle_desc')}</div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:6px">
          <div class="shop-item-price" style="background:#ffd70020">900 ${coinIcon()}</div>
        </div>
      </div>
    </div>

    <!-- Incense -->
    <div class="shop-item" onclick="buyIncense()" style="border-color:#c084fc33">
      <div class="shop-item-icon">${incenseIcon(36)}</div>
      <div style="flex:1">
        <div class="shop-item-name" style="color:#c084fc">${t('incense_name')}</div>
        <div class="shop-item-desc">${t('incense_desc')}</div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:6px;flex-wrap:wrap">
          <div class="shop-item-price">20,000 ${coinIcon()}</div>
          ${incenseCount() > 0 ? `<div class="shop-owned" style="color:#c084fc">${t('owned_n', { n: incenseCount() })}</div>` : ''}
        </div>
      </div>
    </div>

    <!-- How it works -->
    <div style="padding:4px 16px 16px">
      <div class="card2" style="font-size:12px;color:var(--muted);line-height:2.1">
        <div style="font-size:11px;font-weight:700;color:var(--gold);margin-bottom:6px;letter-spacing:.5px">
          ${t('how_catching')}
        </div>
        ${svgIcon('grass', '#4ade80')} ${t('hc_1')}<br>
        ${svgIcon('alert', '#ff6b6b')} ${t('hc_2')}<br>
        ${coinIcon(14)} ${t('hc_3')}<br>
        ${svgIcon('moon', '#94a3b8')} ${t('hc_4')}<br>
        ${pokeballIcon(14)} ${t('hc_5')}<br>
        ${svgIcon('cash', '#4ade80')} ${t('hc_6')}<br>
        ${svgIcon('loop', '#a78bfa')} ${t('hc_7')}<br>
        ${svgIcon('star', '#ffd700')} ${t('hc_8')}
      </div>
    </div>

    <div style="padding:0 16px 24px">
      <div class="card2" style="font-size:12px;color:var(--muted);line-height:2.1">
        <div style="font-size:11px;font-weight:700;color:var(--gold);margin-bottom:6px;letter-spacing:.5px">
          ${t('dupe_converts')}
        </div>
        ${t('dc_intro')}<br><br>
        ${svgIcon('star', '#ffd700')} ${t('dc_common')} <span style="color:var(--gold)">50 ${coinIcon(13)}</span><br>
        ${svgIcon('star', '#ffd700')}${svgIcon('star', '#ffd700')} ${t('dc_rare')} <span style="color:var(--gold)">150 ${coinIcon(13)}</span><br>
        ${svgIcon('star', '#ffd700')}${svgIcon('star', '#ffd700')}${svgIcon('star', '#ffd700')} ${t('dc_legendary')} <span style="color:var(--gold)">500 ${coinIcon(13)}</span>
      </div>
    </div>
  `;
}

async function buyIncense() {
  if (typeof serverBuy === 'function' && typeof cloudEnabled === 'function' && cloudEnabled() && typeof currentUser !== 'undefined' && currentUser) {
    const res = await serverBuy('incense');
    if (res.ok) {
      updateHUD(); renderShop();
      if (typeof updateIncenseUI === 'function') updateIncenseUI();
      toast(t('incense_bought'));
    } else if (res.error === 'insufficient') {
      toast(t('need_coins', { n: (20000).toLocaleString() }));
    } else {
      toast(t('purchase_failed'));
    }
    return;
  }
  const cost = 20000;
  if (G.coins < cost) { toast(t('need_coins', { n: cost.toLocaleString() })); return; }
  G.coins -= cost;
  G.bag['incense'] = (G.bag['incense'] || 0) + 1;
  save(); updateHUD(); renderShop();
  if (typeof updateIncenseUI === 'function') updateIncenseUI();
  toast(t('incense_bought'));
}

async function buyBall(qty) {
  const sku = qty === 5 ? 'ball5' : 'ball1';
  // Server-authoritative when logged in.
  if (typeof serverBuy === 'function' && typeof cloudEnabled === 'function' && cloudEnabled() && typeof currentUser !== 'undefined' && currentUser) {
    const res = await serverBuy(sku);
    if (res.ok) {
      updateHUD(); renderShop();
      if (typeof updateIncenseUI === 'function') updateIncenseUI();
      toast(t('bought_balls', { n: qty, s: qty > 1 ? 's' : '', total: balls() }));
    } else if (res.error === 'insufficient') {
      toast(t('need_coins', { n: (qty === 5 ? 900 : 200) }));
    } else {
      toast(t('purchase_failed'));
    }
    return;
  }
  // Offline / not logged in: local fallback (unchanged behavior).
  const cost = qty === 5 ? 900 : 200;
  if (G.coins < cost) { toast(t('need_coins', { n: cost })); return; }
  G.coins -= cost;
  G.bag['pokeball'] = (G.bag['pokeball'] || 0) + qty;
  save(); updateHUD(); renderShop();
  toast(t('bought_balls', { n: qty, s: qty > 1 ? 's' : '', total: balls() }));
}

// Reset confirmation — used by the Settings screen danger zone.
function confirmReset() {
  const btn = document.querySelector('.btn-danger');
  if (!btn) return;
  if (btn.dataset.confirm === '1') {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem('pokegacha_v4');
    // Also clear the cloud save if logged in, then reload.
    if (typeof cloudEnabled === 'function' && cloudEnabled() && typeof currentUser !== 'undefined' && currentUser) {
      sb.from('saves').delete().eq('user_id', currentUser.id).then(() => location.reload());
    } else {
      location.reload();
    }
  } else {
    btn.dataset.confirm = '1';
    btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px">' +
      svgIcon('alert', 'currentColor', 15) + ' ' + t('reset_confirm') + '</span>';
    btn.style.background = '#e9456033';
    setTimeout(() => {
      if (btn) {
        btn.dataset.confirm = '';
        btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px">' +
          svgIcon('trash', 'currentColor', 15) + ' ' + t('reset_btn') + '</span>';
        btn.style.background = '';
      }
    }, 3000);
  }
}