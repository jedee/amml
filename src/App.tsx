// ─────────────────────────────────────────────────────────────
//  AMML — Main Application Shell
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { SplashScreen } from './components/SplashLogin';
import { LoginScreen } from './components/SplashLogin';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AttendancePage from './pages/AttendancePage';
import MarketsPage from './pages/MarketsPage';
import StaffPage from './pages/StaffPage';
import UsersPage from './pages/UsersPage';

import AlertsPage from './pages/AlertsPage';
import ActivityLogPage from './pages/ActivityLogPage';
import './styles/app.css';

// ── Phase + page router ────────────────────────────────────

const PAGES: Record<string, React.ComponentType> = {
  dashboard:  Dashboard,
  attendance: AttendancePage,
  markets:    MarketsPage,
  staff:      StaffPage,
  users:      UsersPage,
  alerts:      AlertsPage,
  activitylog: ActivityLogPage,
};

function AppShell() {
  // phase lives in context reducer (not local state) so logout syncs properly
  const { state } = useApp();

  // Auto-advance: splash → login after splash timer (LoginScreen calls onDone)
  // Auto-advance: login → app when user logs in (state.user is set by LOGIN action)
  if (state.phase === 'splash') {
    return <SplashScreen onDone={() => {}} />;
  }

  if (state.phase === 'login' || !state.user) {
    return <LoginScreen />;
  }

  // Logout: AppShell watches state.phase and returns to LoginScreen
  // when LOGOUT reducer sets phase back to 'login'

  const [currentPage, setCurrentPage] = useState('dashboard');

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
