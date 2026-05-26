// supabase/functions/buy/index.ts
// PHASE 2a — Server-authoritative PURCHASES (Poké Balls + Incense).
// The server owns the coin balance: it checks funds, deducts, updates the save,
// and returns the new totals. The client cannot set coins for purchases.
// Conversions + passive income remain client-side until Phase 2b.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Catalog of buyable items: cost in coins + what the player receives.
const CATALOG: Record<string, { cost: number; item: string; qty: number }> = {
  ball1:   { cost: 200,   item: 'pokeball', qty: 1 },
  ball5:   { cost: 900,   item: 'pokeball', qty: 5 },
  incense: { cost: 20000, item: 'incense',  qty: 1 },
};

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

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

    // Parse request
    let payload: { sku?: string } = {};
    try { payload = await req.json(); } catch { /* empty body */ }
    const sku = payload.sku ?? '';
    const entry = CATALOG[sku];
    if (!entry) return json({ error: 'bad_sku' }, 400);

    // Read authoritative save.
    const { data: row } = await supabase.from('saves').select('data').eq('user_id', uid).maybeSingle();
    const save = row?.data ?? {};
    const coins = Math.max(0, Math.floor(save.coins ?? 0));
    const bag = (save.bag && typeof save.bag === 'object') ? save.bag : {};

    // Check funds.
    if (coins < entry.cost) return json({ error: 'insufficient', coins }, 200);

    // Apply: deduct coins, add item.
    const newCoins = coins - entry.cost;
    bag[entry.item] = Math.max(0, Math.floor(bag[entry.item] ?? 0)) + entry.qty;

    const newData = { ...save, coins: newCoins, bag };

    // Persist (RLS allows a user to update only their own row).
    const { error: upErr } = await supabase
      .from('saves')
      .update({ data: newData, coins: newCoins })
      .eq('user_id', uid);
    if (upErr) return json({ error: upErr.message }, 500);

    return json({ ok: true, coins: newCoins, bag });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
