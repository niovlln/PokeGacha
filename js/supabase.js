// js/supabase.js — Cloud backend integration (Supabase)
// Loaded AFTER the Supabase CDN script and AFTER state.js.

// ============================================================
//  CONFIG — paste your values from Supabase → Project Settings → API
// ============================================================
const SUPABASE_URL = 'https://tcohtkhnlftkjjdbnhxv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjb2h0a2hubGZ0a2pqZGJuaHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2Nzc5NTUsImV4cCI6MjA5NTI1Mzk1NX0.DxlumzIysZ39_VNN5my1wfwRUp7kl-VtBpdUnu_cVM0';

// Create the client (the global `supabase` comes from the CDN script in index.html).
let sb = null;
try {
  if (window.supabase && SUPABASE_URL.indexOf('YOUR-') === -1) {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) { console.warn('Supabase init failed:', e); }

// Are we configured + online? If not, the game runs in pure offline mode.
function cloudEnabled() { return !!sb; }

let currentUser = null;

// ---- Cloud sync (debounced) ------------------------------------------------
// save() in state.js writes localStorage instantly; this pushes to the cloud a
// couple seconds after activity settles, so rapid taps don't spam the network.
let _syncTimer = null;
function scheduleCloudSync() {
  if (!cloudEnabled() || !currentUser) return;
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(pushCloudSave, 2500);
}

async function pushCloudSave() {
  if (!cloudEnabled() || !currentUser) return;
  try {
    const payload = {
      user_id: currentUser.id,
      data: { coins: G.coins, pity: G.pity, lang: G.lang, collection: G.collection, bag: G.bag },
      coins: Math.max(0, Math.min(100000000, Math.floor(G.coins || 0))),
      pokemon_count: ownedIds().length,
    };
    const { error } = await sb.from('saves').upsert(payload, { onConflict: 'user_id' });
    if (error) console.warn('Cloud save error:', error.message);
  } catch (e) { console.warn('Cloud save threw:', e); }
}

async function pullCloudSave() {
  if (!cloudEnabled() || !currentUser) return null;
  try {
    const { data, error } = await sb.from('saves').select('data').eq('user_id', currentUser.id).maybeSingle();
    if (error) { console.warn('Cloud load error:', error.message); return null; }
    return data ? data.data : null;
  } catch (e) { console.warn('Cloud load threw:', e); return null; }
}

// ---- Merge cloud + local (first login / multi-device) ----------------------
// Strategy: keep the MORE-COMPLETE save. Collection counts take the max per
// Pokémon; coins take the higher value; language prefers cloud. This avoids a
// player losing progress whether it lived locally or in the cloud.
function mergeSaves(local, cloud) {
  if (!cloud) return local;
  if (!local) return cloud;
  const merged = JSON.parse(JSON.stringify(cloud));
  merged.coins = Math.max(local.coins || 0, cloud.coins || 0);
  merged.pity  = Math.max(local.pity  || 0, cloud.pity  || 0);
  merged.lang  = cloud.lang || local.lang || 'en';
  merged.collection = merged.collection || {};
  const lc = local.collection || {};
  for (const id in lc) {
    const lCount = (lc[id] && lc[id].count) || 0;
    const cCount = (merged.collection[id] && merged.collection[id].count) || 0;
    if (lCount || cCount) merged.collection[id] = { count: Math.max(lCount, cCount) };
  }
  merged.bag = merged.bag || {};
  const lb = local.bag || {};
  for (const k in lb) merged.bag[k] = Math.max(lb[k] || 0, merged.bag[k] || 0);
  return merged;
}

function applySaveObject(obj) {
  if (!obj) return;
  G.coins = obj.coins != null ? obj.coins : G.coins;
  G.pity  = Math.max(0, Math.min(80, Math.floor(obj.pity || 0)));
  G.lang  = (obj.lang === 'en' || obj.lang === 'id') ? obj.lang : G.lang;
  G.collection = obj.collection || {};
  G.bag = obj.bag || {};
  // Enforce the same bounds as local loads (defense in depth).
  if (typeof _validateState === 'function') _validateState();
}

// ---- Auth ------------------------------------------------------------------
async function signUp(email, password) {
  if (!cloudEnabled()) return { error: { message: 'Cloud not configured' } };
  // Return confirmation links to wherever the game is hosted (works on GitHub Pages).
  return await sb.auth.signUp({
    email, password,
    options: { emailRedirectTo: window.location.href.split('#')[0] },
  });
}
async function signIn(email, password) {
  if (!cloudEnabled()) return { error: { message: 'Cloud not configured' } };
  return await sb.auth.signInWithPassword({ email, password });
}
// Send a password-reset email. The link returns to the live site with a recovery
// token; Supabase fires a PASSWORD_RECOVERY auth event we handle in initAuth.
async function resetPassword(email) {
  if (!cloudEnabled()) return { error: { message: 'Cloud not configured' } };
  return await sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.href.split('#')[0],
  });
}
// Set a new password for the user currently in a recovery session.
async function updatePassword(newPassword) {
  if (!cloudEnabled()) return { error: { message: 'Cloud not configured' } };
  return await sb.auth.updateUser({ password: newPassword });
}
async function signOutUser() {
  if (!cloudEnabled()) return;
  await pushCloudSave();          // flush before leaving
  await sb.auth.signOut();
  currentUser = null;
  updateAuthUI();
  if (typeof enforceLoginGate === 'function') enforceLoginGate();
  const badge = document.getElementById('mailBadge');
  if (badge) badge.style.display = 'none';
}

