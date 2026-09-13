import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { QuestCard } from "@/components/quests/QuestCard";
import type { Task } from "@/lib/types";

export default async function QuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const status = tab === "sealed" ? "completed" : "active";
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("status", status)
    .order(status === "completed" ? "completed_at" : "created_at", {
      ascending: false,
    });

  const tasks = (data as Task[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Quest board</h1>
          <p className="text-parchment/70">CRUD contracts, sealed by the keep on completion.</p>
        </div>
        <Link
          href="/quests/new"
          className="rounded-full bg-ember px-4 py-2 font-semibold text-ink"
        >
          New quest
        </Link>
      </div>
      <div className="flex gap-2" role="tablist" aria-label="Quest filters">
        <Tab href="/quests" active={status === "active"}>
          Open
        </Tab>
        <Tab href="/quests?tab=sealed" active={status === "completed"}>
          Sealed
        </Tab>
      </div>
      {error ? (
        <p className="text-danger" role="alert">
          {error.message}
        </p>
      ) : null}
      {tasks.length === 0 ? (
        <div className="panel p-8 text-parchment/70">
          {status === "active"
            ? "No active quests — inscribe one."
            : "No sealed quests yet. Complete a contract to write history."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((task) => (
            <QuestCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}

function Tab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className={`rounded-full px-4 py-1.5 text-sm ${
        active ? "bg-[rgb(var(--ember)/0.2)] text-ember" : "text-parchment/60"
      }`}
    >
      {children}
    </Link>
  );
}
