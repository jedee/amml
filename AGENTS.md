# AGENTS.md — AMML Abuja Markets Management Ltd

## Project Overview

**AMML** is a full enterprise management system for the Abuja Markets Management Limited — a Nigerian government parastatal managing 18 markets across the FCT. The system handles staff attendance tracking, market operations, payroll, biometric device management, and an AI-powered sales intelligence suite.

## Current State (as of April 2026)

### The Problem: Two Apps in One

The repository ships with two separate applications:

1. **`public/amml.html`** — The **actual AMML application**: a 5,077-line vanilla JS SPA served at `/app`. This is the production app containing all features. It is a self-contained HTML file using CDN dependencies (Chart.js, xlsx, QRCode.js, Google Fonts).

2. **`src/` (React/Vite scaffold)** — A placeholder Zo Site template with 15 lines of active React code (`src/App.tsx`). It renders a "Welcome to your new Zo site" page with a Pegasus logo. The real AMML app is **not** connected to this React layer.

The `server.ts` routes `/app` and `/app/*` to serve `public/amml.html` directly, bypassing the React app entirely.

### Rewrites

This codebase is undergoing a **gradual rewrite into React + TypeScript** to unify both layers.

## Rewrite Plan

### Phase 1 ✅ — Foundation
- `src/types/models.ts` — All TypeScript interfaces (Market, Staff, Device, Attendance, User, etc.)
- `src/data/` — Typed seed data (MARKETS, STAFF, DEVICES, ROLE_CONFIG, etc.)
- `src/styles/app.css` — Design token system extracted from `amml.html :root`
- `AGENTS.md` — This file

### Phase 2 — App Shell (React)
- `src/contexts/AppContext.tsx` — Global state replacing the `S` object with typed Context + useReducer
- `src/components/SplashScreen.tsx` — Animated SVG logo splash screen
- `src/components/LoginScreen.tsx` — Role selection + PIN login
- `src/components/AppShell.tsx` — TopBar, Sidebar, Page transition overlay
- `src/components/ui/` — Modal, Toast, Table, Badge, Card components

### Phase 3 — Feature Pages
- `src/pages/Dashboard.tsx`
- `src/pages/Markets.tsx`
- `src/pages/Staff.tsx`
- `src/pages/Attendance.tsx`
- `src/pages/Devices.tsx`
- `src/pages/Payroll.tsx`
- `src/pages/Reports.tsx`
- `src/pages/AI_Sales_Suite.tsx`
- `src/pages/Settings.tsx`
- `src/pages/ActivityLog.tsx`
- `src/pages/Users.tsx`
- `src/pages/Alerts.tsx`

### Phase 4 — Deprecate Legacy
- Remove `public/amml.html`
- Remove `src/pages/blank-demo.tsx`
- Update `server.ts` to serve only the React app

## Security Architecture (v1.0 — April 2026)

### Threat Model
Full MITRE ATT&CK taxonomy (17 attack vectors) in `src/lib/security/threat-model.ts`. Threat actors: INSIDER_LOW, INSIDER_COLLUDE, APT_NATIONSTATE, CRIMINAL_FINANCIAL, OPPORTUNIST.

### Auth Gate — All Routes Protected
All `/api/amml/*` routes require `Authorization: Bearer <AMML_API_SECRET>` — constant-time comparison via `timingSafeEqual`. Set secret in [Settings › Advanced](/?t=settings&s=advanced) as `AMML_API_SECRET`. Default dev fallback is `"dev-secret-change-me"` — caught by the auth check, so only the real secret grants access.

### Layered Security (P110)
| Layer | Control |
|---|---|
| PHYSICAL | Tamper-evident device seals; VLAN isolate ZK biometric segment; 802.1X port auth |
| NETWORK | mTLS listener (`src/lib/zk/listener.ts`) with pinned device cert allowlist; 4KB read buffer; clock skew validation (±300s) |
| APPLICATION | Zod schema validation on all route inputs; parameterized SQLite queries; CSP + X-Frame-Options headers |
| AUTH | Bearer token auth on all API routes; constant-time secret comparison; session rotation |
| DATA | Staff PII masked in API responses; WAL mode SQLite; automated S3 backup via CDK cron |
| INFRA | CDK v2 multi-environment (`infrastructure/lib/amml-stack.ts`); AWS Secrets Manager for secrets; multi-AZ RDS |

### Input Sanitization (P111 — Default-Deny)
`src/lib/security/sanitization.ts` — Zod schemas for every route input:
- `schemas.uuid` — UUID v4 validation
- `schemas.date` — ISO date string (YYYY-MM-DD)
- `schemas.page` / `schemas.limit` — integer pagination
- `schemas.sortField` — table column allowlist
- `schemas.staffPost` — staff record fields
- `schemas.attendancePost` — clock-in event fields
- `safeOrderBy()` — whitelist enforcement on ORDER BY clauses
- `stripHtml()` — strips all HTML tags from text fields

