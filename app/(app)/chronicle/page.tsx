import { createClient } from "@/lib/supabase/server";
import type { ActivityEvent } from "@/lib/types";

function describe(event: ActivityEvent) {
  const p = event.payload ?? {};
  switch (event.type) {
    case "task_completed":
      return `Sealed “${p.title}” · +${p.xp} XP · +${p.gold}g · ${p.attribute} +${p.attribute_pts}`;
    case "task_created":
      return `Inscribed “${p.title}”`;
    case "task_updated":
      return `Amended “${p.title}”`;
    case "task_deleted":
      return `Burned “${p.title}”`;
    case "level_up":
      return `Rose to circle ${p.level}`;
    case "item_granted":
      return `Relic granted: ${p.name ?? p.reason ?? "unknown"}`;
    case "item_purchased":
      return `Bought ${p.name} for ${p.gold}g`;
    case "item_equipped":
      return `Equipped ${p.slug}`;
    case "streak_updated":
      return `Streak stands at ${p.streak}`;
    default:
      return event.type;
  }
}

export default async function ChroniclePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(80);

  const events = (data as ActivityEvent[] | null) ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">Chronicle</h1>
        <p className="text-parchment/70">
          Immutable enough for a demo: every completion, level, and relic is a Postgres row.
        </p>
      </header>
      {error ? (
        <p className="text-danger" role="alert">
          {error.message}
        </p>
      ) : null}
      <ol className="panel divide-y divide-[rgb(var(--line)/0.1)]">
        {events.length === 0 ? (
          <li className="p-8 text-parchment/70">No history yet.</li>
        ) : (
          events.map((event) => (
            <li key={event.id} className="px-5 py-4">
              <p className="text-sm">{describe(event)}</p>
              <p className="text-xs text-parchment/50">
                {new Date(event.created_at).toLocaleString()} · {event.type}
              </p>
            </li>
          ))
        )}
      </ol>
    </div>
  );
}
