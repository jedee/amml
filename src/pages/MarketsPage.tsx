// ─────────────────────────────────────────────────────────────
//  AMML — Markets Page
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

export default function MarketsPage() {
  const { state } = useApp();
  const [search, setSearch] = useState('');

  const filtered = state.markets.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page active">
      <div className="ph">
        <div className="ph-l">
          <h2>🏪 Markets</h2>
          <p>{filtered.length} of {state.markets.length} markets</p>
        </div>
        <div className="ph-r">
          <input
            type="search"
            placeholder="Search markets…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8 }}
          />
          <button className="btn btn-blue">➕ Add Market</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map(m => (
          <div key={m.id} className="card" style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{m.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text3)', marginTop: 2 }}>{m.location}</div>
              </div>
              <span className={`badge ${m.active ? 'b-green' : 'b-navy'}`}>
                {m.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--text2)', lineHeight: 1.7 }}>
              <div>👤 <strong>Manager:</strong> {m.manager}</div>
              <div>📅 <strong>Days:</strong> {m.days}</div>
              <div>👥 <strong>Capacity:</strong> {m.capacity} stalls</div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
