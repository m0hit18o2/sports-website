# IIMC Sports Council Website

Next.js app for IIM Calcutta's Sports Council: court booking, the "Section Wars" inter-section
tournament (schedule + leaderboard), a photo gallery, and an admin panel to run all of it.

- **Framework**: Next.js 16 (App Router), Tailwind CSS
- **Backend**: Supabase (Postgres, Auth, Storage) — accessed directly from the client, no custom API routes
- **Hosting**: Vercel, auto-deployed from the `master` branch on GitHub
- **Auth**: Supabase Auth (Google OAuth). There are no user roles — "admin" is just an email allowlist (see below)

## Local development

```bash
npm install
npm run dev
```

You need a `.env.local` (gitignored, not committed) with:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
```

Both values are in the Supabase dashboard under **Project Settings → API** for this project
(`nnyztgrtkgwxwxburrmb`). The publishable/anon key is safe to expose client-side — it's the same
key the deployed site uses — but access control is enforced entirely by Postgres Row Level
Security (RLS) policies, not by keeping this key secret.

## Supabase

- **Schema is version-controlled** in `supabase/migrations/`. Every schema change (tables, RLS
  policies, storage buckets) should be a new migration file there — don't make ad-hoc changes via
  the Supabase dashboard SQL editor without also committing the equivalent migration, or the repo
  and the live DB will drift apart.
- **Tables**: `courts`, `sports`, `teams`, `events` (references courts/sports/teams), `slots`
  (court bookings), `photos` (gallery + homepage carousel).
- **RLS is enabled on every table.** Public (anon) reads are allowed where the app needs them;
  writes are gated by a `is_admin()` Postgres function.
- **Storage buckets**: `Gallery` (photo uploads for the gallery/homepage — ⚠️ its upload policy is
  currently *not* admin-gated, a known open issue, see below) and `TeamIcons` (team logos,
  admin-only write).

### The admin allowlist — two places, must be kept in sync manually

There is no `role` column or admin table. "Who is an admin" is a **hardcoded email list that
exists in two separate places**, and there is nothing that keeps them in sync automatically:

1. **`lib/admins.ts`** (`ADMIN_EMAILS`) — client-side only. Controls whether the "Admin" nav link
   and `/admin` page render for a signed-in user. This is cosmetic, not a security boundary.
2. **The `is_admin()` Postgres function** (defined in a migration under `supabase/migrations/`) —
   this is what RLS actually checks before allowing any write. This is the real enforcement.

**When adding or removing an admin, you must update both**, and add a corresponding migration for
#2 (`create or replace function public.is_admin() ... in ('email1', 'email2', ...)`). If you only
update `lib/admins.ts`, that person will see the admin UI but every write they attempt will
silently fail RLS — the app doesn't surface these errors well, so it just looks broken. This has
already happened once; consider consolidating into a single `admins` table that both RLS and the
app query, so this class of bug can't recur.

### Known open issues (as of writing)

- `Gallery` storage bucket's upload policy has no admin check — anyone with the anon key can
  currently upload files to it directly, bypassing the app.
- Supabase Auth's "leaked password protection" setting is disabled (low priority; Google OAuth is
  the only sign-in method in use, so this mainly matters if email/password auth is ever enabled).

## Vercel

The project auto-deploys from the `master` branch of the GitHub repo
(`github.com/m0hit18o2/sports-website`) — pushing to `master` triggers a build and deploy, no
manual step needed. Environment variables (the same two `NEXT_PUBLIC_SUPABASE_*` values as
`.env.local`) must be set in the Vercel dashboard under **Project Settings → Environment
Variables** — they are not read from any committed file.

## Using Claude Code / AI tooling on this repo

`.mcp.json` in the repo root configures two MCP servers for AI-assisted development:

- **`supabase`** — gives the assistant direct read/write access to the database (schema, data,
  logs, migrations) via the Supabase Management API. Requires a `SUPABASE_ACCESS_TOKEN`
  environment variable (a personal access token from
  `supabase.com/dashboard/account/tokens`) to be set wherever the session launches from (e.g. in
  `~/.bashrc`), **not** committed anywhere.
- **`vercel`** — gives the assistant access to deployment status/logs via Vercel's hosted MCP
  server. Authenticates via a one-time browser OAuth flow (`/mcp` in an interactive session), not
  a token in this file.

Neither server's credentials live in this repo — `.mcp.json` only references environment
variables / OAuth, so it's safe to commit as-is.
