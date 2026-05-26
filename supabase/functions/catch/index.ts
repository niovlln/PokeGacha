// supabase/functions/catch/index.ts
// PHASE 3 — Server-authoritative CATCH.
// The server decides the coin flip (50/50), and on HEADS records the Pokémon
// into the collection + advances/resets pity. Optionally consumes a Poké Ball
// (when the client is using a ball to re-flip). The client cannot force heads
// or fake a catch.
//
// Request body: { pokeId: number, useBall?: boolean, wasPity?: boolean }
// Response: { result: 'heads'|'tails', caught: boolean, isNew?: boolean,
//             coins, pity, collection, bag }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
const PITY_MAX = 50;

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

    let body: { pokeId?: number; useBall?: boolean; wasPity?: boolean } = {};
    try { body = await req.json(); } catch { /* */ }
    const pokeId = Math.floor(Number(body.pokeId));
    const useBall = !!body.useBall;
    const wasPity = !!body.wasPity;
    if (!RARITY[pokeId]) return json({ error: 'bad_id' }, 400);

    const { data: row } = await supabase.from('saves').select('data').eq('user_id', uid).maybeSingle();
    const save = row?.data ?? {};
    const coins = Math.max(0, Math.floor(save.coins ?? 0));
    const pity = Math.max(0, Math.min(PITY_MAX, Math.floor(save.pity ?? 0)));
    const collection = (save.collection && typeof save.collection === 'object') ? save.collection : {};
    const bag = (save.bag && typeof save.bag === 'object') ? save.bag : {};

    // If using a ball, the server must own that consumption.
    if (useBall) {
      const have = Math.max(0, Math.floor(bag['pokeball'] ?? 0));
      if (have <= 0) return json({ error: 'no_balls' }, 200);
      bag['pokeball'] = have - 1;
    }

    // Authoritative coin flip.
    const heads = Math.random() < 0.5;

    if (!heads) {
      // Tails — persist only the ball consumption (if any). No catch, pity unchanged.
      if (useBall) {
        const newData = { ...save, bag };
        await supabase.from('saves').update({ data: newData }).eq('user_id', uid);
      }
      return json({ result: 'tails', caught: false, coins, pity, collection, bag });
    }

    // Heads — record the catch.
    const prev = collection[pokeId] ? Math.floor(collection[pokeId].count ?? 0) : 0;
    const isNew = prev === 0;
    collection[pokeId] = { count: prev + 1 };

    // Pity: a pity encounter (any capture) uses it up; otherwise legendary resets,
    // anything else advances by 1 toward PITY_MAX.
    let newPity;
    if (wasPity || RARITY[pokeId] === 5) newPity = 0;
    else newPity = Math.min(PITY_MAX, pity + 1);

    const newData = { ...save, pity: newPity, collection, bag };
    const { error: upErr } = await supabase
      .from('saves')
      .update({ data: newData, pokemon_count: Object.keys(collection).filter(k => collection[k].count > 0).length })
      .eq('user_id', uid);
    if (upErr) return json({ error: upErr.message }, 500);

    return json({ result: 'heads', caught: true, isNew, coins, pity: newPity, collection, bag });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
