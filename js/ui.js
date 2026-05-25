// js/ui.js — Shared UI helpers

function typeBadge(t) {
  // `t` is the English type id (used for color lookup); label is translated for display.
  return `<span class="tbadge" style="background:${TC[t] || '#888'}">${typeLabel(t)}</span>`;
}
function rarityColor(r) {
  return r === 5 ? 'var(--gold)' : r === 4 ? '#f43f5e' : r === 3 ? '#38bdf8' : r === 2 ? '#4ade80' : 'var(--muted)';
}
function rarityStars(r) { return ['', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'][r] || ''; }
function rarityLabel(r) {
  return r === 5 ? '✨ LEGENDARY ✨' : r === 4 ? '🔮 EPIC 🔮' : r === 3 ? '★ RARE ★' : r === 2 ? 'Uncommon' : 'Common';
}
// ---- Inline SVG icons — crisp & consistent across all phones ----
function pokeballIcon(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="vertical-align:-3px;flex-shrink:0">
    <circle cx="12" cy="12" r="10" fill="#fff" stroke="#15151f" stroke-width="1.5"/>
    <path d="M2.2 12a9.8 9.8 0 0 1 19.6 0z" fill="#e94560"/>
    <line x1="2.2" y1="12" x2="21.8" y2="12" stroke="#15151f" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="3.3" fill="#fff" stroke="#15151f" stroke-width="1.5"/>
  </svg>`;
}
function coinIcon(size = 16) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="vertical-align:-3px;flex-shrink:0">
    <circle cx="12" cy="12" r="9" fill="#ffd700" stroke="#c8a800" stroke-width="2"/>
    <text x="12" y="16" text-anchor="middle" font-size="11" font-weight="900" fill="#8a6d00" font-family="Orbitron,monospace">P</text>
  </svg>`;
}
// Faces shown ON the big flip coin: 'coin' (idle), 'ball', 'heads' (win), 'tails' (lose).
function coinFace(kind, size = 46) {
  const wrap = (inner) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:block">${inner}</svg>`;
  if (kind === 'ball') {
    return wrap(`<circle cx="12" cy="12" r="9.5" fill="#fff" stroke="#15151f" stroke-width="1.4"/>
      <path d="M2.5 12a9.5 9.5 0 0 1 19 0z" fill="#e94560"/>
      <line x1="2.5" y1="12" x2="21.5" y2="12" stroke="#15151f" stroke-width="1.4"/>
      <circle cx="12" cy="12" r="3.1" fill="#fff" stroke="#15151f" stroke-width="1.4"/>`);
  }
  if (kind === 'heads') { // crown
    return wrap(`<path d="M4 17h16l1-9-5 4-4-7-4 7-5-4 1 9z" fill="#fff8c0" stroke="#8a6d00" stroke-width="1.4"/>
      <line x1="4" y1="20" x2="20" y2="20" stroke="#8a6d00" stroke-width="2"/>`);
  }
  if (kind === 'tails') { // moon
    return wrap(`<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z" fill="#e8e8f8" stroke="#5a5a72" stroke-width="1.4"/>`);
  }
  // idle coin — gold disc with P
  return wrap(`<circle cx="12" cy="12" r="9.5" fill="#ffe566" stroke="#8a6d00" stroke-width="1.6"/>
    <text x="12" y="16.5" text-anchor="middle" font-size="12" font-weight="900" fill="#8a6d00" font-family="Orbitron,monospace">P</text>`);
}
// Generic single-glyph icons used in shop help text & danger zone.
function svgIcon(name, color = 'currentColor', size = 14) {
  const o = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;flex-shrink:0"`;
  const paths = {
    grass:  `<path d="M12 22c0-6-3-10-3-13M12 22c0-6 3-10 3-13M12 22c0-5 0-9 0-13"/>`,
    alert:  `<path d="M12 3 2 21h20L12 3z"/><line x1="12" y1="9" x2="12" y2="14"/><circle cx="12" cy="17.5" r=".6" fill="${color}"/>`,
    moon:   `<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>`,
    cash:   `<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>`,
    loop:   `<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>`,
    star:   `<path d="m12 3 2.6 5.6 6 .7-4.4 4.1 1.2 6L12 18.6 6.6 19.4l1.2-6L3.4 9.3l6-.7L12 3z"/>`,
    trash:  `<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6l1 14h12l1-14"/>`,
    check:  `<path d="M20 6 9 17l-5-5"/>`,
  };
  return `<svg ${o}>${paths[name] || ''}</svg>`;
}

// Stat icons (HP/ATK/DEF/S.ATK/S.DEF/SPD) — tinted via stroke color, inline with text.
function statIcon(kind, color = 'currentColor', size = 13) {
  const o = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;flex-shrink:0"`;
  const paths = {
    hp:    `<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-6.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>`,
    atk:   `<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6"/><path d="m16 16 4 4"/><path d="m19 21 2-2"/>`,
    def:   `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
    spatk: `<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>`,
    spdef: `<path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5l-8-3z"/><path d="M9 12l2 2 4-4"/>`,
    spd:   `<path d="M3 12h12"/><path d="m11 8 4 4-4 4"/><path d="M17 7v10"/><path d="M21 5v14"/>`,
  };
  return `<svg ${o}>${paths[kind] || ''}</svg>`;
}

function spriteStatic(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}
function spriteAnimated(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
}
function getPoke(id) { return POKEMON.find(p => p.id === parseInt(id)); }

function toast(msg, dur = 2200) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), dur);
}

