"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRewards } from "@/components/game/RewardBus";
import type { CompleteTaskResult, Task } from "@/lib/types";

export function CompleteButton({ task }: { task: Task }) {
  const router = useRouter();
  const { push } = useRewards();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function complete() {
    setPending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc("complete_task", {
        p_task_id: task.id,
      });
      if (rpcError) throw rpcError;
      push(data as CompleteTaskResult);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The seal failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={complete}
        disabled={pending}
        className="rounded-full bg-ember px-4 py-1.5 text-sm font-semibold text-ink disabled:opacity-60"
      >
        {pending ? "Sealing…" : "Complete"}
      </button>
      {error ? (
        <p className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
