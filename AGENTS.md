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

- Always type-check before committing: `bunx tsc --noEmit`
- The CDN dependencies (xlsx, QRCode, Chart.js) will be replaced with npm packages during rewrite
- Google Fonts (Outfit + Libre Baskerville) should be installed as local fonts or via npm package
