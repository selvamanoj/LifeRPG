"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { attributeMeta, difficultyMeta } from "@/lib/game";
import { CompleteButton } from "@/components/quests/CompleteButton";
import type { Task } from "@/lib/types";

export function QuestCard({ task }: { task: Task }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const attr = attributeMeta(task.attribute);
  const diff = difficultyMeta(task.difficulty);
  const done = task.status === "completed";

  async function remove() {
    setError(null);
    const supabase = createClient();
    const { error: delError } = await supabase.from("tasks").delete().eq("id", task.id);
    if (delError) {
      setError(delError.message);
      return;
    }
    router.refresh();
  }

  return (
    <article className="panel rune-frame flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-ember/80">
            {diff.label} · {attr.label} {attr.rune}
          </p>
          <h2 className="font-display text-2xl">{task.title}</h2>
        </div>
        <span className="rounded-full border border-[rgb(var(--line)/0.2)] px-2 py-1 text-[10px] uppercase tracking-[0.16em]">
          {done ? "Sealed" : "Open"}
        </span>
      </div>
      {task.description ? (
        <p className="text-sm text-parchment/70">{task.description}</p>
      ) : null}
      <p className="text-xs text-parchment/50">
        {diff.xp}+ XP · {diff.gold} gold · {diff.pts} {attr.label}
        {task.due_at ? ` · due ${new Date(task.due_at).toLocaleString()}` : ""}
      </p>
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!done ? (
        <div className="mt-auto flex flex-wrap items-center gap-3">
          <CompleteButton task={task} />
          <Link href={`/quests/${task.id}`} className="text-sm text-parchment/70 underline">
            Amend
          </Link>
          <button type="button" onClick={remove} className="text-sm text-danger/80">
            Burn
          </button>
        </div>
      ) : (
        <p className="text-xs text-moss">
          Completed {task.completed_at ? new Date(task.completed_at).toLocaleString() : ""}
        </p>
      )}
    </article>
  );
}
