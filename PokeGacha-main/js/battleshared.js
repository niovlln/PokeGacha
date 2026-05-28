// js/battleshared.js — Shared battle visual helpers used by online PvP (pvponline.js).
// (Extracted from the old battleui.js when CPU battle was removed.)

function hpPlate(b, side) {
  const pct = Math.max(0, Math.round((b.hp / b.maxHp) * 100));
  const col = pct > 50 ? '#4ade80' : pct > 20 ? '#fbbf24' : '#ef4444';
  const statusTag = b.status ? `<span class="status-tag ${b.status}">${b.status.toUpperCase()}</span>` : '';
  const types = (b.types || []).map(ty => `<span class="tbadge plate-type" style="background:${TC[ty] || '#888'}">${ty}</span>`).join('');
  return `
    <div class="hp-plate ${side}">
      <div class="hp-plate-top">
        <span class="hp-plate-name">${b.name}</span>
        <span class="hp-plate-lv">Lv${b.level}</span>
        ${statusTag}
      </div>
      <div class="plate-types">${types}</div>
      <div class="hp-bar-wrap"><div class="hp-bar" style="width:${pct}%;background:${col}"></div></div>
      <div class="hp-text">${b.hp}/${b.maxHp}</div>
    </div>`;
}

function battlerSprite(b, side) {
  const src = side === 'player' ? spriteBack(b.speciesId) : spriteAnimated(b.speciesId);
  const onerr = side === 'player'
    ? `this.onerror=null;this.src='${spriteAnimated(b.speciesId)}';this.style.transform='scaleX(-1)';`
    : '';
  return `
    <div class="field-mon ${side}${b.fainted ? ' fainted' : ''}" id="fieldmon-${b._uid}">
      <img class="sprite battle-sprite" src="${src}" onerror="${onerr}">
      <div class="mon-platform"></div>
    </div>`;
}

function clearActiveActor() {
  document.querySelectorAll('.field-mon.active-actor').forEach(el => el.classList.remove('active-actor'));
}

function eventText(e) {
  switch (e.t) {
    case 'move': return t('log_used', { who: e.who, move: e.move });
    case 'damage': {
      let s = t('log_damage', { who: e.who, amt: e.amt });
      if (e.crit) s += ' ' + t('log_crit');
      if (e.eff > 1) s += ' ' + t('log_super');
      else if (e.eff > 0 && e.eff < 1) s += ' ' + t('log_weak');
      return s;
    }
    case 'miss': return t('log_miss', { who: e.who, move: e.move });
    case 'immune': return t('log_immune', { who: e.who });
    case 'faint': return t('log_faint', { who: e.who });
    case 'status': return t('log_status_' + (e.code || ''), { who: e.who });
    case 'stat': {
      const statName = t('stat_' + e.stat);
      const key = e.dir === 'up' ? (e.sharp ? 'log_stat_up2' : 'log_stat_up') : (e.sharp ? 'log_stat_down2' : 'log_stat_down');
      return t(key, { who: e.who, stat: statName });
    }
    case 'heal': return t('log_heal', { who: e.who, amt: e.amt });
    case 'recoil': return t('log_recoil', { who: e.who, amt: e.amt });
    case 'residual': return t('log_residual_' + (e.s === 'brn' ? 'brn' : 'psn'), { who: e.who, amt: e.amt });
    case 'msg': return t('log_msg_' + (e.code || ''), { who: e.who, move: e.move || '' });
    case 'switch': return t('log_switch', { who: e.who, in: e.in });
    case 'sendin': return t('log_sendin', { who: e.who });
    default: return '';
  }
}

// Switch-in event text key reused later by the switching feature (Group B).