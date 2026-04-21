// ────────────────────────────────────────────────
//  AMML — Device Management Page
//  Realand AL325 (WiFi) + AL321 (Biometric) import
// ────────────────────────────────────────────────
import type { Device, DeviceType } from "../types/models";
import { useApp } from "../contexts/AppContext";
import { apiAddDevice, apiDeleteDevice, apiUpdateDevice } from '../api/amml';
import { useState } from "react";

interface ZKRec { zkId: string; date: string; time: string; inOut: "In"|"Out"; staffId?: string; ammlId?: string }
interface BTRec { name: string; date: string; time: string; deviceName: string; matchedId?: string; score?: number }

function parseZK(t: string): ZKRec[] {
  const ls = t.trim().split(/\r?\n/).filter(Boolean);
  if (!ls.length) return [];
  const sep = ls[0].includes(',') ? ',' : '\t';
  const H = ls[0].split(sep).map(h => h.trim().replace(/^['"]|['"]$/g, '').toLowerCase());
  const fi = (...n: string[]) => { for (const x of n) { const i = H.findIndex(h => h.replace(/[\s._-]/g, '') === x.replace(/[\s._-]/g, '')); if (i >= 0) return i; } return -1; };
  return ls.slice(1).map(l => {
    const v = l.split(sep).map(x => x.trim().replace(/^['"]|['"]$/g, ''));
    const zi = fi('userid','empcode','employeeid','id','pin','no','enrollnumber');
    const di = fi('date','punchdate','attendancedate','datetime');
    const ti = fi('time','punchtime','checktime');
    const si = fi('inout','status','punchstate','direction','type');
    let ds = (v[di >= 0 ? di : 0] || '').split(' ')[0].trim();
    // Normalize to YYYY-MM-DD — handle DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
    const parts = ds.replace(/\//g,'-').split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        ds = parts.join('-'); // already YYYY-MM-DD
      } else if (parts[2].length === 4) {
        ds = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`; // DD-MM-YYYY or DD/MM/YYYY
      }
    }
    let ts = (v[ti >= 0 ? ti : 1] || '').trim();
    // Normalize time to HH:MM:SS
    if (/^\d{1,2}:\d{2}$/.test(ts)) ts = ts + ':00';
    const sv = (v[si >= 0 ? si : 2] || '').toLowerCase();
    return { zkId: v[zi >= 0 ? zi : 0] || '', date: ds, time: ts, inOut: (sv.includes('out') || sv === '1') ? 'Out' as const : 'In' as const } as ZKRec;
  }).filter(r => r.zkId && r.date);
}

function parseBT(t: string): BTRec[] {
  const ls = t.trim().split(/\r?\n/).filter(Boolean);
  if (!ls.length) return [];
  const sep = ls[0].includes(',') ? ',' : '\t';
  const H = ls[0].split(sep).map(h => h.trim().replace(/['"]/g,'').toLowerCase().replace(/\s+/g,'_'));
  const gi = (s: string) => H.findIndex(h => h.includes(s));
  return ls.slice(1).map(l => {
    const v = l.split(sep).map(x => x.trim().replace(/['"]/g,''));
    return { name: v[gi('name') >= 0 ? gi('name') : 0] || v[0] || '', date: v[gi('date')] || '', time: v[gi('time')] || '', deviceName: v[gi('device') >= 0 ? gi('device') : 2] || '' } as BTRec;
  }).filter(r => r.name);
}

function DeviceCard({ dev, onDelete, onImport }: { dev: Device; onDelete: (id: string) => void; onImport: (file: File) => void }) {
  const { dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [zkPreview, setZkPreview] = useState<ZKRec[]>([]);
  const [zkFile, setZkFile] = useState<File | null>(null);
  const [zkMkt, setZkMkt] = useState('');

  const { staff, att, zkMap } = useApp().state;

  function toggle() {
    dispatch({ type: 'UPDATE_DEVICE', payload: { ...dev, active: !dev.active, lastSeen: !dev.active ? 'Just now' : dev.lastSeen } });
    dispatch({ type: 'AUDIT_LOG', payload: { action: 'TOGGLE_DEVICE', detail: dev.name + ' ' + (!dev.active ? 'online' : 'offline') } });
    apiUpdateDevice({ ...dev, active: !dev.active }).catch(() => {});
  }

  function onZKChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setZkFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseZK((ev.target?.result as string) || '');
      rows.forEach(r => {
        const m = staff.find(s => s.id === r.zkId || s.id.startsWith(r.zkId));
        if (m) { r.staffId = m.id; r.ammlId = m.id; }
        else { const zm = Object.entries(zkMap).find(([, v]) => v === r.zkId); if (zm) { r.ammlId = zm[0]; } }
      });
      setZkPreview(rows);
    };
    reader.readAsText(file);
  }

  function syncZK() {
    let n = 0;
    zkPreview.forEach(r => {
      const sid = r.ammlId || Object.entries(zkMap).find(([, v]) => v === r.zkId)?.[0];
      if (!sid) return;
      const sf = staff.find(s => s.id === sid); if (!sf) return;
      const ex = att.find(a => a.date === r.date && a.staffId === sid);
      if (r.inOut === 'In' && !ex) { const late = r.time > '08:15'; const entry = { id: 'a' + Date.now() + Math.random().toString(36).slice(2), staffId: sid, staffName: sf.first + ' ' + sf.last, market: zkMkt || dev.market, dept: sf.dept, date: r.date, clockIn: r.time, clockOut: '', device: dev.name, late, duration: null }; dispatch({ type: 'ADD_ATTENDANCE', payload: entry }); n++; }
      else if (r.inOut === 'Out' && ex) { dispatch({ type: 'UPDATE_ATT', payload: { ...ex, clockOut: r.time } }); n++; }
    });
    dispatch({ type: 'AUDIT_LOG', payload: { action: 'ZK_SYNC', detail: `${dev.name}: ${n} records` } });
    setZkPreview([]); setZkFile(null);
    alert(`${dev.name}: ${n} records synced`);
    setOpen(false);
  }

  const recentClocks = att.filter(a => a.device === dev.name).slice(-5);
  const lastSync = dev.lastSeen;

  return (
    <div style={{
      background: "#ffffff",
      borderRadius: "var(--r)",
      padding: open ? 0 : 18,
      border: "1.5px solid #d0dbe8",
      boxShadow: "0 2px 12px rgba(0,40,80,.08)",
      overflow: "hidden",
      transition: "padding 0.2s",
    }}>
      {/* Always-visible header */}
      <div style={{ padding: open ? 0 : 18, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: dev.active ? "rgba(40,140,40,.1)" : "var(--surface3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{dev.active ? "📱" : "📴"}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{dev.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--text3)" }}>{dev.market}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 99, background: dev.active ? "rgba(40,140,40,.12)" : "var(--surface3)", color: dev.active ? "var(--green-logo)" : "var(--text3)" }}>{dev.active ? "ONLINE" : "OFFLINE"}</span>
          <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: dev.active ? "var(--green-logo)" : "var(--border)", boxShadow: dev.active ? "0 0 6px var(--green-logo)" : "none" }} />
            <span style={{ fontSize: 10.5, color: "var(--text3)" }}>{dev.lastSeen}</span>
          </div>
        </div>
      </div>

      {/* Always-visible action row */}
      <div style={{ padding: "0 18px 14px", display: "flex", gap: 7, flexWrap: "wrap", background: "var(--surface2)", borderTop: "1px solid var(--border)" }}>
        <button onClick={() => setOpen(!open)} style={{ flex: "1 1 calc(50% - 4px)", padding: "8px 10px", borderRadius: "var(--r-sm)", border: "1.5px solid var(--border)", background: open ? "var(--surface3)" : "var(--surface)", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", color: "var(--text2)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          {open ? <span>▲ Close</span> : <><span>📥</span> Import Logs</>}
        </button>
        <button onClick={toggle} style={{ flex: "1 1 calc(50% - 4px)", padding: "8px 10px", borderRadius: "var(--r-sm)", border: "none", background: dev.active ? "#C0392B" : "var(--green-logo)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          {dev.active ? "⏸ Deactivate" : "▶ Activate"}
        </button>
      </div>

      {/* Expanded panel */}
      {open && (
        <div style={{ borderTop: "1.5px solid var(--border)" }}>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, borderBottom: "1px solid var(--border)" }}>
            {[{ label: "TYPE", value: dev.type }, { label: "SERIAL", value: dev.serial }, { label: "TODAY", value: dev.clocksToday + " clocks" }].map(({ label, value }) => (
              <div key={label} style={{ padding: "10px 14px", borderRight: "1px solid var(--border)" }}>
                <div style={{ color: "var(--text3)", fontSize: 10, fontWeight: 700 }}>{label}</div>
                <div style={{ fontWeight: 600, marginTop: 2, fontFamily: label === "SERIAL" ? "monospace" : "inherit", fontSize: label === "TYPE" ? 12 : 11 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Recent clock events for this device */}
          {recentClocks.length > 0 && (
            <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", marginBottom: 6 }}>RECENT EVENTS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {recentClocks.map((a, i) => (
                  <div key={i} style={{ fontSize: 11, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "monospace" }}>{a.date}</span>
                    <span style={{ fontFamily: "monospace" }}>{a.clockIn}{a.clockOut ? ' → ' + a.clockOut : ' → —'}</span>
                    <span style={{ color: a.late ? "#C0392B" : "var(--green-logo)", fontWeight: 600, fontSize: 10 }}>{a.late ? "LATE" : "OK"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Import section */}
          <div style={{ padding: "14px", background: "var(--surface2)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: "var(--text2)" }}>📂 Import CSV from {dev.name}</div>
            <label style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px", border: "2px dashed var(--border)", borderRadius: "var(--r-sm)", cursor: "pointer", background: "var(--surface)", marginBottom: 10 }}>
              <span style={{ fontSize: 20, marginBottom: 6 }}>📄</span>
              <span style={{ fontWeight: 600, fontSize: 12 }}>{zkFile ? zkFile.name : `Select CSV from ${dev.name}`}</span>
              <input type="file" accept=".csv" onChange={onZKChange} style={{ display: "none" }} />
            </label>

            {zkPreview.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6 }}>
                  {zkPreview.length} records — {zkPreview.filter(r => r.ammlId).length} matched, {zkPreview.filter(r => !r.ammlId).length} unmapped
                </div>
                <div style={{ maxHeight: 120, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 6 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                    <thead><tr style={{ background: "var(--surface3)" }}><th style={{ padding: "4px 8px", textAlign: "left" }}>ZK ID</th><th style={{ padding: "4px 8px", textAlign: "left" }}>Staff</th><th style={{ padding: "4px 8px", textAlign: "left" }}>Time</th><th style={{ padding: "4px 8px", textAlign: "left" }}>I/O</th></tr></thead>
                    <tbody>
                      {zkPreview.slice(0, 6).map((r, i) => { const sf = staff.find(s => s.id === r.ammlId); return <tr key={i} style={{ borderTop: "1px solid var(--border)" }}><td style={{ padding: "4px 8px", fontFamily: "monospace" }}>{r.zkId}</td><td style={{ padding: "4px 8px" }}>{sf ? sf.first + " " + sf.last : <span style={{ color: "var(--orange)" }}>—</span>}</td><td style={{ padding: "4px 8px", fontFamily: "monospace" }}>{r.time}</td><td style={{ padding: "4px 8px", color: r.inOut === "In" ? "var(--green-logo)" : "var(--blue)", fontWeight: 700 }}>{r.inOut}</td></tr>; })}
                    </tbody>
                  </table>
                </div>
                <button onClick={syncZK} style={{ marginTop: 8, width: "100%", padding: "8px", borderRadius: "var(--r-sm)", border: "none", background: "var(--blue)", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                  Sync to {dev.market}
                </button>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div style={{ padding: "10px 14px", display: "flex", gap: 8 }}>
            {confirm ? (
              <div style={{ flex: 1, display: "flex", gap: 6 }}>
                <button onClick={() => { onDelete(dev.id); setConfirm(false); }} style={{ flex: 1, padding: "7px", borderRadius: "var(--r-sm)", border: "none", background: "#C0392B", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Confirm Delete</button>
                <button onClick={() => setConfirm(false)} style={{ flex: 1, padding: "7px", borderRadius: "var(--r-sm)", border: "1.5px solid var(--border)", background: "var(--surface)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => setConfirm(true)} style={{ flex: 1, padding: "7px", borderRadius: "var(--r-sm)", border: "1.5px solid #C0392B", background: "transparent", color: "#C0392B", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Delete Device
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BiometricImport() {
  const { state, dispatch } = useApp();
  const [bio, setBio] = useState<'zk'|'bt'>('zk');
  const [zkFile, setZkFile] = useState<File|null>(null);
  const [zkPreview, setZkPreview] = useState<ZKRec[]>([]);
  const [zkDev, setZkDev] = useState('Realand AL325');
  const [zkMkt, setZkMkt] = useState('');
  const [btFile, setBtFile] = useState<File|null>(null);
  const [btPreview, setBtPreview] = useState<BTRec[]>([]);
  const [btDev, setBtDev] = useState('Realand AL321');
  const [open, setOpen] = useState(false);
  const { markets, staff, att, zkMap } = state;
  const entries = Object.entries(zkMap);
  function onZKChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setZkFile(file);
    const r = new FileReader();
    r.onload = ev => {
      const rows = parseZK((ev.target?.result as string) || '');
      rows.forEach(r => {
        const m = staff.find(s => s.id === r.zkId || s.id.startsWith(r.zkId));
        if (m) { r.staffId = m.id; r.ammlId = m.id; }
        else { const zm = Object.entries(zkMap).find(([,v]) => v === r.zkId); if (zm) { r.ammlId = zm[0]; } }
      });
      setZkPreview(rows);
    };
    r.readAsText(file);
  }
  function syncZK() {
    let n = 0;
    zkPreview.forEach(r => {
      const sid = r.ammlId || Object.entries(zkMap).find(([,v]) => v === r.zkId)?.[0];
      if (!sid) return;
      const sf = staff.find(s => s.id === sid); if (!sf) return;
      const ex = att.find(a => a.date === r.date && a.staffId === sid);
      if (r.inOut === 'In' && !ex) { const late = r.time > '08:15'; const entry = { id: 'a'+Date.now()+Math.random().toString(36).slice(2), staffId: sid, staffName: sf.first+' '+sf.last, market: zkMkt || sf.market, dept: sf.dept, date: r.date, clockIn: r.time, clockOut: '', device: zkDev, late, duration: null }; dispatch({ type: 'ADD_ATTENDANCE', payload: entry }); n++; }
      else if (r.inOut === 'Out' && ex) { dispatch({ type: 'UPDATE_ATT', payload: { ...ex, clockOut: r.time } }); n++; }
    });
    dispatch({ type: 'AUDIT_LOG', payload: { action: 'ZK_SYNC', detail: 'ZK: '+n+' records' } });
    setZkPreview([]); setZkFile(null);
    alert('ZK Sync: '+n+' records');
  }
  function onBTChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setBtFile(file);
    const r = new FileReader();
    r.onload = ev => {
      const rows = parseBT((ev.target?.result as string) || '');
      rows.forEach(row => {
        const m = staff.find(s => (s.first+' '+s.last).toLowerCase().startsWith(row.name.toLowerCase().split(' ')[0]));
        if (m) { row.matchedId = m.id; row.score = 100; }
      });
      setBtPreview(rows);
    };
    r.readAsText(file);
  }
  function syncBT() {
    let n = 0;
    btPreview.forEach(row => {
      if (!row.matchedId) return;
      const sf = staff.find(s => s.id === row.matchedId); if (!sf) return;
      const ex = att.find(a => a.date === row.date && a.staffId === row.matchedId);
      if (!ex) { const entry = { id: 'a'+Date.now()+Math.random().toString(36).slice(2), staffId: row.matchedId, staffName: sf.first+' '+sf.last, market: sf.market, dept: sf.dept, date: row.date, clockIn: row.time, clockOut: '', device: btDev, late: false, duration: null }; dispatch({ type: 'ADD_ATTENDANCE', payload: entry }); n++; }
    });
    dispatch({ type: 'AUDIT_LOG', payload: { action: 'BT_SYNC', detail: 'BT: '+n+' records' } });
    setBtPreview([]); setBtFile(null);
    alert('Bantech Sync: '+n+' records');
  }
  return (
    <div style={{ background: "var(--surface)", borderRadius: "var(--r)", padding: 20, border: "1.5px solid var(--border)", boxShadow: "var(--shadow)" }}>
      <div style={{ marginBottom: 14, fontWeight: 700, fontSize: 15 }}>Import Biometric Logs</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setBio("zk")} style={{ flex: 1, padding: "10px", borderRadius: "var(--r-sm)", border: bio === "zk" ? "2px solid var(--blue)" : "1.5px solid var(--border)", background: bio === "zk" ? "var(--surface3)" : "var(--surface)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13, color: bio === "zk" ? "var(--blue)" : "var(--text2)" }}>ZKTeco AL325</button>
        <button onClick={() => setBio("bt")} style={{ flex: 1, padding: "10px", borderRadius: "var(--r-sm)", border: bio === "bt" ? "2px solid var(--orange)" : "1.5px solid var(--border)", background: bio === "bt" ? "rgba(220,100,0,.06)" : "var(--surface)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13, color: bio === "bt" ? "var(--orange)" : "var(--text2)" }}>Bantech AL321</button>
      </div>
      {bio === 'zk' ? (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", display: "block", marginBottom: 4 }}>DEVICE NAME</label><input value={zkDev} onChange={e => setZkDev(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--r-sm)", border: "1.5px solid var(--border)", fontFamily: "inherit", fontSize: 13 }} /></div>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", display: "block", marginBottom: 4 }}>MARKET</label><select value={zkMkt} onChange={e => setZkMkt(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--r-sm)", border: "1.5px solid var(--border)", fontFamily: "inherit", fontSize: 13 }}><option value="">Auto-detect</option>{markets.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}</select></div>
          </div>
          <label style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px", border: "2px dashed var(--border)", borderRadius: "var(--r-sm)", cursor: "pointer", background: "var(--surface2)", marginBottom: 12 }}>
            <span style={{ fontSize: 24, marginBottom: 8 }}>📂</span>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{zkFile ? zkFile.name : "Click to select AL325 CSV"}</span>
            <input type="file" accept=".csv" onChange={onZKChange} style={{ display: "none" }} />
          </label>
          {zkPreview.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 6 }}>Preview: {zkPreview.length} records — {zkPreview.filter(r => r.ammlId).length} matched, {zkPreview.filter(r => !r.ammlId).length} unmapped</div>
              <div style={{ maxHeight: 160, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead><tr style={{ background: "var(--surface2)" }}><th style={{ padding: "6px 8px", textAlign: "left" }}>ZK ID</th><th style={{ padding: "6px 8px", textAlign: "left" }}>Staff</th><th style={{ padding: "6px 8px", textAlign: "left" }}>Date</th><th style={{ padding: "6px 8px", textAlign: "left" }}>Time</th><th style={{ padding: "6px 8px", textAlign: "left" }}>In/Out</th></tr></thead>
                  <tbody>{zkPreview.slice(0, 8).map((r, i) => { const sf = staff.find(s => s.id === r.ammlId); return <tr key={i} style={{ borderTop: "1px solid var(--border)" }}><td style={{ padding: "5px 8px", fontFamily: "monospace" }}>{r.zkId}</td><td style={{ padding: "5px 8px" }}>{sf ? sf.first+" "+sf.last : <span style={{ color: "var(--orange)" }}>unmapped</span>}</td><td style={{ padding: "5px 8px" }}>{r.date}</td><td style={{ padding: "5px 8px" }}>{r.time}</td><td style={{ padding: "5px 8px" }}><span style={{ color: r.inOut === "In" ? "var(--green-logo)" : "var(--blue)", fontWeight: 700 }}>{r.inOut}</span></td></tr>})}</tbody>
                </table>
              </div>
              <button onClick={syncZK} style={{ marginTop: 8, padding: "9px 20px", borderRadius: "var(--r-sm)", border: "none", background: "var(--blue)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Sync {zkPreview.length} ZK Records</button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", display: "block", marginBottom: 4 }}>DEVICE NAME</label><input value={btDev} onChange={e => setBtDev(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--r-sm)", border: "1.5px solid var(--border)", fontFamily: "inherit", fontSize: 13 }} /></div>
          <label style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px", border: "2px dashed var(--border)", borderRadius: "var(--r-sm)", cursor: "pointer", background: "var(--surface2)", marginBottom: 12 }}>
            <span style={{ fontSize: 24, marginBottom: 8 }}>📂</span>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{btFile ? btFile.name : "Click to select AL321 CSV"}</span>
            <input type="file" accept=".csv" onChange={onBTChange} style={{ display: "none" }} />
          </label>
          {btPreview.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 6 }}>Preview: {btPreview.length} records — {btPreview.filter(r => r.matchedId).length} matched</div>
              <div style={{ maxHeight: 160, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead><tr style={{ background: "var(--surface2)" }}><th style={{ padding: "6px 8px", textAlign: "left" }}>Name</th><th style={{ padding: "6px 8px", textAlign: "left" }}>Matched</th><th style={{ padding: "6px 8px", textAlign: "left" }}>Date</th><th style={{ padding: "6px 8px", textAlign: "left" }}>Time</th></tr></thead>
                  <tbody>{btPreview.slice(0, 8).map((r, i) => { const sf = staff.find(s => s.id === r.matchedId); return <tr key={i} style={{ borderTop: "1px solid var(--border)" }}><td style={{ padding: "5px 8px" }}>{r.name}</td><td style={{ padding: "5px 8px" }}>{sf ? <span style={{ color: "var(--green-logo)" }}>{sf.first+" "+sf.last}</span> : <span style={{ color: "var(--orange)" }}>unmatched</span>}</td><td style={{ padding: "5px 8px" }}>{r.date}</td><td style={{ padding: "5px 8px" }}>{r.time}</td></tr>})}</tbody>
                </table>
              </div>
              <button onClick={syncBT} style={{ marginTop: 8, padding: "9px 20px", borderRadius: "var(--r-sm)", border: "none", background: "var(--orange)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Sync {btPreview.length} Bantech Records</button>
            </div>
          )}
        </div>
      )}
      <div style={{ marginTop: 14, borderTop: '1.5px solid var(--border)', paddingTop: 14 }}>
        <button onClick={() => setOpen(!open)} style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--border)', background: open ? 'var(--surface3)' : 'var(--surface2)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 12, color: 'var(--text2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🔗 ZK ID → AMML ID Mapping ({entries.length} entries)</span>
          <span>{open ? '▲' : '▼'}</span>
        </button>
        {open && (
          <div style={{ marginTop: 12 }}>
            {entries.length > 0 && (
              <div style={{ marginBottom: 12, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface2)' }}>
                      <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 700, color: 'var(--text3)' }}>ZK ID</th>
                      <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 700, color: 'var(--text3)' }}>AMML ID</th>
                      <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 700, color: 'var(--text3)' }}>Matched Staff</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--text3)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(([zk, amml]) => {
                      const sf = staff.find(s => s.id === amml);
                      return (
                        <tr key={zk} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontWeight: 600 }}>{zk}</td>
                          <td style={{ padding: '6px 10px', fontFamily: 'monospace' }}>{amml}</td>
                          <td style={{ padding: '6px 10px', color: sf ? 'var(--green-logo)' : 'var(--orange)', fontSize: 11 }}>
                            {sf ? `${sf.first} ${sf.last}` : <span style={{ fontStyle: 'italic' }}>unrecognized</span>}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            {editKey === zk ? (
                              <>
                                <input value={editVal} onChange={e => setEditVal(e.target.value.toUpperCase())}
                                  placeholder="AMML-001" maxLength={9}
                                  style={{ padding: '3px 8px', borderRadius: 6, border: '1.5px solid var(--border)', fontFamily: 'monospace', fontSize: 11, width: 100 }} />
                                <button onClick={() => save(zk, editVal)} style={{ padding: '3px 8px', borderRadius: 6, border: 'none', background: 'var(--green-logo)', color: '#fff', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>Save</button>
                                <button onClick={() => { setEditKey(''); setEditVal(''); }} style={{ padding: '3px 8px', borderRadius: 6, border: '1.5px solid var(--border)', background: 'var(--surface2)', fontSize: 11, cursor: 'pointer' }}>✕</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => { setEditKey(zk); setEditVal(amml); }} style={{ padding: '3px 8px', borderRadius: 6, border: '1.5px solid var(--border)', background: 'var(--surface2)', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                                {delConfirm === zk ? (
                                  <>
                                    <button onClick={() => del(zk)} style={{ padding: '3px 8px', borderRadius: 6, border: 'none', background: '#C0392B', color: '#fff', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>Confirm</button>
                                    <button onClick={() => setDelConfirm('')} style={{ padding: '3px 8px', borderRadius: 6, border: '1.5px solid var(--border)', background: 'var(--surface2)', fontSize: 11, cursor: 'pointer' }}>✕</button>
                                  </>
                                ) : (
                                  <button onClick={() => setDelConfirm(zk)} style={{ padding: '3px 8px', borderRadius: 6, border: '1.5px solid #C0392B', background: 'transparent', color: '#C0392B', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>Delete</button>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {/* Add new mapping */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)' }}>Add mapping:</span>
              <input value={addZk} onChange={e => setAddZk(e.target.value)} placeholder="ZK ID (from device)"
                style={{ padding: '5px 10px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--border)', fontFamily: 'monospace', fontSize: 12, width: 140 }} />
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>→</span>
              <input value={addAmml} onChange={e => setAddAmml(e.target.value.toUpperCase())} placeholder="AMML ID"
                maxLength={9} style={{ padding: '5px 10px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--border)', fontFamily: 'monospace', fontSize: 12, width: 120 }} />
              <button onClick={() => { if (addZk.trim() && addAmml.trim()) { save(addZk.trim(), addAmml.trim()); setAddZk(''); setAddAmml(''); } }}
                style={{ padding: '5px 14px', borderRadius: 'var(--r-sm)', border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DevicesPage() {
  const { state, dispatch } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newDev, setNewDev] = useState({ name: "", type: "Realand AL325", serial: "", location: "", market: "" });
  const [mktFilter, setMktFilter] = useState("");
  const { markets, devices, staff, att } = state;
  const today = new Date().toISOString().slice(0, 10);
  const online = devices.filter(d => d.active);
  const filtered = mktFilter ? devices.filter(d => d.market === mktFilter) : devices;
  function addDevice() {
    if (!newDev.name || !newDev.market) { alert("Name and market required"); return; }
    const dev: Device = { id: "d"+Date.now(), ...newDev, active: true, lastSeen: "Just now", clocksToday: 0, type: newDev.type as DeviceType };
    dispatch({ type: 'ADD_DEVICE', payload: dev });
    dispatch({ type: 'AUDIT_LOG', payload: { action: 'ADD_DEVICE', detail: newDev.name } });
    apiAddDevice(dev).catch(() => {});
    setNewDev({ name: "", type: "Realand AL325", serial: "", location: "", market: "" });
    setShowAdd(false);
  }
  function deleteDevice(id: string) {
    dispatch({ type: 'DELETE_DEVICE', payload: id });
    dispatch({ type: 'AUDIT_LOG', payload: { action: 'DELETE_DEVICE', detail: id } });
    apiDeleteDevice(id).catch(() => {});
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Devices</h2>
          <p style={{ fontSize: 12.5, color: "var(--text3)", marginTop: 2 }}>Manage biometric hardware and import attendance logs</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--green-logo)", fontWeight: 700 }}>{online.length} online</span>
          <button onClick={() => setShowAdd(true)} style={{ padding: "8px 16px", borderRadius: "var(--r-sm)", border: "none", background: "var(--blue)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>+ Add Device</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setMktFilter("")} style={{ padding: "6px 14px", borderRadius: 99, border: mktFilter === "" ? "2px solid var(--blue)" : "1.5px solid var(--border)", background: mktFilter === "" ? "var(--surface3)" : "var(--surface)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12, color: "var(--text2)" }}>All Markets</button>
        {markets.map(m => <button key={m.id} onClick={() => setMktFilter(m.name)} style={{ padding: "6px 14px", borderRadius: 99, border: mktFilter === m.name ? "2px solid var(--blue)" : "1.5px solid var(--border)", background: mktFilter === m.name ? "var(--surface3)" : "var(--surface)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12, color: "var(--text2)" }}>{m.name}</button>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {filtered.map(d => <DeviceCard key={d.id} dev={d} onDelete={deleteDevice} />)}
      </div>
      <BiometricImport />
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--surface)", borderRadius: "var(--r-lg)", padding: 28, width: "100%", maxWidth: 440, boxShadow: "var(--shadow-lg)" }}>
            <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 18 }}>Add New Device</h3>
            {[{ label: "Device Name", key: "name", placeholder: "e.g. Main Gate Terminal" }, { label: "Serial Number", key: "serial", placeholder: "SN-XXX" }, { label: "Location", key: "location", placeholder: "e.g. Main Entrance" }].map(fi => (
              <div key={fi.key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", display: "block", marginBottom: 4 }}>{fi.label}</label>
                <input value={(newDev as any)[fi.key]} onChange={e => setNewDev({ ...newDev, [fi.key]: e.target.value })} placeholder={fi.placeholder} style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--r-sm)", border: "1.5px solid var(--border)", fontFamily: "inherit", fontSize: 13 }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", display: "block", marginBottom: 4 }}>DEVICE TYPE</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button onClick={() => setNewDev({ ...newDev, type: "Realand AL325" })} style={{ padding: "8px 6px", borderRadius: "var(--r-sm)", border: newDev.type === "Realand AL325" ? "2px solid var(--blue)" : "1.5px solid var(--border)", background: newDev.type === "Realand AL325" ? "var(--surface3)" : "var(--surface)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 11, color: newDev.type === "Realand AL325" ? "var(--blue)" : "var(--text2)" }}>📶 AL325 WiFi</button>
                <button onClick={() => setNewDev({ ...newDev, type: "Realand AL321" })} style={{ padding: "8px 6px", borderRadius: "var(--r-sm)", border: newDev.type === "Realand AL321" ? "2px solid var(--orange)" : "1.5px solid var(--border)", background: newDev.type === "Realand AL321" ? "rgba(220,100,0,.06)" : "var(--surface)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 11, color: newDev.type === "Realand AL321" ? "var(--orange)" : "var(--text2)" }}>🔌 AL321 Wired</button>
              </div>
              <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text3)", lineHeight: 1.4 }}>
                AL325: WiFi + TCP/IP + USB · AL321: TCP/IP + USB only
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", display: "block", marginBottom: 4 }}>MARKET</label>
              <select value={newDev.market} onChange={e => setNewDev({ ...newDev, market: e.target.value })} style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--r-sm)", border: "1.5px solid var(--border)", fontFamily: "inherit", fontSize: 13 }}><option value="">Select market</option>{markets.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}</select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "10px", borderRadius: "var(--r-sm)", border: "1.5px solid var(--border)", background: "var(--surface2)", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13, color: "var(--text2)" }}>Cancel</button>
              <button onClick={addDevice} style={{ flex: 1, padding: "10px", borderRadius: "var(--r-sm)", border: "none", background: "var(--blue)", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13, color: "#fff" }}>Add Device</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
