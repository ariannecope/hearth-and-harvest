# Hearth & Harvest

A family farm and homestead planner: garden planting windows by USDA zone, a livestock breed explorer with side-by-side comparison, and a personal farm dashboard.

**Stack:** React + Vite (client) · Node + Express 5 (server) · PostgreSQL (Neon in production) · Netlify + Render.

## Run locally

Requires Node 20.6+ and PostgreSQL.

```bash
createdb hearth_harvest

cd server
cp .env.example .env          # DATABASE_URL=postgres://localhost:5432/hearth_harvest
npm install
npm run db:setup              # creates tables + seeds 35 plants and 38 breeds (safe to re-run)
npm run dev                   # API on http://localhost:3001

cd ../client
npm install
npm run dev                   # app on http://localhost:5173 (proxies /api to :3001)
```

Links: `npm run check-links` in `server/` re-checks every further-reading URL. "blocked" usually means the site exists but rejects bots (open it in a browser); "FAILED" or "CHECK" needs a look.

Tests: `npm test` in `server/` (API integration tests against your database) and in `client/` (planting-date math).

## Deploy

1. **Neon:** create a project and copy its connection string (`...?sslmode=require`).
2. **Render:** New → Blueprint → select this repo (uses `render.yaml`). Set `DATABASE_URL` to the Neon string and `CLIENT_ORIGIN` to your Netlify URL. The pre-deploy step runs `db:setup`, so tables and seed data are created automatically.
3. **Netlify:** import the repo (uses `netlify.toml`). Set env var `VITE_API_URL` to your Render URL, e.g. `https://hearth-harvest-api.onrender.com`, then deploy.
4. Check `https://<render-url>/api/health` returns `{"ok":true}`.

Render's free tier sleeps when idle; open the health URL a minute before a demo to wake it.

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/api/plants` | `?search=&category=&season=&zone=` |
| GET | `/api/plants/:id` | |
| GET | `/api/breeds` | `?search=&category=&purpose=&ids=1,2` |
| GET | `/api/breeds/:id` | |
| GET | `/api/breeds/category/:category` | |
| POST | `/api/farm` | Creates a farm, returns its `id` |
| GET / PUT | `/api/farm` | Requires `X-Farm-Id` header |
| GET | `/api/farm-plans` | `{ plants, breeds }` for the farm |
| POST | `/api/farm-plans` | `{ type: "plant"\|"breed", item_id, planting_date?, notes? }` |
| PATCH | `/api/farm-plans/:type/:id` | `{ planting_date?, notes? }` |
| DELETE | `/api/farm-plans/:type/:id` | |

There are no accounts in the MVP: the browser stores its farm's UUID in localStorage and sends it as `X-Farm-Id`.

That UUID doubles as the **farm code**. The farm menu in the header shows it (copy it, copy a sign-in link, or email it to yourself) and has **Sign out**, which only clears the browser's copy. `/open` opens a farm from a pasted code, and `/open?code=<uuid>` is the sign-in link. Anyone with the code can edit the farm, so treat it like a private share link.

## How planting dates are calculated

Each plant stores timing relative to frost (for example, tomatoes are started indoors 6–8 weeks before the last frost and transplanted 1–3 weeks after it). The app estimates average last-spring and first-fall frost dates from the USDA zone (zones 3–10) and applies those offsets. Harvest estimates add days to maturity, and frost-tender crops are capped at the first fall frost. Zone midpoints are approximations, and the UI says so.

## Data notes

Plant data is summarized from land-grant extension guidance; breed data from breed associations, The Livestock Conservancy, and OSU Breeds of Livestock. Each record links to these references. Breed registries live in the `registries` column; general conservation, how-to, and local-help links are in `client/src/lib/resources.js`.

- **Conservation status** comes from The Livestock Conservancy's Conservation Priority List (`CONSERVATION` in `server/db/data/breeds.js`, with the date it was checked). The list is revised every year, so re-check it each spring and re-run `npm run db:setup`.
- **Growing guides** (`server/db/data/guides.js`) link each plant to crop-specific pages from University of Minnesota (Upper Midwest), University of Illinois (Midwest), and Clemson HGIC (Southeast). Plant pages list the guide closest to the farm's zone first.
- **State extension services** for all 50 states and DC are in `client/src/lib/extension.js`; the farm profile's state picks which one the dashboard and "Find local help" show. Review the content before relying on it. Breed and plant images use original line illustrations; the `image_url` column is ready for licensed photography later.

### Photos

Plant and breed photos come from Wikimedia Commons (the lead image of each item's English Wikipedia article) and, for a few plants, iNaturalist. Every photo is openly licensed, and its credit is stored in `image_credit`. Credits appear under photos on detail pages and on `/credits`.

- `cd server && npm run images` refreshes `db/data/images.json` and writes a contact sheet, `scripts/image-review.html`, for checking the matches. Then run `npm run db:setup` to load them.
- To swap a poor match, add a Commons file (or `'inaturalist'`) to `OVERRIDES` in `scripts/fetch-images.js` and re-run.
- Items with no photo keep their illustration. As of Nov 2026 that's only Pineywoods cattle.
- Photos are loaded straight from Wikimedia and iNaturalist servers. Some are CC BY-NC (non-commercial), so recheck the licenses if the project ever becomes commercial.


### Sketches

Hand-drawn sketches appear on the Raise and Grow category buttons and on the dashboard's garden panel. The original phone photos are in `client/sketches-original/`, named `<name>sketch.JPG`. To add or update one:

1. Put the photo in `client/sketches-original/`. Not `client/dist/`: every build empties that folder.
2. Run `python3 client/scripts/process-sketches.py` (needs Pillow, numpy and scipy). It whitens the paper, makes the background transparent, removes stray marks along the edges, trims the image, and writes `client/src/assets/sketches/<name>.webp`.
3. Map the new file to a category in `client/src/lib/sketches.js`. Every category has a sketch now. Breeds and plants without a photo show their category sketch.
