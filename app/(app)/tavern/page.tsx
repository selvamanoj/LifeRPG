import { createClient } from "@/lib/supabase/server";
import { getHeroBundle } from "@/lib/data";
import { RelicActions } from "@/components/tavern/RelicActions";
import type { CatalogItem, InventoryRow } from "@/lib/types";

type InvRaw = {
  id: string;
  user_id: string;
  item_id: string;
  qty: number;
  acquired_at: string;
};

export default async function TavernPage() {
  const { profile } = await getHeroBundle();
  if (!profile) return null;
  const supabase = await createClient();
  const [{ data: catalog }, { data: inv }] = await Promise.all([
    supabase.from("item_catalog").select("*").order("gold_cost"),
    supabase.from("inventory").select("id, user_id, item_id, qty, acquired_at"),
  ]);

  const items = (catalog as CatalogItem[] | null) ?? [];
  const byId = new Map(items.map((item) => [item.id, item]));
  const inventory: InventoryRow[] = ((inv as InvRaw[] | null) ?? [])
    .map((row) => {
      const item = byId.get(row.item_id);
      if (!item) return null;
      return { ...row, item_catalog: item };
    })
    .filter((row): row is InventoryRow => row !== null);
  const ownedByItemId = new Map(inventory.map((row) => [row.item_id, row]));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl">Tavern</h1>
        <p className="text-parchment/70">
          Spend gold on relics. Inventory is yours across devices. Purse: {profile.gold}g
        </p>
      </header>

      <section>
        <h2 className="mb-3 font-display text-2xl">Inventory</h2>
        {inventory.length === 0 ? (
          <p className="panel p-6 text-parchment/70">The satchel is empty.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-3">
            {inventory.map((row) => (
              <li key={row.id} className="panel p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-ember">
                  {row.item_catalog.kind} · {row.item_catalog.rarity}
                </p>
                <h3 className="font-display text-xl">{row.item_catalog.name}</h3>
                <p className="text-sm text-parchment/70">{row.item_catalog.description}</p>
                <p className="mt-2 text-xs text-parchment/50">×{row.qty}</p>
                <RelicActions
                  item={row.item_catalog}
                  owned={row}
                  heroLevel={profile.level}
                  gold={profile.gold}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-2xl">Wares</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <li key={item.id} className="panel p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-ember">
                {item.kind} · {item.rarity} · min lv {item.min_level}
              </p>
              <h3 className="font-display text-2xl">{item.name}</h3>
              <p className="text-sm text-parchment/70">{item.description}</p>
              <p className="mt-2 text-sm">
                {item.gold_cost > 0 ? `${item.gold_cost} gold` : "Granted, not sold"}
              </p>
              <RelicActions
                item={item}
                owned={ownedByItemId.get(item.id)}
                heroLevel={profile.level}
                gold={profile.gold}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
