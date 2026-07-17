# Setup and production requirements

## Local and Codespaces

```bash
npm ci
npm run dev
```

Quality checks:

```bash
npm run check
npm run build
```

## Current deployment

The MVP is a static Vite application and needs no runtime secret. Cloudflare Pages builds `dist` from `npm run build`.

## Secrets for the production roadmap

Keep these only in the server-side deployment platform, never in the browser or repository:

- `REINFOLIB_API_KEY` — MLIT Real Estate Information Library API
- `MAP_PROVIDER_TOKEN` — licensed basemap or geocoding provider
- `OPENAI_API_KEY` — optional ordinance extraction/explanation workflow
- `DATABASE_URL` — rule registry and project storage
- `OBJECT_STORAGE_BUCKET` — PLATEAU and generated model assets

## Production readiness checklist

- Confirm data licensing and attribution for every GIS layer.
- Add authenticated backend services for keys and rule packs.
- Establish qualified architect/legal review ownership.
- Add monitoring for stale or missing jurisdiction data.
- Add parcel benchmark tests and independently verified reference calculations.
- Complete security, privacy, disaster recovery and service-level planning.
