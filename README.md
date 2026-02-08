# Audit Trail API

Express + TypeScript + MongoDB API with JWT auth and audit trail logging.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Update `MONGODB_ATLAS_URI`, `JWT_SECRET`, and other values.
3. Run the API:
   ```bash
   npm run dev
   ```

## Seed Data
```bash
npm run seed
```

## Scripts
- `npm run dev` - Start dev server (tsx watch)
- `npm run build` - Compile TypeScript
- `npm run start` - Run compiled server
- `npm test` - Run Jest tests

## Notes
- Shared contracts live in `src/shared/contracts`.
- Vercel handler entry is `api/index.ts`.
