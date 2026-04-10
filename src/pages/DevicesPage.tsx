// ────────────────────────────────────────────────
//  AMML — Device Management Page
//  AL325 (ZKTeco) + AL321 (Bantech) biometric import
// ────────────────────────────────────────────────
import type { Device, DeviceType } from "../types/models";
import { useApp } from "../contexts/AppContext";
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
    let ds = (v[di >= 0 ? di : 0] || '').split(' ')[0].replace(/\//g,'-');
    if (/^\d{2}-\d{2}-\d{4}$/.test(ds)) { const [d,m,y] = ds.split('-'); ds = y+'-'+m+'-'+d; }
    const sv = (v[si >= 0 ? si : 2] || '').toLowerCase();
    return { zkId: v[zi >= 0 ? zi : 0] || '', date: ds, time: v[ti >= 0 ? ti : 1] || '', inOut: (sv.includes('out') || sv === '1') ? 'Out' as const : 'In' as const } as ZKRec;
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

function DeviceCard({ dev, onDelete }: { dev: Device; onDelete: (id: string) => void }) {
  const { dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  function toggle() {
    dispatch({ type: 'UPDATE_DEVICE', payload: { ...dev, active: !dev.active, lastSeen: !dev.active ? 'Just now' : dev.lastSeen } });
    dispatch({ type: 'AUDIT_LOG', payload: { action: 'TOGGLE_DEVICE', detail: dev.name + ' ' + (!dev.active ? 'online' : 'offline') } });
    setOpen(false);
  }
  return (
    <div style={{ background: "var(--surface)", borderRadius: "var(--r)", padding: 18, border: "1.5px solid var(--border)", boxShadow: "var(--shadow)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "14px 0", fontSize: 12 }}>
        <div style={{ padding: "8px 10px", background: "var(--surface2)", borderRadius: 8 }}><div style={{ color: "var(--text3)", fontSize: 10, fontWeight: 700 }}>TYPE</div><div style={{ fontWeight: 600, marginTop: 2 }}>{dev.type}</div></div>
        <div style={{ padding: "8px 10px", background: "var(--surface2)", borderRadius: 8 }}><div style={{ color: "var(--text3)", fontSize: 10, fontWeight: 700 }}>LOCATION</div><div style={{ fontWeight: 600, marginTop: 2 }}>{dev.location}</div></div>
        <div style={{ padding: "8px 10px", background: "var(--surface2)", borderRadius: 8 }}><div style={{ color: "var(--text3)", fontSize: 10, fontWeight: 700 }}>SERIAL</div><div style={{ fontWeight: 600, marginTop: 2, fontFamily: "monospace", fontSize: 11 }}>{dev.serial}</div></div>
        <div style={{ padding: "8px 10px", background: "var(--surface2)", borderRadius: 8 }}><div style={{ color: "var(--text3)", fontSize: 10, fontWeight: 700 }}>TODAY</div><div style={{ fontWeight: 600, marginTop: 2 }}>{dev.clocksToday} clocks</div></div>
      </div>
      <button onClick={() => setOpen(!open)} style={{ marginTop: 4, width: "100%", padding: "7px", borderRadius: "var(--r-sm)", border: "1.5px solid var(--border)", background: "var(--surface2)", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit", color: "var(--text2)" }}>{open ? "▲ Hide Actions" : "▼ Actions"}</button>
      {open && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          <button onClick={toggle} style={{ padding: "8px 12px", borderRadius: "var(--r-sm)", border: "none", background: dev.active ? "#C0392B" : "var(--green-logo)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{dev.active ? "Deactivate" : "Activate"}</button>
          {confirm ? (
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => { onDelete(dev.id); setConfirm(false); }} style={{ flex: 1, padding: "7px", borderRadius: "var(--r-sm)", border: "none", background: "#C0392B", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Confirm</button>
              <button onClick={() => setConfirm(false)} style={{ flex: 1, padding: "7px", borderRadius: "var(--r-sm)", border: "1.5px solid var(--border)", background: "var(--surface2)", color: "var(--text2)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setConfirm(true)} style={{ padding: "8px 12px", borderRadius: "var(--r-sm)", border: "1.5px solid #C0392B", background: "transparent", color: "#C0392B", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Delete Device</button>
          )}
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
  const [zkDev, setZkDev] = useState('ZKTeco AL325');
  const [zkMkt, setZkMkt] = useState('');
  const [zkMap, setZkMap] = useState<Record<string,string>>({});
  const [btFile, setBtFile] = useState<File|null>(null);
  const [btPreview, setBtPreview] = useState<BTRec[]>([]);
  const [btDev, setBtDev] = useState('Bantech AL321');
  const { markets, staff, att } = state;
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
          <label style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px", border: "2px dashed var(--border)", borderRadius: "var(--r)", cursor: "pointer", marginBottom: 12, background: "var(--surface2)" }}>
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
          <label style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px", border: "2px dashed var(--border)", borderRadius: "var(--r)", cursor: "pointer", marginBottom: 12, background: "var(--surface2)" }}>
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
    </div>
  );
}

export default function DevicesPage() {
  const { state, dispatch } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newDev, setNewDev] = useState({ name: "", type: "ZKTeco AL325", serial: "", location: "", market: "" });
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
    setNewDev({ name: "", type: "ZKTeco AL325", serial: "", location: "", market: "" });
    setShowAdd(false);
  }
  function deleteDevice(id: string) {
    dispatch({ type: 'DELETE_DEVICE', payload: id });
    dispatch({ type: 'AUDIT_LOG', payload: { action: 'DELETE_DEVICE', detail: id } });
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
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", display: "block", marginBottom: 4 }}>TYPE</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setNewDev({ ...newDev, type: "ZKTeco AL325" })} style={{ flex: 1, padding: "8px", borderRadius: "var(--r-sm)", border: newDev.type === "ZKTeco AL325" ? "2px solid var(--blue)" : "1.5px solid var(--border)", background: newDev.type === "ZKTeco AL325" ? "var(--surface3)" : "var(--surface)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12, color: newDev.type === "ZKTeco AL325" ? "var(--blue)" : "var(--text2)" }}>ZKTeco AL325</button>
                <button onClick={() => setNewDev({ ...newDev, type: "Bantech AL321" })} style={{ flex: 1, padding: "8px", borderRadius: "var(--r-sm)", border: newDev.type === "Bantech AL321" ? "2px solid var(--orange)" : "1.5px solid var(--border)", background: newDev.type === "Bantech AL321" ? "rgba(220,100,0,.06)" : "var(--surface)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12, color: newDev.type === "Bantech AL321" ? "var(--orange)" : "var(--text2)" }}>Bantech AL321</button>
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
