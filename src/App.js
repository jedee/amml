import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ─────────────────────────────────────────────────────────────
//  AMML — Application Router
//
//  phase=splash  → SplashScreen (auto-dismisses after 2.8s)
//  phase=login   → LoginScreen  (user not logged in yet)
//  phase=app     → AppShell     (authenticated: TopBar + Sidebar + Page)
//
//  Root / serves the full React app; /app serves the legacy vanilla JS app.
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { SplashScreen, LoginScreen } from './components/SplashLogin';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import AttendancePage from './pages/AttendancePage';
import StaffPage from './pages/StaffPage';
import MarketsPage from './pages/MarketsPage';
import DevicesPage from './pages/DevicesPage';
import ReportsPage from './pages/ReportsPage';
import PayrollPage from './pages/PayrollPage';
import AlertsPage from './pages/AlertsPage';
import ActivityLogPage from './pages/ActivityLogPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import AISalesPage from './pages/AISalesPage';
const PAGES = {
    dashboard: Dashboard,
    markets: MarketsPage,
    attendance: AttendancePage,
    myatt: AttendancePage,
    staff: StaffPage,
    devices: DevicesPage,
    reports: ReportsPage,
    payroll: PayrollPage,
    alerts: AlertsPage,
    activitylog: ActivityLogPage,
    users: UsersPage,
    'ai-sales': AISalesPage,
    settings: SettingsPage,
};
// ── Authenticated Shell ────────────────────────────────────
function AppShell() {
    const { state } = useApp();
    const [currentPage, setCurrentPage] = React.useState('dashboard');
    return (_jsxs("div", { id: "app", className: "visible", children: [_jsx(TopBar, {}), _jsxs("div", { className: "shell", children: [_jsx(Sidebar, { currentPage: currentPage, onNavigate: setCurrentPage }), _jsx("main", { className: "main", children: PAGES[currentPage]
                            ? React.createElement(PAGES[currentPage])
                            : (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "es-icon", children: "\uD83D\uDEA7" }), _jsx("div", { className: "es-title", children: "Coming Soon" }), _jsxs("p", { children: [currentPage, " \u2014 under construction"] })] })) })] })] }));
}
// ── Root Router ───────────────────────────────────────────
function AppRouter() {
    const { state } = useApp();
    switch (state.phase) {
        case 'splash':
            return _jsx(SplashScreen, {});
        case 'login':
            return _jsx(LoginScreen, {});
        case 'app':
            return state.user ? _jsx(AppShell, {}) : _jsx(LoginScreen, {});
        default:
            return _jsx(HomePage, {});
    }
}
// ── Entry Point ───────────────────────────────────────────
export default function App() {
    return (_jsx(AppProvider, { children: _jsx(AppRouter, {}) }));
}
