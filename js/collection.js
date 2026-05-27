// js/collection.js — Collection screen + detail panel + filter/search

let collFilter = 'all';     // rarity: 'all' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
let collStatus = 'all';     // capture status: 'all' | 'caught' | 'uncaught'
let collSearch = '';

function isCaught(id) {
  const e = G.collection[id];
  return !!(e && e.count > 0);
}

function renderCollection() {
  const owned = ownedIds();
  const countEl = document.getElementById('collCount');
  if (countEl) countEl.textContent = `(${owned.length}/151)`;
  const empty = document.getElementById('collEmpty');
  const grid = document.getElementById('collGrid');
  const filterRow = document.getElementById('filterRow');
  const statusRow = document.getElementById('statusRow');
  const searchWrap = document.getElementById('searchWrap');

  // The Box always shows all 151 now, so the filter/search UI is always visible.
  empty.style.display = 'none';
  if (filterRow) filterRow.style.display = 'flex';
  if (statusRow) statusRow.style.display = 'flex';
  if (searchWrap) searchWrap.style.display = 'block';

  // Start from ALL 151, sorted by Pokédex id.
  let list = POKEMON.slice().sort((a, b) => a.id - b.id);

  // Capture-status filter
  if (collStatus === 'caught')   list = list.filter(p => isCaught(p.id));
  if (collStatus === 'uncaught') list = list.filter(p => !isCaught(p.id));

  // Rarity filter
  if (collFilter !== 'all') {
    const rarityMap = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
    const target = rarityMap[collFilter];
    list = list.filter(p => p.rarity === target);
  }

  // Name/id search — only matches by name for CAUGHT Pokémon (names of
  // uncaught ones are hidden); id search still works for everything.
  if (collSearch.trim()) {
    const q = collSearch.trim().toLowerCase();
    list = list.filter(p => String(p.id).includes(q) || (isCaught(p.id) && p.name.includes(q)));
  }

  if (!list.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--muted);font-size:12px;padding:24px 0">' + t('no_match') + '</div>';
    return;
  }

  grid.innerHTML = list.map(p => {
    const caught = isCaught(p.id);
    if (!caught) {
      // Uncaptured: dark silhouette + "?" overlay, not clickable.
      return `
        <div class="pcard uncaught">
          <div class="silhouette-wrap">
            <img class="sprite silhouette" src="${spriteStatic(p.id)}" width="64" height="64"
                 loading="lazy" onerror="this.style.display='none'">
            <div class="silhouette-q">?</div>
          </div>
          <div class="pcard-name muted">#${p.id} ???</div>
        </div>`;
    }
    const count = G.collection[p.id].count;
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
  document.querySelectorAll('#filterRow .filter-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('filter-' + f);
  if (btn) btn.classList.add('active');
  renderCollection();
}

function setCollStatus(s) {
  collStatus = s;
  document.querySelectorAll('#statusRow .filter-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('status-' + s);
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

      ${count > 0 ? renderLoadoutCard(p.id) : ''}

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

// ---- Moveset / Ability editor (Option B per-individual loadout) ----
// Edits the PRIMARY instance (index 0) of a species in the player's box.

function getPrimaryInstance(speciesId) {
  const entry = G.collection[speciesId];
  if (!entry || !Array.isArray(entry.instances) || !entry.instances.length) return null;
  return entry.instances[0];
}

// Move type color chip
function _moveChip(moveKey, onClick, selected) {
  const m = (typeof moveData === 'function') ? moveData(moveKey) : null;
  if (!m) return '';
  const col = TC[m.type] || '#888';
  const cat = m.category === 'physical' ? '⚔' : m.category === 'special' ? '✦' : '○';
  const pwr = m.power > 0 ? m.power : '—';
  return `<button class="move-chip${selected ? ' sel' : ''}" ${onClick ? `onclick="${onClick}"` : ''}
    style="border-color:${col}${selected ? '' : '55'};${selected ? `background:${col}22` : ''}">
    <span class="move-chip-name">${m.name}</span>
    <span class="move-chip-meta"><span class="tbadge" style="background:${col};font-size:8px">${m.type}</span> ${cat} ${pwr}</span>
  </button>`;
}

function renderLoadoutCard(speciesId) {
  const inst = getPrimaryInstance(speciesId);
  if (!inst) return '';
  const pool = (typeof legalMovePool === 'function') ? legalMovePool(speciesId) : [];
  const abils = (typeof legalAbilities === 'function') ? legalAbilities(speciesId) : [];
  const ab = (typeof abilityData === 'function' && inst.ability) ? abilityData(inst.ability) : null;

  const moveSlots = [0, 1, 2, 3].map(i => {
    const mk = inst.moves[i];
    if (mk) {
      const m = moveData(mk); const col = m ? (TC[m.type] || '#888') : '#888';
      return `<div class="loadout-slot" style="border-color:${col}55">
        <span style="color:${col};font-weight:700">${m ? m.name : mk}</span>
        ${m ? `<span class="tbadge" style="background:${col}">${m.type}</span>` : ''}
      </div>`;
    }
    return `<div class="loadout-slot empty">${t('move_empty')}</div>`;
  }).join('');

  return `
    <div class="card2">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="font-size:11px;font-weight:700;color:var(--gold);letter-spacing:.5px">${t('moveset')}</div>
        <button class="edit-btn" onclick="openMovesetEditor(${speciesId})">${t('edit')}</button>
      </div>
      <div class="loadout-grid">${moveSlots}</div>
      <div style="margin-top:10px;display:flex;align-items:center;justify-content:space-between;gap:8px">
        <div>
          <div style="font-size:10px;color:var(--muted);letter-spacing:.5px">${t('ability')}</div>
          <div style="font-size:14px;font-weight:700;color:#c084fc">${ab ? ab.name : '—'}</div>
          ${ab ? `<div style="font-size:11px;color:var(--muted);line-height:1.3">${ab.desc}</div>` : ''}
        </div>
      </div>
    </div>`;
}

// Editor state
let _editSpecies = null;
let _editMoves = [];     // working copy of selected move keys
let _editAbility = null;

function openMovesetEditor(speciesId) {
  const inst = getPrimaryInstance(speciesId);
  if (!inst) return;
  _editSpecies = speciesId;
  _editMoves = inst.moves.slice(0, 4);
  _editAbility = inst.ability;
  renderMovesetEditor();
  document.getElementById('editorPanel').classList.add('open');
}

function renderMovesetEditor() {
  const sid = _editSpecies;
  const p = getPoke(sid);
  const pool = (typeof legalMovePool === 'function') ? legalMovePool(sid) : [];
  const abils = (typeof legalAbilities === 'function') ? legalAbilities(sid) : [];
  const maxMoves = Math.min(4, pool.length);

  document.getElementById('editorTitle').textContent = `${p.name.toUpperCase()} — ${t('edit_moveset')}`;

  // Selected moves summary (tap to remove)
  const selected = _editMoves.map((mk, i) =>
    _moveChip(mk, `removeMove('${mk}')`, true)
  ).join('') || `<div style="color:var(--muted);font-size:12px;padding:8px">${t('no_moves_selected')}</div>`;

  // Available pool (tap to add; disabled if selected or full)
  const available = pool.map(mk => {
    const isSel = _editMoves.includes(mk);
    const full = _editMoves.length >= maxMoves && !isSel;
    const onClick = isSel ? `removeMove('${mk}')` : (full ? '' : `addMove('${mk}')`);
    return `<div class="${full ? 'pool-full' : ''}">${_moveChip(mk, onClick, isSel)}</div>`;
  }).join('');

  const abilityChoices = abils.map(ak => {
    const a = abilityData(ak); if (!a) return '';
    const sel = _editAbility === ak;
    return `<button class="ability-choice${sel ? ' sel' : ''}" onclick="pickAbility('${ak}')">
      <div style="font-weight:700;color:${sel ? '#c084fc' : 'var(--text)'}">${a.name}</div>
      <div style="font-size:11px;color:var(--muted);line-height:1.3">${a.desc}</div>
    </button>`;
  }).join('');

  document.getElementById('editorBody').innerHTML = `
    <div style="max-width:440px;margin:0 auto;width:100%;display:flex;flex-direction:column;gap:14px">
      <div class="card2">
        <div style="font-size:11px;font-weight:700;color:var(--gold);margin-bottom:8px;letter-spacing:.5px">
          ${t('selected_moves')} (${_editMoves.length}/${maxMoves})
        </div>
        <div class="loadout-grid">${selected}</div>
      </div>

      <div class="card2">
        <div style="font-size:11px;font-weight:700;color:var(--gold);margin-bottom:8px;letter-spacing:.5px">${t('legal_moves')}</div>
        <div class="move-pool">${available}</div>
      </div>

      ${abils.length > 1 ? `
      <div class="card2">
        <div style="font-size:11px;font-weight:700;color:#c084fc;margin-bottom:8px;letter-spacing:.5px">${t('choose_ability')}</div>
        <div style="display:flex;flex-direction:column;gap:6px">${abilityChoices}</div>
      </div>` : `
      <div class="card2">
        <div style="font-size:11px;font-weight:700;color:#c084fc;margin-bottom:4px;letter-spacing:.5px">${t('ability')}</div>
        <div style="font-size:14px;font-weight:700;color:#c084fc">${abilityData(_editAbility) ? abilityData(_editAbility).name : '—'}</div>
        <div style="font-size:11px;color:var(--muted)">${t('ability_fixed')}</div>
      </div>`}

      <button class="save-loadout-btn" onclick="saveMoveset()">${t('save_moveset')}</button>
    </div>`;
}

function addMove(mk) {
  const pool = legalMovePool(_editSpecies);
  const maxMoves = Math.min(4, pool.length);
  if (_editMoves.length >= maxMoves) { toast(t('moves_full', { n: maxMoves })); return; }
  if (!_editMoves.includes(mk) && pool.includes(mk)) _editMoves.push(mk);
  renderMovesetEditor();
}
function removeMove(mk) {
  _editMoves = _editMoves.filter(m => m !== mk);
  renderMovesetEditor();
}
function pickAbility(ak) {
  if (legalAbilities(_editSpecies).includes(ak)) _editAbility = ak;
  renderMovesetEditor();
}

function saveMoveset() {
  if (!_editMoves.length) { toast(t('need_one_move')); return; }
  const entry = G.collection[_editSpecies];
  if (!entry || !Array.isArray(entry.instances) || !entry.instances.length) return;
  // Sanitize against legal pools before saving (defense in depth).
  entry.instances[0] = (typeof sanitizeInstance === 'function')
    ? sanitizeInstance(_editSpecies, { moves: _editMoves, ability: _editAbility })
    : { moves: _editMoves.slice(0, 4), ability: _editAbility };
  save();
  if (typeof scheduleCloudSync === 'function') scheduleCloudSync();
  closeMovesetEditor();
  toast(t('moveset_saved'));
  openDetail(_editSpecies); // refresh the detail card
}

function closeMovesetEditor() {
  document.getElementById('editorPanel').classList.remove('open');
}

async function convertFromDetail(pokeId) {
  if (typeof serverConvert === 'function' && typeof cloudEnabled === 'function' && cloudEnabled() && typeof currentUser !== 'undefined' && currentUser) {
    const res = await serverConvert(pokeId);
    if (res.ok) {
      updateHUD();
      toast(t('converted', { n: res.reward }));
      openDetail(pokeId);
      renderCollection();
    } else if (res.error === 'no_duplicate') {
      toast(t('no_dupe'));
    } else {
      toast(t('purchase_failed'));
    }
    return;
  }
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