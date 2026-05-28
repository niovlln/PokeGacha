// supabase/functions/roll/index.ts
// PHASE 1 — Server-authoritative gacha ROLL.
// The server decides which Pokémon the player encounters (rarity + which one),
// applying pity and the legendary/uncaught bias. The client cannot influence
// the outcome. Coins/catching remain client-side for now (later phases).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ----- Pokémon data: only id + rarity is needed for the roll -----
// (Kept minimal so the function is self-contained. Rarities match pokemon.js.)
const RARITY: Record<number, number> = {
  1:3,2:3,3:4,4:3,5:3,6:4,7:3,8:3,9:4,10:1,11:1,12:3,13:1,14:1,15:3,16:1,17:2,18:3,19:1,20:2,
  21:1,22:2,23:1,24:2,25:2,26:3,27:1,28:2,29:1,30:2,31:3,32:1,33:2,34:3,35:3,36:3,37:3,38:3,39:3,40:3,
  41:1,42:2,43:1,44:2,45:3,46:1,47:2,48:1,49:2,50:1,51:2,52:1,53:2,54:1,55:2,56:1,57:2,58:1,59:3,60:1,
  61:2,62:3,63:2,64:3,65:4,66:2,67:3,68:4,69:1,70:2,71:3,72:1,73:2,74:1,75:2,76:4,77:2,78:3,79:3,80:3,
  81:1,82:2,83:3,84:1,85:2,86:1,87:2,88:1,89:2,90:1,91:2,92:1,93:2,94:4,95:3,96:2,97:2,98:1,99:2,100:1,
  101:2,102:3,103:4,104:3,105:3,106:3,107:3,108:3,109:1,110:2,111:2,112:3,113:3,114:3,115:3,116:2,117:2,118:1,119:2,120:1,
  121:2,122:3,123:3,124:3,125:3,126:3,127:3,128:3,129:1,130:4,131:4,132:3,133:3,134:4,135:4,136:4,137:4,138:4,139:4,140:4,
  141:4,142:4,143:4,144:5,145:5,146:5,147:4,148:4,149:4,150:5,151:5,
};
const ALL_IDS = Object.keys(RARITY).map(Number);
const byRarity = (r: number) => ALL_IDS.filter(id => RARITY[id] === r);
const PITY_MAX = 50;

function pick<T>(arr: T[]): T | null { return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null; }

function pickLegendary(caughtIds: Set<number>): number {
  const legend = byRarity(5);
  const uncaught = legend.filter(id => !caughtIds.has(id));
  const caught = legend.filter(id => caughtIds.has(id));
  const wantUncaught = Math.random() < 0.80;
  let pool = wantUncaught ? (uncaught.length ? uncaught : caught) : (caught.length ? caught : uncaught);
  return pick(pool.length ? pool : legend)!;
}

function rollId(pity: number, caughtIds: Set<number>): number {
  if (pity >= PITY_MAX) {
    if (Math.random() < 0.20) return pickLegendary(caughtIds);
    return pick(byRarity(4))!;
  }
  const r = Math.random();
  if (r < 0.01) return pickLegendary(caughtIds);
  if (r < 0.05) return pick(byRarity(4))!;
  if (r < 0.20) return pick(byRarity(3))!;
  if (r < 0.50) return pick(byRarity(2))!;
  return pick(byRarity(1))!;
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    // Authenticate the caller using their bearer token (the logged-in player).
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // Read the player's save (server-side source of truth for pity + collection).
    const { data: saveRow } = await supabase.from('saves').select('data').eq('user_id', userData.user.id).maybeSingle();
    const save = saveRow?.data ?? {};
    const pity = Math.max(0, Math.min(PITY_MAX, Math.floor(save.pity ?? 0)));
    const collection = save.collection ?? {};
    const caughtIds = new Set<number>(
      Object.keys(collection).filter(id => collection[id]?.count > 0).map(Number),
    );

    // The authoritative roll — happens here, on the server.
    const id = rollId(pity, caughtIds);
    const rarity = RARITY[id];

    return new Response(JSON.stringify({ id, rarity }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