// After login: merge local progress into the cloud save, apply, re-render.
async function onLoggedIn(user) {
  currentUser = user;
  const localSnapshot = JSON.parse(JSON.stringify({
    coins: G.coins, pity: G.pity, lang: G.lang, collection: G.collection, bag: G.bag
  }));
  const cloud = await pullCloudSave();
  const merged = mergeSaves(localSnapshot, cloud);
  applySaveObject(merged);
  save();                 // write merged result to localStorage cache
  await pushCloudSave();  // and back up to cloud
  updateAuthUI();
  if (typeof enforceLoginGate === 'function') enforceLoginGate();
  updateHUD(); applyStaticI18n();
  if (typeof refreshMailbox === 'function') refreshMailbox();
  if (typeof renderCollection === 'function') renderCollection();
  if (typeof renderAchievements === 'function') renderAchievements();
  if (typeof updatePityBar === 'function') updatePityBar();
}

// Restore an existing session on page load.
async function initAuth() {
  if (!cloudEnabled()) { updateAuthUI(); return; }
  try {
    const { data } = await sb.auth.getSession();
    if (data && data.session && data.session.user) {
      await onLoggedIn(data.session.user);
    }
    sb.auth.onAuthStateChange((_event, session) => {
      if (_event === 'PASSWORD_RECOVERY') {
        // Player arrived via a reset link — let them set a new password.
        if (typeof showPasswordResetPrompt === 'function') showPasswordResetPrompt();
        return;
      }
      if (session && session.user) { if (!currentUser) onLoggedIn(session.user); }
      else { currentUser = null; updateAuthUI(); if (typeof enforceLoginGate === 'function') enforceLoginGate(); }
    });
  } catch (e) { console.warn('initAuth error:', e); }
  updateAuthUI();
  if (typeof enforceLoginGate === 'function') enforceLoginGate();
}

// ---- Feedback to cloud (replaces mailto) -----------------------------------
async function submitFeedbackCloud(message) {
  if (!cloudEnabled()) return { error: { message: 'offline' } };
  return await sb.from('feedback').insert({
    user_id: currentUser ? currentUser.id : null,
    message, lang: G.lang,
  });
}

// ---- Gifts / Mailbox -------------------------------------------------------
// Fetch active gifts the player has NOT yet claimed.
async function fetchUnclaimedGifts() {
  if (!cloudEnabled() || !currentUser) return [];
  try {
    const giftsRes = await sb.from('gifts').select('*').eq('active', true).order('created_at', { ascending: false });
    if (giftsRes.error) { console.warn('gifts load:', giftsRes.error.message); return []; }
    const claimsRes = await sb.from('gift_claims').select('gift_id').eq('user_id', currentUser.id);
    if (claimsRes.error) { console.warn('claims load:', claimsRes.error.message); return []; }
    const claimed = new Set((claimsRes.data || []).map(c => c.gift_id));
    return (giftsRes.data || []).filter(g => !claimed.has(g.id));
  } catch (e) { console.warn('fetchUnclaimedGifts threw:', e); return []; }
}

// Claim one gift: record the claim (DB blocks double-claims via PK), then credit
// the rewards locally and sync. Returns { ok, error }.
async function claimGift(gift) {
  if (!cloudEnabled() || !currentUser) return { ok: false, error: 'offline' };
  try {
    const { error } = await sb.from('gift_claims').insert({ user_id: currentUser.id, gift_id: gift.id });
    if (error) {
      // 23505 = unique violation = already claimed (e.g. on another device).
      return { ok: false, error: error.code === '23505' ? 'already' : error.message };
    }
    if (gift.coins)   G.coins = (G.coins || 0) + gift.coins;
    if (gift.balls)   G.bag['pokeball'] = (G.bag['pokeball'] || 0) + gift.balls;
    if (gift.incense) G.bag['incense']  = (G.bag['incense']  || 0) + gift.incense;
    if (typeof _validateState === 'function') _validateState();
    save();
    return { ok: true };
  } catch (e) { return { ok: false, error: (e && e.message) || String(e) }; }
}
