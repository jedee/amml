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
          />
          <button className="btn btn-blue">➕ Add Market</button>
        </div>
      </div>

      <div className="mkt-grid">
        {filtered.map(m => (
          <div key={m.id} className="card">
            <div className="card-head">
              <div>
                <div className="card-title">{m.name}</div>
                <div className="card-sub">{m.location}</div>
              </div>
              <span className={`badge ${m.active ? 'b-green' : 'b-navy'}`}>
                {m.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="mkt-card-info">
              <div>👤 <strong>Manager:</strong> {m.manager}</div>
              <div>📅 <strong>Days:</strong> {m.days}</div>
              <div>👥 <strong>Capacity:</strong> {m.capacity} stalls</div>
            </div>
            <p className="card-sub" style={{ marginTop: 8 }}>{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
