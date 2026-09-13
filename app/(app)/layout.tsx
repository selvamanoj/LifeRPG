import { redirect } from "next/navigation";
import { GameShell } from "@/components/game/GameShell";
import { getHeroBundle } from "@/lib/data";
import { getSupabasePublicEnv } from "@/lib/env";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!getSupabasePublicEnv()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="panel p-8">
          <h1 className="font-display text-2xl text-ember">Supabase is not configured</h1>
          <p className="mt-3 text-parchment/80">
            Copy <code>.env.example</code> to <code>.env.local</code> and add your project URL and
            anon key, then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  const { user, profile, attributes, error } = await getHeroBundle();
  if (!user) redirect("/login");
  if (!profile || !attributes) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="panel p-8">
          <h1 className="font-display text-2xl text-ember">Hero record missing</h1>
          <p className="mt-3 text-parchment/80">
            {error ??
              "The signup trigger did not create a profile. Apply supabase/migrations in the SQL editor and create a new account."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <GameShell profile={profile} attributes={attributes}>
      {children}
    </GameShell>
  );
}
