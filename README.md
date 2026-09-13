# Life RPG — The Living Keep

A production-style full-stack life RPG for hackathon demos: real signup, Postgres persistence, server-side XP/leveling, streaks, attributes, inventory, and an RPG UI.

Progress is **never** stored in `localStorage`. The source of truth is **Supabase PostgreSQL** with Row Level Security. Completing a quest, buying a relic, and leveling all go through SQL RPCs so clients cannot write their own XP.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase Auth
- PostgreSQL (Supabase)

## Features

- Signup / login / logout with cookie sessions (`@supabase/ssr`)
- User-specific profiles, attributes, tasks, inventory, and activity history
- Task CRUD (create, amend, delete active quests)
- `complete_task` RPC: XP, gold, attribute points, streak, level-ups, item grants
- Non-linear curve: `xp_required_for_level(n) = floor(80 * n^1.65 + 40 * n)` (strictly increasing)
- Economy: gold, catalog, purchase, equip themes/badges/titles
- Dashboard HUD: level, XP crystal, streak, five stats
- Responsive layout, keyboard focus rings, skip link, `aria-live` reward announcements
- `prefers-reduced-motion` respected

## 1. Supabase project (required)

1. Create a project at [https://supabase.com](https://supabase.com).
2. **Authentication → Providers → Email**: enable Email.
   - For a smooth demo, turn **off** “Confirm email” under Authentication → Providers → Email (or Authentication → Settings, depending on dashboard version). Otherwise new users must click a confirmation link.
3. **Authentication → URL configuration**
   - Site URL: `http://localhost:3000` (later your Vercel URL)
   - Redirect URLs: `http://localhost:3000/auth/callback` and `https://YOUR-DOMAIN/auth/callback`
4. Open **SQL Editor**, paste the full contents of  
   `supabase/migrations/20240912120000_init.sql`, and run it.  
   This creates enums, tables, RLS, triggers (including `on_auth_user_created`), RPCs, and the item catalog seed.
5. Copy **Project Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Publishable key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`  
   Do **not** put the `service_role` / secret key in the Next.js app.

If you already have a failed partial schema, drop the public objects from this migration (or start a fresh project) before re-running.

## 2. Local app

Requires Node.js 20+ and npm.

```bash
cd LifeRPG
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## 3. Deploy (Vercel)

1. Push this folder to GitHub.
2. Import the repo in Vercel.
3. Set the same two `NEXT_PUBLIC_SUPABASE_*` environment variables.
4. Add the production URL to Supabase Auth Site URL + Redirect URLs (`https://YOUR-APP.vercel.app/auth/callback`).
5. Deploy.

## Judge Demo Flow

Game data is stored in **Supabase / PostgreSQL**, not in `localStorage`. Completing a quest writes XP, gold, attributes, and history on the server so a refresh loads the same hero from the database.

1. **Sign up / log in** — create an account (or log in) and land on the Command deck.
2. **Create a quest** — open Quests → New quest, name it, pick an attribute and difficulty, then post it to the board.
3. **Complete the quest** — press Complete on that contract.
4. **Show XP, gold, and attribute increase** — the HUD updates XP and gold; the attribute you mapped to the quest goes up (and a reward toast confirms the seal).
5. **Refresh the page** — reload the browser. Level, XP, gold, stats, quests, and chronicle remain, proving PostgreSQL persistence.

## Security model

| Action | Mechanism |
|---|---|
| Read own hero / quests / inventory / history | RLS `auth.uid()` |
| Create / edit / delete **active** tasks | RLS + column grants (cannot set `status` or XP) |
| Complete quest / buy / equip / rename | `SECURITY DEFINER` RPCs |
| Progression columns (`level`, `total_xp`, `gold`, stats) | Not updatable by the `authenticated` role |

XP and gold for a completion come from `difficulty_rewards`, not from the client.

## Project map

```
app/                 routes, layouts, HUD pages
components/          auth, quests, tavern, HUD
lib/                 supabase clients, validations, XP display helper
supabase/migrations  schema, RLS, RPCs, catalog seed
```

`lib/game.ts` mirrors the XP formula for bars only. Postgres remains authoritative.

## Troubleshooting

- **Hero record missing**: migration/trigger not applied. Run the SQL, then sign up a **new** user.
- **Invalid API key / missing env**: `.env.local` not loaded; restart `npm run dev`.
- **Cannot complete twice**: expected; completed rows are sealed.
- **Email not confirmed**: disable confirmations for the demo, or click the mail link.
