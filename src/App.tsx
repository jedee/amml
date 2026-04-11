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

const PAGES: Record<string, React.ComponentType> = {
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

  return (
    <div id="app" className="visible">
      <TopBar />
      <div className="shell">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="main">
          {PAGES[currentPage]
            ? React.createElement(PAGES[currentPage])
            : (
              <div className="empty-state">
                <div className="es-icon">🚧</div>
                <div className="es-title">Coming Soon</div>
                <p>{currentPage} — under construction</p>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}

// ── Root Router ───────────────────────────────────────────
function AppRouter() {
  const { state } = useApp();

  switch (state.phase) {
    case 'splash':
      return <SplashScreen />;
    case 'login':
      return <LoginScreen />;
    case 'app':
      return state.user ? <AppShell /> : <LoginScreen />;
    default:
      return <HomePage />;
  }
}

// ── Entry Point ───────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
