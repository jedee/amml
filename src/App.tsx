// ─────────────────────────────────────────────────────────────
//  AMML — Main Application Shell
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import { SplashScreen, LoginScreen } from './components/SplashLogin';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AttendancePage from './pages/AttendancePage';
import MarketsPage from './pages/MarketsPage';
import StaffPage from './pages/StaffPage';
import './styles/app.css';

// ── Screen phases ────────────────────────────────────────────

type Phase = 'splash' | 'login' | 'app';

const PAGES: Record<string, React.ComponentType> = {
  dashboard:  Dashboard,
  attendance: AttendancePage,
  markets:    MarketsPage,
  staff:      StaffPage,
  // Add more pages here as they are migrated
};

function AppShell() {
  const [phase, setPhase] = useState<Phase>('splash');
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (phase === 'splash') {
    return <SplashScreen onDone={() => setPhase('login')} />;
  }

  if (phase === 'login') {
    return <LoginScreen />;
  }

  // App phase — show app once user is logged in (detected via CSS class on #app)
  // We use a wrapper div and show the app via the 'visible' class
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
            : React.createElement(Dashboard)
          }
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