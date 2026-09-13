import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuestForm } from "@/components/quests/QuestForm";
import type { Task } from "@/lib/types";

export default async function EditQuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("tasks").select("*").eq("id", id).maybeSingle();
  const task = data as Task | null;
  if (!task) notFound();
  if (task.status !== "active") {
    return (
      <div className="panel p-8">
        <h1 className="font-display text-2xl">This contract is sealed</h1>
        <p className="mt-2 text-parchment/70">Completed quests cannot be rewritten.</p>
      </div>
    );
  }
  return <QuestForm task={task} />;
}
