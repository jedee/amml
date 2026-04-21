// ─────────────────────────────────────────────────────────────
//  AMML — Payroll Page
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { useApp } from '../contexts/AppContext';
import PayrollPilot from '../components/PayrollPilot';

export default function PayrollPage() {
  const { state } = useApp();

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-header-l">
          <h1>💵 Payroll</h1>
          <p>Staff salary management and payroll periods</p>
        </div>
      </div>

      {/* PayrollPilot — Pre-Payroll Validation Agent */}
      <PayrollPilot />

      {/* Salary Configuration */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="empty-state">
          <div className="es-icon">💵</div>
          <div className="es-title">Salary Configuration</div>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>
            Configure payroll periods and staff salaries here.
            Uses attendance data and configured daily rates.
          </p>
        </div>
      </div>
    </div>
  );
}
