import Link from "next/link";
import { getSessionUser } from "@/lib/data";

export default async function LandingPage() {
  const user = await getSessionUser();

  return (
    <main id="main" className="relative mx-auto min-h-screen max-w-5xl px-4 py-16">
      <div className="pointer-events-none absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-ember/20 blur-3xl" />
      <p className="text-xs uppercase tracking-[0.45em] text-ember/80">Persistent keep · Postgres-backed</p>
      <h1 className="mt-4 max-w-3xl font-display text-5xl leading-tight text-parchment md:text-7xl">
        Life is the campaign.
        <span className="block text-ember">You are the hero.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-parchment/75">
        Inscribe real work as quests. Complete them and the keep awards XP, gold, and
        attributes — stored in Supabase, not this device. Refresh, logout, switch machines:
        the chronicle remains.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        {user ? (
          <Link
            href="/home"
            className="rounded-full bg-ember px-6 py-3 font-semibold text-ink shadow-rune"
          >
            Enter the keep
          </Link>
        ) : (
          <>
            <Link
              href="/signup"
              className="rounded-full bg-ember px-6 py-3 font-semibold text-ink shadow-rune"
            >
              Awaken a hero
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-[rgb(var(--line)/0.3)] px-6 py-3"
            >
              Open the gate
            </Link>
          </>
        )}
      </div>
      <ul className="mt-16 grid gap-4 md:grid-cols-3">
        {[
          ["Non-linear XP", "Each level demands more fire than the last."],
          ["Five attributes", "Strength, Intellect, Discipline, Creativity, Social."],
          ["Relics & themes", "Gold, inventory, badges, and shrine skins."],
        ].map(([title, copy]) => (
          <li key={title} className="panel p-5">
            <h2 className="font-display text-xl text-glow">{title}</h2>
            <p className="mt-2 text-sm text-parchment/70">{copy}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
