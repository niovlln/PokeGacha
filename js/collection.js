// js/collection.js — Collection screen + detail panel + filter/search

let collFilter = 'all'; // 'all' | 'common' | 'rare' | 'legendary'
let collSearch = '';

function renderCollection() {
  const ids = ownedIds();
  const countEl = document.getElementById('collCount');
  if (countEl) countEl.textContent = `(${ids.length}/151)`;
  const empty = document.getElementById('collEmpty');
  const grid = document.getElementById('collGrid');
  const filterRow = document.getElementById('filterRow');
  const searchWrap = document.getElementById('searchWrap');

  if (!ids.length) {
    empty.style.display = 'block';
    grid.innerHTML = '';
    if (filterRow) filterRow.style.display = 'none';
    if (searchWrap) searchWrap.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  if (filterRow) filterRow.style.display = 'flex';
  if (searchWrap) searchWrap.style.display = 'block';

  // Sort by Pokédex id
  let sorted = ids.slice().sort((a, b) => parseInt(a) - parseInt(b));

  // Apply rarity filter
  if (collFilter !== 'all') {
    const rarityMap = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
    const target = rarityMap[collFilter];
    sorted = sorted.filter(id => {
      const p = getPoke(id);
      return p && p.rarity === target;
    });
  }

  // Apply name/id search
  if (collSearch.trim()) {
    const q = collSearch.trim().toLowerCase();
    sorted = sorted.filter(id => {
      const p = getPoke(id);
      return p && (p.name.includes(q) || String(p.id).includes(q));
    });
  }

  if (!sorted.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--muted);font-size:12px;padding:24px 0">' + t('no_match') + '</div>';
    return;
  }

  grid.innerHTML = sorted.map(id => {
    const p = getPoke(id);
    if (!p) return '';
    const count = G.collection[id].count;
    const isDupe = count > 1;
    const glowColor = p.rarity === 5 ? '#ffd700' : p.rarity === 4 ? '#f43f5e' : p.rarity === 3 ? '#38bdf8' : p.rarity === 2 ? '#4ade80' : '';
    const borderStyle = p.rarity === 5
      ? 'border-color:#ffd70044;box-shadow:0 0 12px #ffd70022'
      : p.rarity === 4
      ? 'border-color:#f43f5e33;box-shadow:0 0 12px #f43f5e22'
      : p.rarity === 3
      ? 'border-color:#38bdf833'
      : p.rarity === 2
      ? 'border-color:#4ade8033'
      : '';
    return `
      <div class="pcard" onclick="openDetail(${p.id})" style="${borderStyle}">
        ${isDupe ? `<div class="pcard-cnt">×${count}</div>` : ''}
        <img class="sprite" src="${spriteStatic(p.id)}" width="64" height="64"
             loading="lazy" onerror="this.src=''"
             style="${glowColor ? `filter:drop-shadow(0 0 6px ${glowColor}66)` : ''}">
        <div class="pcard-name">#${p.id} ${p.name}</div>
        <div class="pcard-types">${p.types.map(typeBadge).join(' ')}</div>
        ${isDupe ? `<div class="dupe-badge">DUPE</div>` : ''}
      </div>`;
  }).join('');
}

function setCollFilter(f) {
  collFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('filter-' + f);
  if (btn) btn.classList.add('active');
  renderCollection();
}

function onCollSearch(val) {
  collSearch = val;
  renderCollection();
}

// ---- Detail Panel ----
function openDetail(id) {
  const p = getPoke(id);
  if (!p) return;
  const count = G.collection[id]?.count || 0;
  const isDupe = count > 1;
  const reward = rarityReward(p.rarity);

  const stats = [
    ['HP',    p.hp,    '#f87171', 'hp'],
    ['ATK',   p.atk,   '#fb923c', 'atk'],
    ['DEF',   p.def,   '#fbbf24', 'def'],
    ['S.ATK', p.spAtk, '#38bdf8', 'spatk'],
    ['S.DEF', p.spDef, '#4ade80', 'spdef'],
    ['SPD',   p.spd,   '#c084fc', 'spd'],
  ];

  document.getElementById('detailTitle').textContent = `#${p.id} ${p.name.toUpperCase()}`;
  document.getElementById('detailBody').innerHTML = `
    <div style="max-width:420px;margin:0 auto;width:100%;display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px">
        <img class="sprite" src="${spriteAnimated(p.id)}" width="120" height="120"
             style="filter:drop-shadow(0 0 8px ${rarityColor(p.rarity)})">
        <div style="font-size:clamp(18px,5vw,22px);font-weight:800;text-transform:capitalize">${p.name}</div>
        <div style="display:flex;gap:5px;justify-content:center;flex-wrap:wrap">${p.types.map(typeBadge).join(' ')}</div>
        <div style="font-size:13px;color:${rarityColor(p.rarity)}">${rarityStars(p.rarity)}</div>
        <div style="font-size:12px;color:var(--muted)">${t('owned')}: ×${count}</div>
      </div>

      <div class="card2">
        <div style="font-size:11px;font-weight:700;color:var(--gold);margin-bottom:10px;letter-spacing:.5px;text-align:center">${t('base_stats')}</div>
        ${stats.map(([lbl, val, col, kind]) => `
          <div class="stat-row">
            <div class="stat-label">${statIcon(kind, col)} ${lbl}</div>
            <div class="stat-val" style="color:${col}">${val}</div>
            <div class="stat-bar-wrap">
              <div class="stat-bar" style="width:${Math.round(val / 255 * 100)}%;background:${col}"></div>
            </div>
          </div>`).join('')}
      </div>

      ${isDupe ? `
        <div class="card2" style="border-color:#ffd70033;background:#ffd70008">
          <div style="font-size:11px;font-weight:700;color:var(--gold);margin-bottom:8px;letter-spacing:.5px;text-align:center">
            ${t('dupe_converter')}
          </div>
          <div style="font-size:13px;color:var(--muted);margin-bottom:10px;line-height:1.5;text-align:center">
            ${t('dupe_have', { n: count })} ${t('dupe_convert_q', { n: reward })}
          </div>
          <button onclick="convertFromDetail(${p.id})"
            style="width:100%;padding:11px;background:var(--gold);color:#1a0a00;border:none;
                   border-radius:8px;font-family:'Rajdhani',sans-serif;font-size:15px;
                   font-weight:800;cursor:pointer;letter-spacing:.5px">
            ${t('dupe_btn', { n: reward })} ${coinIcon(14)}
          </button>
        </div>
      ` : ''}
    </div>
  `;
  document.getElementById('detailPanel').classList.add('open');
}

function convertFromDetail(pokeId) {
  const reward = convertDuplicate(pokeId);
  if (!reward) { toast(t('no_dupe')); return; }
  updateHUD();
  toast(t('converted', { n: reward }));
  openDetail(pokeId);
  renderCollection();
}

function closeDetail() {
  document.getElementById('detailPanel').classList.remove('open');
}
