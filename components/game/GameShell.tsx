"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { xpProgress, titleLabel } from "@/lib/game";
import type { Attributes, Profile } from "@/lib/types";
import { RewardProvider } from "@/components/game/RewardBus";
import { ATTRIBUTES } from "@/lib/game";

const NAV = [
  { href: "/home", label: "Command" },
  { href: "/quests", label: "Quests" },
  { href: "/character", label: "Hero" },
  { href: "/tavern", label: "Tavern" },
  { href: "/chronicle", label: "Chronicle" },
];

export function GameShell({
  profile,
  attributes,
  children,
}: {
  profile: Profile;
  attributes: Attributes;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const bar = xpProgress(Number(profile.total_xp), profile.level);

  useEffect(() => {
    document.documentElement.dataset.theme = profile.equipped_theme;
  }, [profile.equipped_theme]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <RewardProvider>
      <div data-theme={profile.equipped_theme} className="min-h-screen pb-24 md:pb-8">
        <header className="sticky top-0 z-40 border-b border-[rgb(var(--line)/0.14)] bg-[rgb(var(--ink)/0.78)] backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
            <Link href="/home" className="font-display text-lg tracking-wide text-ember">
              Life RPG
            </Link>
            <nav aria-label="Primary" className="hidden flex-1 items-center justify-center gap-1 md:flex">
              {NAV.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full px-3 py-1.5 text-sm ${
                      active
                        ? "bg-[rgb(var(--ember)/0.18)] text-ember"
                        : "text-parchment/70 hover:text-parchment"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="ml-auto flex min-w-[12rem] flex-1 flex-col md:max-w-sm">
              <div className="flex items-baseline justify-between gap-3 text-xs uppercase tracking-[0.18em] text-parchment/60">
                <span>
                  Lv {profile.level} · {titleLabel(profile.equipped_title)}
                </span>
                <span>
                  {bar.into}/{bar.toNext} XP
                </span>
              </div>
              <div className="xp-crystal mt-1" aria-hidden="true">
                <span style={{ width: `${bar.pct}%` }} />
              </div>
              <span className="sr-only">
                Level {profile.level}, {bar.into} of {bar.toNext} experience
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded-full border border-[rgb(var(--line)/0.2)] px-3 py-1">
                🔥 {profile.streak_count}
                <span className="sr-only"> day streak</span>
              </span>
              <span className="rounded-full border border-[rgb(var(--line)/0.2)] px-3 py-1">
                🪙 {profile.gold}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-full px-3 py-1 text-parchment/70 hover:text-parchment"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="mx-auto hidden max-w-6xl grid-cols-5 gap-2 px-4 pb-3 md:grid">
            {ATTRIBUTES.map((stat) => (
              <div key={stat.key} className="rounded-xl border border-[rgb(var(--line)/0.12)] px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-parchment/50">
                  {stat.rune} {stat.label}
                </p>
                <p className="font-display text-xl text-glow">{attributes[stat.key]}</p>
              </div>
            ))}
          </div>
        </header>
        <main id="main" className="mx-auto max-w-6xl px-4 py-6">
          {children}
        </main>
        <nav
          aria-label="Mobile"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[rgb(var(--line)/0.14)] bg-[rgb(var(--ink)/0.92)] backdrop-blur md:hidden"
        >
          <ul className="grid grid-cols-5">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex h-14 items-center justify-center text-[11px] uppercase tracking-[0.12em] ${
                      active ? "text-ember" : "text-parchment/60"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </RewardProvider>
  );
}
