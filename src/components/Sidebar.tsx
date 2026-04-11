// ─────────────────────────────────────────────────────────────
//  AMML — Sidebar Navigation
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useApp } from '../contexts/AppContext';

interface Props { currentPage: string; onNavigate: (page: string) => void; }

const SECTION_LABELS: Record<string, string> = {
  dashboard: 'Main', attendance: 'Operations', markets: 'Management',
  staff: 'People', devices: 'Hardware', payroll: 'Finance',
  reports: 'Insights', 'ai-sales': 'AI Suite', users: 'Admin', alerts: 'Notices',
};

export default function Sidebar({ currentPage, onNavigate }: Props) {
  const { navItems, currentRole } = useApp();
  if (!navItems.length) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-role">
          <span className="sidebar-role-badge" style={{ background: currentRole?.color + '22', color: currentRole?.color }}>
            {currentRole?.short}
          </span>
          <span className="sidebar-role-name">{currentRole?.label}</span>
        </div>
      </div>
      {navItems.map(item => (
        <React.Fragment key={item.id}>
          {item.id === 'dashboard' && <div className="nav-section">Main</div>}
          {item.id === 'markets' && currentPage !== 'dashboard' && !['attendance','staff','devices','payroll','reports','users','settings','ai-sales'].includes(currentPage) && <div className="nav-section">Operations</div>}
          {item.id === 'staff' && <div className="nav-section">People</div>}
          {item.id === 'devices' && <div className="nav-section">Hardware</div>}
          {item.id === 'payroll' && <div className="nav-section">Finance</div>}
          {item.id === 'reports' && <div className="nav-section">Insights</div>}
          <button className={'nav-item' + (currentPage === item.id ? ' active' : '')} onClick={() => onNavigate(item.id)}>
            <span className="nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.id === 'alerts' && currentRole?.label && <span className="nav-badge">3</span>}
          </button>
        </React.Fragment>
      ))}
      <div className="sidebar-foot">
        <small>AMML v1.0 · Abuja MMD</small>
      </div>
    </aside>
  );
};
