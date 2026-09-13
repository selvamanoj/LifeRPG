"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { CatalogItem, InventoryRow } from "@/lib/types";

export function RelicActions({
  item,
  owned,
  heroLevel,
  gold,
}: {
  item: CatalogItem;
  owned: InventoryRow | undefined;
  heroLevel: number;
  gold: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function buy() {
    setPending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("purchase_item", {
        p_item_id: item.id,
      });
      if (rpcError) throw rpcError;
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The tavern refused");
    } finally {
      setPending(false);
    }
  }

  async function equip() {
    setPending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("equip_item", {
        p_item_id: item.id,
      });
      if (rpcError) throw rpcError;
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not equip");
    } finally {
      setPending(false);
    }
  }

  const canBuy =
    item.gold_cost > 0 &&
    heroLevel >= item.min_level &&
    gold >= item.gold_cost &&
    !(owned && item.kind !== "consumable");

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {canBuy ? (
        <button
          type="button"
          onClick={buy}
          disabled={pending}
          className="rounded-full bg-ember px-3 py-1 text-sm font-semibold text-ink disabled:opacity-60"
        >
          Buy · {item.gold_cost}g
        </button>
      ) : null}
      {owned && item.kind !== "consumable" ? (
        <button
          type="button"
          onClick={equip}
          disabled={pending}
          className="rounded-full border border-[rgb(var(--line)/0.25)] px-3 py-1 text-sm disabled:opacity-60"
        >
          Equip
        </button>
      ) : null}
      {error ? (
        <p className="w-full text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
