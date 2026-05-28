// supabase/functions/convert/index.ts
// PHASE 2 — Server-authoritative DUPLICATE CONVERSION.
// The server verifies the player owns a duplicate (count > 1) of the given
// Pokémon, decrements it, credits the rarity reward to coins, and persists.
// The client cannot mint coins by faking conversions.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Rarity per Pokémon id (must match pokemon.js).
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
function reward(r: number): number {
  return r === 5 ? 1000 : r === 4 ? 500 : r === 3 ? 200 : r === 2 ? 100 : 50;
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return json({ error: 'unauthorized' }, 401);
    const uid = userData.user.id;

    let payload: { pokeId?: number } = {};
    try { payload = await req.json(); } catch { /* */ }
    const pokeId = Math.floor(Number(payload.pokeId));
    if (!RARITY[pokeId]) return json({ error: 'bad_id' }, 400);

    const { data: row } = await supabase.from('saves').select('data').eq('user_id', uid).maybeSingle();
    const save = row?.data ?? {};
    const coins = Math.max(0, Math.floor(save.coins ?? 0));
    const collection = (save.collection && typeof save.collection === 'object') ? save.collection : {};

    const entry = collection[pokeId];
    const count = entry ? Math.floor(entry.count ?? 0) : 0;
    if (count <= 1) return json({ error: 'no_duplicate', coins }, 200); // nothing to convert

    // Apply: one duplicate -> reward coins.
    const rwd = reward(RARITY[pokeId]);
    collection[pokeId] = { count: count - 1 };
    const newCoins = coins + rwd;
    const newData = { ...save, coins: newCoins, collection };

    const { error: upErr } = await supabase
      .from('saves')
      .update({ data: newData, coins: newCoins })
      .eq('user_id', uid);
    if (upErr) return json({ error: upErr.message }, 500);

    return json({ ok: true, coins: newCoins, reward: rwd, collection });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
