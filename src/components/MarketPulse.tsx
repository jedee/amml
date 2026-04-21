// ─────────────────────────────────────────────────────────────
//  MarketPulse — Market Health Scores
//  Scores: attendance rate + active staff + device coverage
// ─────────────────────────────────────────────────────────────
import React, { useMemo } from 'react';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export default function MarketPulse() {
  const { state } = useApp();
  const { markets, staff, att, devices } = state;
  const today = new Date().toISOString().split('T')[0];

  const scores = useMemo(() => {
    return markets.filter(m => m.active).map(m => {
      const mStaff = staff.filter(s => s.market === m.name && s.active);
      const mRecs = att.filter(r => r.date === today && mStaff.some(s => s.id === r.staffId));
      const mDevices = devices.filter(d => d.market === m.name && d.active);
      const attRate = mStaff.length > 0 ? Math.round((mRecs.length / mStaff.length) * 100) : 0;
      const deviceScore = Math.min(100, mDevices.length * 25);
      const score = Math.round((attRate * 0.7) + (deviceScore * 0.3));
      return { name: m.name, score, attRate, deviceCount: mDevices.length, staffCount: mStaff.length, trend: score >= 75 ? 'up' : score < 50 ? 'down' : 'flat' };
    }).sort((a, b) => b.score - a.score);
  }, [markets, staff, att, devices, today]);

  const avg = scores.length ? Math.round(scores.reduce((s, m) => s + m.score, 0) / scores.length) : 0;

  const scoreColor = (s: number) => s >= 75 ? 'text-green-400' : s >= 50 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = (s: number) => s >= 75 ? 'bg-green-500/10 border-green-500/30' : s >= 50 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700 text-xs">
        <Activity size={12} className="text-purple-400" />
        <span className="font-bold text-purple-400">{avg}%</span>
        <span className="text-zinc-400">avg health</span>
      </div>
      <div className="space-y-1">
        {scores.slice(0, 5).map((m, i) => (
          <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${scoreBg(m.score)}`}>
            <span className={`font-bold ${scoreColor(m.score)}`}>{m.score}%</span>
            <span className="flex-1 text-zinc-300 truncate">{m.name}</span>
            {m.trend === 'up' ? <TrendingUp size={11} className="text-green-500" /> : m.trend === 'down' ? <TrendingDown size={11} className="text-red-500" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}