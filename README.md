# coy. — Swipe Discovery (Phase 1)

Mobile-first, swipe-based discovery built with **Next.js 15 (App Router) + Tailwind CSS v4 + Framer Motion**.
Backend is Next.js route handlers; data is stored in Upstash Redis in production and a JSON file (`data/db.json`) locally. Single implicit logged-in user.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

Open `/discover`. On desktop, use the buttons or ← / → keys; on mobile, drag the card.

## Structure

| Path | What |
| --- | --- |
| `app/page.tsx` | Redirects `/` to `/discover` (Home tab is a placeholder) |
| `app/discover/page.tsx` | Swipe deck |
| `app/discover/matches/page.tsx` | Mutual matches list |
| `app/api/{feed,swipe,matches,reset}` | API route handlers |
| `lib/seed.ts` | 16 seed profiles + server-only `INBOUND_LIKES` |
| `lib/db.ts` | JSON-file persistence (atomic writes, serialized updates) |
| `components/` | `SwipeCard`, `Discover`, `MatchModal`, `MatchesList`, `TabBar` |

## API

`/feed`, `/swipe`, `/matches` are rewrites to `/api/*` (see `next.config.ts`).

- `GET /feed` → `{ profiles: Profile[] }` — profiles not yet swiped on.
- `POST /swipe` `{ profileId, action: "like" | "pass" }` → `{ matched: boolean, match? }`.
  `400` invalid body, `404` unknown profile, `409` already swiped.
- `GET /matches` → `{ matches: { profile, matchedAt }[] }` newest first.
- `POST /api/reset` — demo helper; clears swipes and matches.

## Privacy guarantee

Who has liked the user (`INBOUND_LIKES`) lives only in a `server-only` module. It is never serialized
into any response: the feed contains no like signal, its order is independent of it, and a **pass**
always returns `{ matched: false }`. A like on someone reveals their like only when it is mutual.

## Demo tip

These profiles have already liked you, so liking them triggers "It's a match!":
Aisha, Priya, Isha, Tara, Kavya, Pooja, Anika.

Delete `data/db.json` (or tap "Reset demo data" in the empty state) to start over.

## Photos

Profile and side-quest photos come from `public/images/album/women/`. Name a file after a profile id (e.g. `p01.jpg`) to assign it; other files fill the remaining profiles in filename order.
`npm run album` (also run automatically before dev/build) writes small WebP copies to `public/images/album-web/`.

## Deploying (Vercel)

Vercel's filesystem is read-only, so swipes and matches are stored in **Upstash Redis** in production:

1. Vercel dashboard → your project → **Storage** → **Create / Connect** → **Upstash for Redis** (free tier) → connect it to the project.
   This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`).
2. Redeploy.

Without Redis the app still works on Vercel but keeps swipes in `/tmp`, which is temporary and per-instance.
Locally, data lives in `data/db.json` unless the Redis variables are set.
