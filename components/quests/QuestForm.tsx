"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ATTRIBUTES, DIFFICULTIES } from "@/lib/game";
import { taskSchema } from "@/lib/validations";
import type { Task } from "@/lib/types";

export function QuestForm({ task }: { task?: Task }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    const dueRaw = String(formData.get("due_at") ?? "").trim();
    const parsed = taskSchema.safeParse({
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      attribute: String(formData.get("attribute") ?? ""),
      difficulty: String(formData.get("difficulty") ?? ""),
      due_at: dueRaw ? new Date(dueRaw).toISOString() : null,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "The contract is incomplete");
      return;
    }
    setPending(true);
    try {
      const supabase = createClient();
      if (task) {
        const { error: updateError } = await supabase
          .from("tasks")
          .update({
            title: parsed.data.title,
            description: parsed.data.description ?? "",
            attribute: parsed.data.attribute,
            difficulty: parsed.data.difficulty,
            due_at: parsed.data.due_at ?? null,
          })
          .eq("id", task.id);
        if (updateError) throw updateError;
        router.push("/quests");
      } else {
        const { error: insertError } = await supabase.from("tasks").insert({
          title: parsed.data.title,
          description: parsed.data.description ?? "",
          attribute: parsed.data.attribute,
          difficulty: parsed.data.difficulty,
          due_at: parsed.data.due_at ?? null,
        });
        if (insertError) throw insertError;
        router.push("/quests");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The scribes refused the contract");
    } finally {
      setPending(false);
    }
  }

  const defaultDue = task?.due_at
    ? new Date(task.due_at).toISOString().slice(0, 16)
    : "";

  return (
    <form action={onSubmit} className="panel rune-frame max-w-xl space-y-4 p-6">
      <h1 className="font-display text-3xl text-ember">
        {task ? "Amend the contract" : "Inscribe a quest"}
      </h1>
      <label className="block text-sm">
        <span className="mb-1 block text-parchment/70">Title</span>
        <input
          name="title"
          required
          maxLength={120}
          defaultValue={task?.title}
          className="w-full rounded-xl border border-[rgb(var(--line)/0.22)] bg-ink/60 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-parchment/70">Lore (optional)</span>
        <textarea
          name="description"
          maxLength={2000}
          rows={4}
          defaultValue={task?.description}
          className="w-full rounded-xl border border-[rgb(var(--line)/0.22)] bg-ink/60 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-parchment/70">Attribute</span>
        <select
          name="attribute"
          defaultValue={task?.attribute ?? "discipline"}
          className="w-full rounded-xl border border-[rgb(var(--line)/0.22)] bg-ink/60 px-3 py-2"
        >
          {ATTRIBUTES.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label} — {item.hint}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend className="mb-2 text-sm text-parchment/70">Difficulty</legend>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {DIFFICULTIES.map((item) => (
            <label
              key={item.key}
              className="cursor-pointer rounded-xl border border-[rgb(var(--line)/0.18)] px-2 py-2 text-center text-xs has-[:checked]:border-ember has-[:checked]:bg-[rgb(var(--ember)/0.15)]"
            >
              <input
                type="radio"
                name="difficulty"
                value={item.key}
                defaultChecked={(task?.difficulty ?? "normal") === item.key}
                className="sr-only"
              />
              <span className="block font-semibold">{item.label}</span>
              <span className="text-parchment/50">
                {item.xp} XP · {item.pts} stat
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm">
        <span className="mb-1 block text-parchment/70">Due (optional)</span>
        <input
          name="due_at"
          type="datetime-local"
          defaultValue={defaultDue}
          className="w-full rounded-xl border border-[rgb(var(--line)/0.22)] bg-ink/60 px-3 py-2"
        />
      </label>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ember px-5 py-2 font-semibold text-ink disabled:opacity-60"
      >
        {pending ? "Sealing…" : task ? "Save amendments" : "Post to the board"}
      </button>
    </form>
  );
}
