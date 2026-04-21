// ─────────────────────────────────────────────────────────────
//  GateKeeper — ZK Device Heartbeat Monitor
//  Polls ZK device IP addresses for reachability every 30s
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import { Wifi, WifiOff, Clock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const POLL_INTERVAL_MS = 30_000;

function pingDevice(ip: string): Promise<boolean> {
  return new Promise(resolve => {
    const before = Date.now();
    fetch(`http://${ip}`, { mode: 'no-cors', signal: AbortSignal.timeout(3000) })
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
}

export default function GateKeeper() {
  const { state, dispatch } = useApp();
  const { devices } = state;
  const onlineRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkDevices = async () => {
    const now = new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const checks = await Promise.allSettled(
      devices.map(async d => {
        if (!d.active || !d.serial) return { id: d.id, online: false };
        const online = await pingDevice(d.serial);
        return { id: d.id, online };
      })
    );

    let changed = false;
    for (const r of checks) {
      if (r.status !== 'fulfilled') continue;
      const { id, online } = r.value;
      const wasOnline = onlineRef.current.has(id);
      if (online !== wasOnline) {
        changed = true;
        if (online) {
          onlineRef.current.add(id);
        } else {
          onlineRef.current.delete(id);
        }
        const dev = devices.find(d => d.id === id);
        if (dev) {
          dispatch({
            type: 'UPDATE_DEVICE',
            payload: { ...dev, active: online, lastSeen: online ? 'Just now' : dev.lastSeen },
          });
        }
      }
    }
    if (changed) dispatch({ type: 'AUDIT_LOG', payload: { action: 'GATEKEEPER_POLL', detail: `${onlineRef.current.size}/${devices.length} online` } });
  };

  useEffect(() => {
    checkDevices();
    timerRef.current = setInterval(checkDevices, POLL_INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const online = devices.filter(d => d.active).length;
  const offline = devices.length - online;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700 text-xs">
      <Wifi size={12} className="text-green-400" />
      <span className="font-bold text-green-400">{online}</span>
      <span className="text-zinc-400">online</span>
      <div className="w-px h-3 bg-zinc-600" />
      <WifiOff size={12} className="text-red-400" />
      <span className="font-bold text-red-400">{offline}</span>
      <span className="text-zinc-400">offline</span>
      <div className="w-px h-3 bg-zinc-600" />
      <Clock size={11} className="text-zinc-500" />
      <span className="text-zinc-500">{new Date().toLocaleTimeString()}</span>
    </div>
  );
}
