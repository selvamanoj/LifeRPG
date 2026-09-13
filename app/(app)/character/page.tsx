import { getHeroBundle } from "@/lib/data";
import { IdentityForm } from "@/components/hero/IdentityForm";
import { ATTRIBUTES, titleLabel, xpProgress } from "@/lib/game";
import { createClient } from "@/lib/supabase/server";
import type { CatalogItem } from "@/lib/types";

export default async function CharacterPage() {
  const { profile, attributes } = await getHeroBundle();
  if (!profile || !attributes) return null;
  const bar = xpProgress(Number(profile.total_xp), profile.level);
  const supabase = await createClient();
  const { data: catalog } = await supabase.from("item_catalog").select("*");
  const items = (catalog as CatalogItem[] | null) ?? [];
  const badge = items.find((item) => item.slug === profile.equipped_badge);
  const title = items.find((item) => item.slug === profile.equipped_title);
  const theme = items.find((item) => item.slug === profile.equipped_theme);

  return (
    <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
      <section className="panel rune-frame p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-ember/80">Hero sheet</p>
        <h1 className="mt-2 font-display text-4xl">{profile.display_name}</h1>
        <p className="text-parchment/70">
          {titleLabel(profile.equipped_title)} · Level {profile.level}
        </p>
        <div className="mt-6">
          <div className="mb-1 flex justify-between text-xs uppercase tracking-[0.16em] text-parchment/50">
            <span>XP crystal</span>
            <span>
              {bar.into} / {bar.toNext}
            </span>
          </div>
          <div className="xp-crystal">
            <span style={{ width: `${bar.pct}%` }} />
          </div>
        </div>
        <dl className="mt-8 grid gap-4">
          {ATTRIBUTES.map((stat) => (
            <div key={stat.key} className="flex items-center justify-between rounded-2xl border border-[rgb(var(--line)/0.12)] px-4 py-3">
              <div>
                <dt className="font-display text-xl">
                  {stat.rune} {stat.label}
                </dt>
                <dd className="text-xs text-parchment/50">{stat.hint}</dd>
              </div>
              <p className="font-display text-3xl text-glow">{attributes[stat.key]}</p>
            </div>
          ))}
        </dl>
      </section>
      <div className="space-y-6">
        <IdentityForm profile={profile} />
        <section className="panel p-6">
          <h2 className="font-display text-2xl text-ember">Equipped</h2>
          <ul className="mt-3 space-y-2 text-sm text-parchment/80">
            <li>Badge: {badge?.name ?? "None"}</li>
            <li>Title: {title?.name ?? "None"}</li>
            <li>Theme: {theme?.name ?? profile.equipped_theme}</li>
            <li>Last quest day: {profile.last_quest_date ?? "—"}</li>
            <li>Timezone: {profile.timezone}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
