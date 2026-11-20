# coy. — Swipe Discovery (Phase 1)

Mobile-first, swipe-based discovery built with **Next.js 15 (App Router) + Tailwind CSS v4 + Framer Motion**.
Backend is Next.js route handlers backed by a JSON file (`data/db.json`). Single implicit logged-in user.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

Open `/discover`. On desktop, use the buttons or ← / → keys; on mobile, drag the card.

## Structure

| Path | What |
| --- | --- |
| `app/page.tsx` | Home tab (blank placeholder) |
| `app/discover/page.tsx` | Swipe deck |
| `app/discover/matches/page.tsx` | Mutual matches list |
| `app/api/{feed,swipe,matches,reset}` | API route handlers |
| `lib/seed.ts` | 32 seed profiles + server-only `INBOUND_LIKES` |
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
Aisha, Kabir, Priya, Isha, Tara, Siddharth, Kavya, Pooja, Anika, Omar.

Delete `data/db.json` (or tap "Reset demo data" in the empty state) to start over.

## Side-quest photos

Match detail pages show placeholder photos from Lorem Picsum (picsum.photos), seeded per profile so they stay stable.
