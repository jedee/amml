// ─────────────────────────────────────────────────────────────
//  AMML — Main Application Shell
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { SplashScreen, LoginScreen } from './components/SplashLogin';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AttendancePage from './pages/AttendancePage';
import MarketsPage from './pages/MarketsPage';
import StaffPage from './pages/StaffPage';
import UsersPage from './pages/UsersPage';
import './styles/app.css';

// ── Screen phases ────────────────────────────────────────────

type Phase = 'splash' | 'login' | 'app';

const PAGES: Record<string, React.ComponentType> = {
  dashboard:  Dashboard,
  attendance: AttendancePage,
  markets:    MarketsPage,
  staff:      StaffPage,
  users:      UsersPage,
  // Add more pages here as they are migrated
};

function AppShell() {
  const [phase, setPhase] = useState<Phase>('splash');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { state } = useApp();

  // Auto-advance from login → app once user logs in
  useEffect(() => {
    if (phase === 'login' && state.user) {
      setPhase('app');
    }
  }, [state.user, phase]);

  // phase: 'splash' → animated logo, 'login' → login form, 'app' → application
  // state.user from context controls whether we're truly logged in
  if (phase === 'splash') {
    return <SplashScreen onDone={() => setPhase('login')} />;
  }

  // phase is 'login' or 'app' — state.user from context determines actual auth state
  // (dispatch LOGIN from LoginScreen sets state.user, which triggers re-render here)
  if (phase === 'login') {
    return <LoginScreen />;
  }

  // phase === 'app' — state.user is set when LOGIN action was dispatched
  // state.user comes from context so this re-renders when login succeeds
  return (
    <div
      id="app"
      className="visible"
      style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}
    >
      <TopBar />
      <div className="shell">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="main">
          {PAGES[currentPage]
            ? React.createElement(PAGES[currentPage])
            : <div style={{ color: 'var(--text3)', padding: 20 }}>Coming soon: {currentPage}</div>}
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