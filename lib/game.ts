import type { HeroAttribute, TaskDifficulty } from "@/lib/types";

export const ATTRIBUTES: {
  key: HeroAttribute;
  label: string;
  rune: string;
  hint: string;
}[] = [
  { key: "strength", label: "Strength", rune: "ᛊ", hint: "Body, labor, training" },
  { key: "intellect", label: "Intellect", rune: "ᛁ", hint: "Study, systems, craft of mind" },
  { key: "discipline", label: "Discipline", rune: "ᛞ", hint: "Habits, focus, follow-through" },
  { key: "creativity", label: "Creativity", rune: "ᚲ", hint: "Art, invention, play" },
  { key: "social", label: "Social", rune: "ᛋ", hint: "People, presence, care" },
];

export const DIFFICULTIES: {
  key: TaskDifficulty;
  label: string;
  xp: number;
  gold: number;
  pts: number;
}[] = [
  { key: "trivial", label: "Trivial", xp: 8, gold: 1, pts: 1 },
  { key: "easy", label: "Easy", xp: 15, gold: 2, pts: 1 },
  { key: "normal", label: "Normal", xp: 28, gold: 4, pts: 2 },
  { key: "hard", label: "Hard", xp: 50, gold: 8, pts: 3 },
  { key: "epic", label: "Epic", xp: 90, gold: 15, pts: 4 },
];

export const TIMEZONES = [
  "UTC",
  "Asia/Kolkata",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

export function attributeMeta(key: HeroAttribute) {
  return ATTRIBUTES.find((item) => item.key === key)!;
}

export function difficultyMeta(key: TaskDifficulty) {
  return DIFFICULTIES.find((item) => item.key === key)!;
}

/** Mirrors public.xp_required_for_level — display only. Source of truth is Postgres. */
export function xpRequiredForLevel(level: number): number {
  return Math.floor(80 * Math.pow(level, 1.65) + 40 * level);
}

export function xpProgress(totalXp: number, level: number) {
  let spent = 0;
  for (let i = 1; i < level; i += 1) {
    spent += xpRequiredForLevel(i);
  }
  const into = Math.max(0, totalXp - spent);
  const toNext = xpRequiredForLevel(level);
  return {
    into,
    toNext,
    pct: toNext <= 0 ? 0 : Math.min(100, (into / toNext) * 100),
  };
}

export function titleLabel(slug: string | null) {
  if (!slug) return "Unnamed";
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