function updateHUD() {
  document.getElementById('coinDisplay').textContent = G.coins.toLocaleString();
  document.querySelectorAll('.ball-count').forEach(el => el.textContent = balls());
}

function updatePityBar() {
  const bar = document.getElementById('pityBar');
  const label = document.getElementById('pityCount');
  if (!bar || !label) return;
  const pct = Math.min(G.pity / 80 * 100, 100);
  bar.style.width = pct + '%';
  label.textContent = `${G.pity}/80`;

  // Turn bar gold when approaching pity guarantee
  if (G.pity >= 70) {
    bar.style.background = 'linear-gradient(90deg, #ffd700, #ff8800)';
    label.style.color = '#ffd700';
  } else if (G.pity >= 40) {
    bar.style.background = 'linear-gradient(90deg, #a78bfa, #ffd700)';
    label.style.color = '#a78bfa';
  } else {
    bar.style.background = 'linear-gradient(90deg, #a78bfa, #ffd700)';
    label.style.color = 'var(--gold)';
  }
}

// ---- Settings screen ----
function renderSettings() {
  const el = document.getElementById('settingsContent');
  if (!el) return;
  const isEN = G.lang === 'en';
  el.innerHTML = `
    <div style="padding:4px 16px 16px">
      <div class="card2" id="accountCard">
        <div style="font-size:11px;font-weight:700;color:var(--gold);margin-bottom:10px;letter-spacing:.5px">${t('account')}</div>
        <div id="accountBody"></div>
      </div>
    </div>

    <div style="padding:0 16px 16px">
      <div class="card2">
        <div style="font-size:11px;font-weight:700;color:var(--gold);margin-bottom:10px;letter-spacing:.5px">
          ${t('language')}
        </div>
        <div style="display:flex;gap:8px">
          <button class="lang-btn ${isEN ? 'active' : ''}" onclick="setLang('en')">${t('lang_en')}</button>
          <button class="lang-btn ${!isEN ? 'active' : ''}" onclick="setLang('id')">${t('lang_id')}</button>
        </div>
      </div>
    </div>

    <!-- Feedback -->
    <div style="padding:0 16px 16px">
      <div class="card2">
        <div style="font-size:11px;font-weight:700;color:var(--gold);margin-bottom:6px;letter-spacing:.5px">${t('feedback')}</div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:10px;line-height:1.4">${t('feedback_desc')}</div>
        <textarea id="feedbackInput" class="feedback-input" rows="4" placeholder="${t('feedback_ph')}"></textarea>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="lang-btn active" style="flex:2" onclick="sendFeedback()">${t('feedback_send')}</button>
          <button class="lang-btn" style="flex:1" onclick="copyFeedback()">${t('feedback_copy')}</button>
        </div>
      </div>
    </div>

    <div style="padding:0 16px 24px">
      <div class="card2" style="border-color:#e9456033;background:#e9456008">
        <div style="font-size:11px;font-weight:700;color:var(--accent);margin-bottom:8px;letter-spacing:.5px;display:flex;align-items:center;gap:5px">
          ${svgIcon('alert', '#e94560')} ${t('danger_zone')}
        </div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:12px;line-height:1.5">
          ${t('reset_desc')}
        </div>
        <button class="btn-danger" onclick="confirmReset()">
          <span style="display:inline-flex;align-items:center;gap:6px">${svgIcon('trash', 'currentColor', 15)} ${t('reset_btn')}</span>
        </button>
      </div>
    </div>
  `;
  updateAuthUI();
}

