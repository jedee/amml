# AMML — Abuja Markets Management Limited

## What is this?

**AMML** is an enterprise management system for Abuja Markets Management Limited — a parastatal of the FCT Administration managing 18 markets across Abuja, Nigeria. It handles staff attendance tracking (via biometric device import), market operations, payroll, and an AI-powered sales intelligence suite.

## Architecture

### Two-Application Problem

This repository ships **two separate applications**:

| App | Location | Tech | Description |
|-----|----------|------|-------------|
| Legacy | `public/amml.html` | Vanilla JS SPA | The original 5,077-line monolithic app |
| New | `src/` | React 19 + TypeScript | In-progress rewrite |

The legacy `amml.html` remains fully functional and is served at `/app` and `/app/*`. The React rewrite is the long-term target.

### Current File Structure

```
amml/
├── public/
│   ├── amml.html          # LEGACY: Vanilla JS SPA (5,077 lines)
│   ├── index.html          # React entry point
│   └── images/pegasus.png  # Logo image
├── src/
│   ├── main.tsx            # React entry (mounts App)
│   ├── App.tsx             # App shell: phase controller + router
│   ├── types/
│   │   └── models.ts       # All TypeScript interfaces
│   ├── data/               # Typed seed data
│   │   ├── markets.ts      # 18 Abuja markets
│   │   ├── staff.ts        # 24 staff members
│   │   ├── devices.ts      # 16 registered devices
│   │   ├── roles.ts        # Role config (5 auth levels)
│   │   └── attendance.ts  # 30-day generated attendance
│   ├── contexts/
│   │   └── AppContext.tsx # useReducer state (replaces global S)
│   ├── components/
│   │   ├── TopBar.tsx     # Clock, market selector, user badge
│   │   ├── Sidebar.tsx    # Role-aware navigation
│   │   └── SplashLogin.tsx # SplashScreen + LoginScreen
│   ├── pages/
│   │   ├── Dashboard.tsx   # KPI cards, stats, recent attendance
│   │   ├── AttendancePage.tsx
│   │   ├── MarketsPage.tsx
│   │   └── StaffPage.tsx
│   └── styles/
│       └── app.css        # AMML design tokens + component styles
├── server.ts              # Hono + Vite dev server
├── vite.config.ts
└── package.json
```

## State Management

The legacy app used a single global `S = { markets: [...], staff: [...], att: [...], ... }` object. This has been replaced by a typed React Context + `useReducer`:

```tsx
// Every component gets typed access:
const { state, dispatch, navItems, roleConfig, isLoggedIn, can } = useApp();

// Actions (all typed):
dispatch({ type: 'ADD_STAFF', payload: newStaff });
dispatch({ type: 'CLOCK_IN', payload: { staffId: 'AMML-001', clockIn: '08:15:00' } });
dispatch({ type: 'AUDIT_LOG', payload: { action: 'LOGIN', detail: 'Staff ID AMML-001' } });
```

## Auth Levels

| Level | Role | Navigation |
|-------|------|-----------|
| 1 | Super Admin | All modules |
| 2 | Managing Director | All modules |
| 3 | Operations Manager | Dashboard, Markets, Attendance, Staff, Devices, Reports, Alerts |
| 4 | Market Supervisor | Dashboard, Attendance, Staff, Reports, Alerts |
| 5 | Market Officer | Dashboard, My Attendance, Notices |

## Data Models

Key types in `src/types/models.ts`:
- `Market` — 18 FCT markets with capacity, manager, schedule
- `Staff` — employees with `authLevel`, salary, biometric ZK-ID mapping
- `Device` — biometric hardware (ZKTeco, Bantech) per market
- `Attendance` — clock-in/out records with late flag, duration
- `PayrollRecord` — per-market payroll per period
- `AILead` — AI Sales Suite pipeline

## Migration Status

| Feature | Legacy | React |
|---------|--------|-------|
| Login / Splash | ✅ | ✅ |
| Dashboard (KPIs + table) | ✅ | ✅ |
| Markets (grid view) | ✅ | ✅ |
| Staff (table) | ✅ | ✅ |
| Attendance (table + filter) | ✅ | ✅ |
| Devices | ✅ | ⬜ |
| Payroll | ✅ | ⬜ |
| Reports | ✅ | ⬜ |
| AI Sales Suite | ✅ | ⬜ |
| ZKTeco import | ✅ | ⬜ |
| Bantech import | ✅ | ⬜ |
| Alert system | ✅ | ⬜ |
| Activity log | ✅ | ⬜ |

## Development

```bash
bun install
bun run dev    # Vite dev server at localhost:5173
bun run build  # Production build → dist/
```

The site runs at `http://localhost:54305` via the Zo preview iframe.
