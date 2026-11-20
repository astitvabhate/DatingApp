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
- `GET /api/health` — which storage backend is active (no secrets).

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

On Vercel every route runs as a separate function with its own temporary disk, so a **Redis database is required**; without it, matches made on one route are invisible to others (e.g. match pages show "Match not found").

1. Vercel dashboard → project → **Storage** → connect **Upstash for Redis** *or* **Redis** (free tiers work).
   Either sets the variables the app reads: `KV_REST_API_URL`/`KV_REST_API_TOKEN`, `UPSTASH_REDIS_REST_URL`/`_TOKEN`, or `REDIS_URL`.
2. Make sure the database is connected to the **Production** environment, then **redeploy**.
3. Open `/api/health` on your site: it should say `"backend":"upstash"` or `"redis"` with `"ok":true`.
   `"tmp-file"` means no database is connected.

Locally, data lives in `data/db.json` unless Redis variables are set.
