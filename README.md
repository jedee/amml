# AMML — Abuja Markets Management Limited

## What is this?

**AMML** is an enterprise management system for Abuja Markets Management Limited — a parastatal of the FCT Administration managing 18 markets across Abuja, Nigeria. It handles staff attendance tracking (via biometric device import), market operations, payroll, and an AI-powered sales intelligence suite.

## Architecture

### Single React Application

This repository contains **one application** — a React 19 + TypeScript SPA. The legacy vanilla JS app (`amml.html`) was never fully migrated and the source file no longer exists.

```
amml/
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
│   │   ├── HomePage.tsx     # Public landing page (/)
│   │   ├── Dashboard.tsx     # KPI cards, stats, recent attendance
│   │   ├── AttendancePage.tsx  # Attendance table + manual clock in/out
│   │   ├── MarketsPage.tsx  # Grid view of 18 FCT markets
│   │   ├── StaffPage.tsx    # Staff table + Excel/CSV nominal roll import
│   │   ├── DevicesPage.tsx  # Device cards + ZKTeco + Bantech CSV import
│   │   ├── AlertsPage.tsx   # Alert list with dismiss + filter
│   │   ├── ActivityLogPage.tsx # Searchable audit log with CSV export
│   │   ├── UsersPage.tsx    # Auth level assignment
│   │   ├── SettingsPage.tsx # Attendance/payroll rules + JSON backup/restore
│   │   ├── PayrollPage.tsx  # ⚠️ Placeholder — no real data operations
│   │   ├── ReportsPage.tsx   # ⚠️ Placeholder — no real data operations
│   │   └── AISalesPage.tsx  # ⚠️ Placeholder — no AI integration
│   └── hooks/
│       └── useStaffImport.ts # Excel/CSV import hook for nominal roll
├── server.ts              # Hono + Vite dev server
├── vite.config.ts
└── package.json
```

## State Management

The legacy app used a single global `S = { markets: [...], staff: [...], att: [...], ... }` object. This has been replaced by a typed React Context + `useReducer`:

```tsx
const { state, dispatch, navItems, roleConfig, isLoggedIn, can } = useApp();

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

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Login / Splash | ✅ Working | Staff ID + optional password |
| Dashboard (KPIs + table) | ✅ Working | Live stats from state |
| Markets (grid view) | ✅ Working | All 18 FCT markets |
| Staff (table + filter) | ✅ Working | Excel/CSV import via xlsx |
| Attendance (table + filter) | ✅ Working | Date range, search, manual clock in/out |
| My Attendance | ✅ Working | Officers see only their own records |
| Devices (cards + import) | ✅ Working | ZKTeco + Bantech CSV parsers |
| Alerts (dismiss + filter) | ✅ Working | AlertItem[] with dispatch |
| Activity Log (search + export) | ✅ Working | CSV export, audit trail |
| Users (role assignment) | ✅ Working | Updates staff authLevel + audit log |
| Settings (rules + backup) | ✅ Working | Attendance/payroll rules, JSON restore |
| Payroll | ⚠️ Placeholder | Shows info text only |
| Reports | ⚠️ Placeholder | Shows info text only |
| AI Sales Suite | ⚠️ Placeholder | No AI integration yet |

## Notes

### Staff Enrollment
Staff are **not enrolled manually** — they are created automatically when biometric device logs are imported. When ZKTeco/Bantech records reference an unknown staff ID, a new `Staff` record is auto-created. See `DevicesPage.tsx` → **Biometric Import** tab.

### Auth & Permissions
- Users log in with their **Staff ID** (e.g. `AMML-001`) and a self-set password
- Super Admin / MD can assign roles to staff via the **Users** page
- Navigation is role-aware — officers see only their allowed modules

## Development

```bash
bun install
bun run dev    # Vite dev server (served at localhost:54305 via Zo)
bun run build  # Production build → dist/
```

The site runs at `http://localhost:54305` via the Zo preview iframe.

## Staff Nominal Roll Import

Use the **"Import Nominal Roll"** button on the Staff page to bulk-upload staff from Excel or CSV.

**Required columns:** `AMML ID`, `First`, `Last`, `Department`, `Market`

**Optional columns:** `Phone`, `Role`, `Salary`, `AuthLevel`

**AuthLevel values:** `SUPERADMIN`, `MD`, `MANAGER`, `SUPERVISOR`, `OFFICER`

Duplicate AMML IDs (already registered staff) will be **updated** with the new data. New IDs will be **added** as active staff.

## Known Issues

- **Payroll, Reports, AI Sales Suite** are placeholder pages. No data operations are implemented for these modules.
- **Biometric import** (ZKTeco/Bantech) works via CSV paste-and-preview, but does not yet support live device polling.
