// ─────────────────────────────────────────────────────────────
//  AMML — AI Sales Suite Page
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { useApp } from '../contexts/AppContext';

export default function AISalesPage() {
  const { state } = useApp();
  return (
    <div className="page active">
      <div className="ph">
        <div className="ph-l">
          <h2>🤖 AI Sales Suite</h2>
          <p>45 virtual collaborators · Powered by Claude AI</p>
        </div>
        <div className="ph-r">
          <span style={{ fontSize: 12, padding: '5px 14px' }} className="badge b-blue">⚡ AI Ready</span>
        </div>
      </div>

      <div className="card">
        <div className="empty-state">
          <div className="es-icon">🤖</div>
          <div className="es-title">AI Sales Suite</div>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>
            Daily briefings, virtual team, ICP builder, and AI-powered prospecting.
            Configure your Anthropic API key in Settings to enable.
          </p>
        </div>
      </div>
    </div>
  );
}
