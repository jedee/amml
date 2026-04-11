// ─────────────────────────────────────────────────────────────
//  AMML — Payroll Page
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { useApp } from '../contexts/AppContext';

export default function PayrollPage() {
  const { state } = useApp();

  return (
    <div className="page active">
      <div className="ph">
        <div className="ph-l">
          <h2>💵 Payroll</h2>
          <p>Staff salary management and payroll periods</p>
        </div>
      </div>

      <div className="card">
        <div className="empty-state">
          <div className="es-icon">💵</div>
          <div className="es-title">Payroll Module</div>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>
            Configure payroll periods and staff salaries here.
            Uses attendance data and configured daily rates.
          </p>
        </div>
      </div>
    </div>
  );
}
