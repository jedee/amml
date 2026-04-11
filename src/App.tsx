// ─────────────────────────────────────────────────────────────
//  AMML — Main Application
// ─────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { SplashScreen, LoginScreen } from './components/SplashLogin';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
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
import StaffSettingsPage from './pages/StaffSettingsPage';
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

function AppShell() {
  const { state, dispatch } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Phase-based routing: splash → login → app
  if (state.phase === 'splash') {
    return <SplashScreen onDone={() => dispatch({ type: 'GO_TO_LOGIN' })} />;
  }
  if (state.phase === 'login' || !state.user) {
    return <LoginScreen />;
  }

  return (
    <div id="app" className="visible">
      <TopBar />
      <div className="shell">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="main">
          {PAGES[currentPage]
            ? React.createElement(PAGES[currentPage])
            : <div className="empty-state">
                <div className="es-icon">🚧</div>
                <div className="es-title">Coming Soon</div>
                <p>{currentPage} — under construction</p>
              </div>}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