### ZK Biometric Integration
- `src/lib/zk/types.ts` — ZKTeco packet parser: header validation (0x5050), little-endian length, null-byte stripping; returns `null` on any malformed input (default-deny at the parser level)
- `src/lib/zk/listener.ts` — mTLS TCP server on port 4370; device cert CN matched against `deviceRegistry` allowlist; resyncs on byte-stuffing; rejects events with >300s clock skew
- `src/lib/zk/service.ts` — Fan-out wiring: listener → `src/lib/events/emitter.ts` (Redis pub/sub) → attendance/payroll/audit subscribers → SQLite
- `src/lib/events/emitter.ts` — Redis pub/sub: `zk:attendance`, `zk:health`, `zk:error` channels; lazy connection; event deduplication via eventId TTL

### IaC — CDK v2 Multi-Environment
`infrastructure/lib/amml-stack.ts` — deploys ECS Fargate + ALB + RDS PostgreSQL (multi-AZ) + ElastiCache Redis. Environments: `dev` (us-east-1), `staging` (af-south-1), `production` (af-south-1). Secrets in AWS Secrets Manager; no plaintext credentials in code.

## Architecture Decisions

### Why a Single `amml.html` Was Used Originally
- Zero build tooling — served directly by any HTTP server
- No CORS issues with CDN dependencies
- Rapid iteration without recompilation
- Easy to deploy to any static host

### Why Rewrite to React
- The 5K-line monolith mixes UI rendering, state management, business logic, and API calls in one file
- No type safety — bugs caught only at runtime
- Hard to test individual features
- shadcn/ui components already scaffolded but unused

### Data Persistence Strategy
- **Phase 1 (DEPRECATED):** localStorage via `dbSave()`/`dbLoad()` — removed ✅
- **Phase 2 ✅ — SQLite backend:** `src/db/database.ts` + `src/routes/amml-api.ts`
  - `bun:sqlite` (built-in, zero deps) at `/home/workspace/amml/data/amml.db`
  - Tables: markets, staff, devices, attendance, daily_summary, audit_log
  - In-memory TTL cache with `getCached()`/`setCache()`/`invalidateCache()`
  - Cache TTL: 30s for lists, 10s for attendance, 15s for summaries
  - Auto-seeds on first run (markets, 10 staff, 5 devices)
- **Phase 3 (in progress):** React frontend calls `/api/amml/*` → SQLite backend
  - **API at `https://amml-jedi.zocomputer.io/api/amml/`** — bearer auth (constant-time comparison)
    - `GET /health` — no auth, health check
    - `GET /markets` — auth required, returns market list
    - `GET /staff` — auth required
    - `GET /devices` — auth required
    - `GET /attendance?date=&market=` — auth required
    - `POST /attendance` — auth required, create attendance record
    - `GET /summary?date=` — auth required, daily summary
  - **`server.ts` uses `app.route("/api/amml", ammlApi)` pattern** — DO NOT use `app.use("/api/amml/*", ammlApi.fetch)`, causes 404 in production
  - **`server.ts` Hono constructor: plain `new Hono()` — no getPath option** — getPath option breaks path resolution in production Bun serve
  - Auth secret: env `AMML_API_SECRET`, default `dev-secret-change-me` (change for production)
- **Phase 4 (future):** PostgreSQL migration for production multi-instance deployment

### Role-Based Access Control
Five roles defined in `ROLE_CONFIG`:
- `SUPERADMIN` (level 1) — full access
- `MD` (level 2) — all except user management
- `MANAGER` (level 3) — dashboard + markets + attendance + staff + devices + reports + alerts
- `SUPERVISOR` (level 4) — dashboard + attendance + staff + reports + alerts
- `OFFICER` (level 5) — dashboard + personal attendance + notices

Each role has a specific `nav` array used to render the sidebar.

## Key Data Models

See `src/types/models.ts` for full TypeScript interfaces.

## Development Commands

```bash
bun run dev    # Development with Vite middleware
bun run build  # Production build to dist/
bun run prod   # Build + serve production
```

## Notes

- API secret: save `AMML_API_SECRET` in [Settings › Advanced](/?t=settings&s=advanced) before deploying
- Zod input validation is already wired on POST /attendance; remaining routes inherit via the auth + sanitization layer
- React frontend currently calls `/api/amml/*` without the Bearer header — must update `AppContext.tsx` to store and forward the token before Phase 3 is complete
- FIDO2/WebAuthn 2FA not yet implemented — current mitigation for relay attack (T1078.003) is session binding to device fingerprint (future)
- PostgreSQL migration to replace SQLite is Phase 4
- Always type-check before committing: `bunx tsc --noEmit`
- The CDN dependencies (xlsx, QRCode, Chart.js) will be replaced with npm packages during rewrite
- Google Fonts (Outfit + Libre Baskerville) should be installed as local fonts or via npm package