// ---- Auth UI ----
// Builds the auth markup once; rendered into both the Settings card and the
// main-screen modal. `ctx` namespaces the input ids so the two can coexist.
function authMarkup(ctx) {
  if (typeof cloudEnabled === 'function' && !cloudEnabled()) {
    // Diagnose WHY cloud is off so it's never a silent dead-end.
    let reason = '';
    if (typeof window.supabase === 'undefined') {
      reason = t('auth_no_lib');
    } else if (typeof SUPABASE_URL === 'undefined' || SUPABASE_URL.indexOf('YOUR-') !== -1) {
      reason = t('auth_no_config');
    } else {
      reason = t('account_offline');
    }
    return `<div style="font-size:12px;color:var(--muted);line-height:1.6">${t('account_offline')}</div>
            <div style="font-size:11px;color:var(--accent);margin-top:8px;line-height:1.5">⚠ ${reason}</div>`;
  }
  if (typeof currentUser !== 'undefined' && currentUser) {
    return `
      <div style="font-size:13px;color:var(--text);margin-bottom:4px">${t('logged_in_as')}</div>
      <div style="font-size:13px;color:var(--gold);font-weight:700;margin-bottom:10px;word-break:break-all">${currentUser.email || ''}</div>
      <div style="font-size:11px;color:#4ade80;margin-bottom:10px;display:flex;align-items:center;gap:5px">${svgIcon('check', '#4ade80', 13)} ${t('cloud_synced')}</div>
      <button class="lang-btn" style="width:100%" onclick="signOutUser()">${t('logout')}</button>`;
  }
  return `
    <div style="font-size:12px;color:var(--muted);margin-bottom:10px;line-height:1.4">${t('account_desc')}</div>
    <input id="authEmail_${ctx}" class="feedback-input" type="email" placeholder="${t('email')}" style="margin-bottom:8px" autocomplete="email">
    <input id="authPass_${ctx}" class="feedback-input" type="password" placeholder="${t('password')}" style="margin-bottom:8px" autocomplete="current-password">
    <div id="authMsg_${ctx}" style="font-size:12px;color:var(--accent);min-height:16px;margin-bottom:8px;line-height:1.3"></div>
    <div style="display:flex;gap:8px">
      <button class="lang-btn active" style="flex:1" onclick="doSignIn('${ctx}')">${t('login')}</button>
      <button class="lang-btn" style="flex:1" onclick="doSignUp('${ctx}')">${t('signup')}</button>
    </div>`;
}

function updateAuthUI() {
  const card = document.getElementById('accountBody');
  if (card) card.innerHTML = authMarkup('card');
  const modal = document.getElementById('authModalBody');
  if (modal) {
    const loggedOut = !(typeof currentUser !== 'undefined' && currentUser) &&
                      !(typeof cloudEnabled === 'function' && !cloudEnabled());
    modal.innerHTML =
      `<div style="font-family:'Orbitron',monospace;font-size:13px;color:var(--gold);letter-spacing:1px;margin-bottom:14px;text-align:center">${t('auth_title')}</div>`
      + authMarkup('modal')
      + (loggedOut ? `<button class="lang-btn" style="width:100%;margin-top:8px" onclick="closeAuthModal()">${t('auth_skip')}</button>` : '');
  }
  const btn = document.getElementById('accountBtn');
  if (btn) btn.style.display = 'flex';
}

function openAuthModal() {
  updateAuthUI();
  const m = document.getElementById('authModal');
  if (m) m.classList.add('open');
}
function closeAuthModal() {
  const m = document.getElementById('authModal');
  if (m) m.classList.remove('open');
}

function _authInputs(ctx) {
  const email = (document.getElementById('authEmail_' + ctx) || {}).value || '';
  const pass = (document.getElementById('authPass_' + ctx) || {}).value || '';
  return { email: email.trim(), pass };
}
function _authMsg(ctx, text, ok) {
  const m = document.getElementById('authMsg_' + ctx);
  if (m) { m.textContent = text; m.style.color = ok ? '#4ade80' : 'var(--accent)'; }
}

async function doSignIn(ctx) {
  if (typeof cloudEnabled !== 'function' || !cloudEnabled()) { _authMsg(ctx, t('auth_no_cloud')); return; }
  const { email, pass } = _authInputs(ctx);
  if (!email || !pass) { _authMsg(ctx, t('auth_fill')); return; }
  _authMsg(ctx, t('auth_working'), true);
  try {
    const { data, error } = await signIn(email, pass);
    if (error) { _authMsg(ctx, error.message); return; }
    if (data && data.user) { await onLoggedIn(data.user); closeAuthModal(); toast(t('login_ok')); }
  } catch (e) { _authMsg(ctx, (e && e.message) || String(e)); }
}

