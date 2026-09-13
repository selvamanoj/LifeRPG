import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { QuestCard } from "@/components/quests/QuestCard";
import { ATTRIBUTES, xpProgress, titleLabel } from "@/lib/game";
import { getHeroBundle } from "@/lib/data";
import type { ActivityEvent, Task } from "@/lib/types";

export default async function HomePage() {
  const { profile, attributes } = await getHeroBundle();
  if (!profile || !attributes) return null;
  const supabase = await createClient();
  const [{ data: quests }, { data: events }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("activity_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const bar = xpProgress(Number(profile.total_xp), profile.level);
  const active = (quests as Task[] | null) ?? [];
  const recent = (events as ActivityEvent[] | null) ?? [];

  return (
    <div className="space-y-8">
      <section className="panel rune-frame overflow-hidden p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.4em] text-ember/80">Command deck</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">
          {profile.display_name}
          <span className="block text-lg text-parchment/60">
            {titleLabel(profile.equipped_title)} · Circle {profile.level}
          </span>
        </h1>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Stat label="Total XP" value={String(profile.total_xp)} />
          <Stat label="To next circle" value={`${bar.into} / ${bar.toNext}`} />
          <Stat label="Streak" value={`${profile.streak_count} dawn${profile.streak_count === 1 ? "" : "s"}`} />
          <Stat label="Gold" value={String(profile.gold)} />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {ATTRIBUTES.map((stat) => (
            <div key={stat.key} className="rounded-2xl border border-[rgb(var(--line)/0.14)] p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-parchment/50">
                {stat.rune} {stat.label}
              </p>
              <p className="font-display text-3xl text-glow">{attributes[stat.key]}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl">Open contracts</h2>
          <Link href="/quests/new" className="text-sm text-ember underline">
            Inscribe a quest
          </Link>
        </div>
        {active.length === 0 ? (
          <div className="panel p-8 text-parchment/70">
            No active quests — inscribe one and the keep will keep score.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {active.map((task) => (
              <QuestCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl">Recent chronicle</h2>
          <Link href="/chronicle" className="text-sm text-ember underline">
            Full ledger
          </Link>
        </div>
        <ol className="panel divide-y divide-[rgb(var(--line)/0.1)]">
          {recent.length === 0 ? (
            <li className="p-6 text-parchment/70">The ledger is still blank.</li>
          ) : (
            recent.map((event) => (
              <li key={event.id} className="px-5 py-3 text-sm">
                <span className="text-ember">{event.type.replaceAll("_", " ")}</span>
                <span className="text-parchment/50">
                  {" "}
                  · {new Date(event.created_at).toLocaleString()}
                </span>
              </li>
            ))
          )}
        </ol>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-ink/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-parchment/50">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  );
}
