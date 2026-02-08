# Audit Trail API

Backend for the Audit Trail App built with Express, TypeScript, and MongoDB. Provides JWT auth, books CRUD, and a config-driven audit trail with filtering.

## Features
- JWT auth with role-based access control
- Books API with cursor pagination and soft delete
- Audit trail with exclude/redact config and request tracing
- Admin-only audits API with filters

## Tech Stack
- Express
- TypeScript
- MongoDB + Mongoose
- Zod

## Quick Start
```bash
npm install
cp .env.example .env
npm run dev
```

API runs on http://localhost:3001

## Environment
Required:
- `MONGODB_ATLAS_URI`
- `JWT_SECRET`

Optional:
- `JWT_EXPIRES_IN`
- `CORS_ORIGINS`
- `LOG_LEVEL`
- `LOG_SINK`

## Seed Data
```bash
npm run seed
```

Demo users:
- Admin: `admin` / `admin123`
- Reviewer: `reviewer` / `reviewer123`

## Scripts
- `npm run dev` - Start dev server (tsx watch)
- `npm run build` - Compile TypeScript
- `npm run start` - Run compiled server
- `npm test` - Run Jest tests

## API Endpoints
- `POST /api/auth/login`
- `GET /api/books`
- `POST /api/books`
- `PATCH /api/books/:id`
- `DELETE /api/books/:id`
- `GET /api/audits` (admin only)
- `GET /api/audits/:id` (admin only)

## Project Structure
```
src/
  bootstrap/      # App & server setup
  config/         # Environment & configuration
  infra/          # DB, logging, security, request context
  modules/        # Feature modules (auth, books, audits)
  shared/         # HTTP helpers, errors, validation
```

## Notes
- Shared contracts live in `src/shared/contracts`.
- Vercel handler entry is `api/index.ts`.
