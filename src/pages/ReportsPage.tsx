// ─────────────────────────────────────────────────────────────
//  AMML — Reports Page
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { useApp } from '../contexts/AppContext';

export default function ReportsPage() {
  const { state } = useApp();
  return (
    <div className="page active">
      <div className="ph">
        <div className="ph-l">
          <h2>📋 Reports</h2>
          <p>Attendance summaries and market analytics</p>
        </div>
      </div>
      <div className="card">
        <div className="empty-state">
          <div className="es-icon">📊</div>
          <div className="es-title">Reports Module</div>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>
            Monthly attendance summaries, market performance, and payroll reports.
          </p>
        </div>
      </div>
    </div>
  );
}