async function doSignUp(ctx) {
  if (typeof cloudEnabled !== 'function' || !cloudEnabled()) { _authMsg(ctx, t('auth_no_cloud')); return; }
  const { email, pass } = _authInputs(ctx);
  if (!email || !pass) { _authMsg(ctx, t('auth_fill')); return; }
  if (pass.length < 6) { _authMsg(ctx, t('auth_pass_short')); return; }
  _authMsg(ctx, t('auth_working'), true);
  try {
    const { data, error } = await signUp(email, pass);
    if (error) { _authMsg(ctx, error.message); return; }
    // Email confirmation OFF → session active now. ON → no session yet.
    if (data && data.session && data.user) {
      await onLoggedIn(data.user); closeAuthModal(); toast(t('signup_ok'));
    } else if (data && data.user) {
      _authMsg(ctx, t('check_email'), true);
    } else {
      _authMsg(ctx, t('auth_fill'));
    }
  } catch (e) { _authMsg(ctx, (e && e.message) || String(e)); }
}
// CHANGE THIS to the address where you want feedback delivered:
const FEEDBACK_EMAIL = 'feedback@example.com';

function sendFeedback() {
  const ta = document.getElementById('feedbackInput');
  const msg = ta ? ta.value.trim() : '';
  if (!msg) { toast(t('feedback_empty')); return; }
  // Prefer cloud submission; fall back to mailto when offline/unconfigured.
  if (typeof cloudEnabled === 'function' && cloudEnabled()) {
    submitFeedbackCloud(msg).then(({ error }) => {
      if (error) { _fallbackMailto(msg); }
      else { toast(t('feedback_sent')); if (ta) ta.value = ''; }
    });
    return;
  }
  _fallbackMailto(msg);
}

function _fallbackMailto(msg) {
  const subject = encodeURIComponent('PokéGacha Feedback');
  const body = encodeURIComponent(msg);
  window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
}

function copyFeedback() {
  const ta = document.getElementById('feedbackInput');
  const msg = ta ? ta.value.trim() : '';
  if (!msg) { toast(t('feedback_empty')); return; }
  const done = () => toast(t('feedback_copied'));
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(msg).then(done).catch(() => fallbackCopy(msg, done));
  } else {
    fallbackCopy(msg, done);
  }
}
function fallbackCopy(text, cb) {
  try {
    const tmp = document.createElement('textarea');
    tmp.value = text; tmp.style.position = 'fixed'; tmp.style.opacity = '0';
    document.body.appendChild(tmp); tmp.select();
    document.execCommand('copy'); tmp.remove(); cb();
  } catch (e) {}
}

function goScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById(name + '-screen').classList.add('active');
  const navBtn = document.getElementById('nav-' + name);
  if (navBtn) navBtn.classList.add('active');
  if (name === 'collection') renderCollection();
  if (name === 'shop') renderShop();
  if (name === 'settings') renderSettings();
  if (name === 'achievements') renderAchievements();
}

// ---- Achievements screen ----
function renderAchievements() {
  const el = document.getElementById('achievementsContent');
  if (!el) return;
  const all = getAchievements();
  const sum = achievementsSummary();

  const row = (a) => `
    <div class="ach-row ${a.done ? 'done' : ''}">
      <div class="ach-icon">${a.icon}</div>
      <div style="flex:1;min-width:0">
        <div class="ach-label">${a.label}</div>
        <div class="ach-bar-wrap"><div class="ach-bar" style="width:${Math.round(a.have / a.need * 100)}%;background:${a.color}"></div></div>
      </div>
      <div class="ach-count">${a.done ? '<span style="color:#4ade80;font-weight:800">' + svgIcon('check', '#4ade80', 14) + '</span>' : a.have + '/' + a.need}</div>
    </div>`;

  const section = (title, items) => items.length ? `
    <div style="padding:0 16px 12px">
      <div class="card2">
        <div style="font-size:11px;font-weight:700;color:var(--gold);margin-bottom:8px;letter-spacing:.5px">${title}</div>
        ${items.map(row).join('')}
      </div>
    </div>` : '';

  el.innerHTML = `
    <div style="padding:4px 16px 12px">
      <div class="card2" style="text-align:center">
        <div style="font-size:11px;color:var(--muted);letter-spacing:.5px;margin-bottom:4px">${t('ach_unlocked', sum)}</div>
        <div class="ach-bar-wrap" style="height:7px"><div class="ach-bar" style="width:${Math.round(sum.done / sum.total * 100)}%;background:linear-gradient(90deg,#a78bfa,#ffd700)"></div></div>
      </div>
    </div>
    ${section(t('ach_milestones'), all.filter(a => a.group === 'milestone'))}
    ${section(t('ach_types'), all.filter(a => a.group === 'type'))}
  `;
}

// ---- Passive income: +5 coins every 30 seconds ----
setInterval(() => { G.coins += 5; save(); updateHUD(); }, 30000);
