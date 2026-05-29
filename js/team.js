// js/team.js — Team Builder. The player maintains up to 4 teams of up to 6 Pokémon.
// One team is "active" (used for PvP). PvP draws from the active team.

let _editingTeam = 0; // which slot the builder is currently editing

function openTeamBuilder() {
  _editingTeam = G.activeTeam || 0;
  document.getElementById('teamOverlay').classList.add('open');
  renderTeamBuilder();
}
function closeTeamBuilder() {
  document.getElementById('teamOverlay').classList.remove('open');
}

function teamSlot(i) {
  if (!Array.isArray(G.teams)) G.teams = [[], [], [], []];
  if (!Array.isArray(G.teams[i])) G.teams[i] = [];
  return G.teams[i];
}

function renderTeamBuilder() {
  const owned = (typeof ownedIds === 'function') ? ownedIds().slice().sort((a, b) => parseInt(a) - parseInt(b)) : [];
  const body = document.getElementById('teamBody');

  if (!owned.length) {
    body.innerHTML = `<div class="empty-state"><div class="big"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;display:inline-block"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><p>${t('team_need_pokemon')}</p></div>`;
    return;
  }

  const team = teamSlot(_editingTeam);

  const tabs = [0, 1, 2, 3].map(i => {
    const count = teamSlot(i).length;
    const isEditing = i === _editingTeam;
    const isActive = i === (G.activeTeam || 0);
    return `<button class="team-tab${isEditing ? ' editing' : ''}${isActive ? ' active' : ''}" onclick="switchTeamTab(${i})">
      ${t('team_n', { n: i + 1 })} <span class="team-tab-count">${count}/6</span>
      ${isActive ? `<span class="team-tab-star"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-2px;display:inline-block"><path d="m12 3 2.6 5.6 6 .7-4.4 4.1 1.2 6L12 18.6 6.6 19.4l1.2-6L3.4 9.3l6-.7L12 3z"/></svg></span>` : ''}
    </button>`;
  }).join('');

  const slots = [];
  for (let i = 0; i < 6; i++) {
    const id = team[i];
    if (id != null) {
      const p = getPoke(id);
      slots.push(`
        <div class="team-slot filled">
          <div class="team-slot-x" onclick="removeFromTeam(${id})"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;display:inline-block"><path d="M18 6 6 18M6 6l12 12"/></svg></div>
          <img class="sprite" src="${spriteStatic(p.id)}" width="48" height="48" loading="lazy"
               onclick="editTeamMoves(${id})">
          <div class="team-slot-name">${p.name}</div>
          <button class="team-slot-edit" onclick="editTeamMoves(${id})"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;display:inline-block"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg> ${t('edit_moves_short')}</button>
        </div>`);
    } else {
      slots.push(`<div class="team-slot empty"><span>${i + 1}</span></div>`);
    }
  }

  const grid = owned.map(id => {
    const p = getPoke(id); if (!p) return '';
    const inTeam = team.includes(parseInt(id));
    const full = team.length >= 6;
    return `
      <div class="team-pick${inTeam ? ' in-team' : ''}${(full && !inTeam) ? ' disabled' : ''}"
           onclick="${inTeam ? `removeFromTeam(${p.id})` : (full ? '' : `addToTeam(${p.id})`)}">
        ${inTeam ? '<div class="team-pick-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;display:inline-block"><path d="M20 6 9 17l-5-5"/></svg></div>' : ''}
        <img class="sprite" src="${spriteStatic(p.id)}" width="52" height="52" loading="lazy">
        <div class="pick-name">${p.name}</div>
      </div>`;
  }).join('');

  const isActiveSlot = _editingTeam === (G.activeTeam || 0);

  body.innerHTML = `
    <div class="team-tabs">${tabs}</div>
    <div class="team-current">
      <div class="team-section-label-row">
        <div class="team-section-label">${t('team_n', { n: _editingTeam + 1 })} <span style="color:var(--muted)">(${team.length}/6)</span></div>
        <button class="team-use-btn ${isActiveSlot ? 'is-active' : ''}" onclick="setActiveTeam(${_editingTeam})" ${isActiveSlot ? 'disabled' : ''}>
          ${isActiveSlot ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-2px;display:inline-block"><path d="m12 3 2.6 5.6 6 .7-4.4 4.1 1.2 6L12 18.6 6.6 19.4l1.2-6L3.4 9.3l6-.7L12 3z"/></svg> ' + t('team_in_use') : t('team_use')}
        </button>
      </div>
      <div class="team-slots">${slots.join('')}</div>
    </div>
    <div class="team-box">
      <div class="team-section-label">${t('your_box')}</div>
      <div class="team-pick-grid">${grid}</div>
    </div>`;
}

function switchTeamTab(i) {
  _editingTeam = Math.max(0, Math.min(3, i));
  renderTeamBuilder();
}

function setActiveTeam(i) {
  G.activeTeam = Math.max(0, Math.min(3, i));
  save(); if (typeof scheduleCloudSync === 'function') scheduleCloudSync();
  toast(t('team_now_active', { n: i + 1 }));
  renderTeamBuilder();
}

function addToTeam(id) {
  id = parseInt(id);
  const team = teamSlot(_editingTeam);
  if (team.includes(id)) return;
  if (team.length >= 6) { toast(t('team_full')); return; }
  team.push(id);
  save(); if (typeof scheduleCloudSync === 'function') scheduleCloudSync();
  renderTeamBuilder();
}

function removeFromTeam(id) {
  id = parseInt(id);
  G.teams[_editingTeam] = teamSlot(_editingTeam).filter(x => x !== id);
  save(); if (typeof scheduleCloudSync === 'function') scheduleCloudSync();
  renderTeamBuilder();
}

// Open the moveset/ability editor for a team member (origin='team' so the editor
// refreshes the team builder on save instead of the Box detail view).
function editTeamMoves(id) {
  id = parseInt(id);
  if (!G.collection[id] || !G.collection[id].instances || !G.collection[id].instances.length) {
    toast(t('pvp_error')); return;
  }
  if (typeof openMovesetEditor === 'function') openMovesetEditor(id, 'team');
}