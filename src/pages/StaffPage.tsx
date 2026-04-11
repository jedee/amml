// ─────────────────────────────────────────────────────────────
//  AMML — Staff Management Page
//  Shows all staff + Excel nominal roll import
// ─────────────────────────────────────────────────────────────
import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { useStaffImport } from '../hooks/useStaffImport';
import type { AuthLevel, Staff } from '../types/models';

// ── Add-Staff Modal ─────────────────────────────────────────
interface StaffFormData {
  id: string;
  first: string;
  last: string;
  dept: string;
  market: string;
  phone: string;
  role: string;
  salary: string;
  authLevel: AuthLevel;
  active: boolean;
}

const DEPT_OPTIONS = ['Administration', 'Finance', 'Market Operations', 'Security', 'Cleaning'];
const AUTH_OPTIONS: AuthLevel[] = ['SUPERADMIN', 'MD', 'MANAGER', 'SUPERVISOR', 'OFFICER'];

function AddStaffModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useApp();

  const [form, setForm] = useState<StaffFormData>({
    id: '',
    first: '',
    last: '',
    dept: '',
    market: '',
    phone: '',
    role: '',
    salary: '',
    authLevel: 'OFFICER',
    active: true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof StaffFormData, string>>>({});

  const set = (field: keyof StaffFormData, value: string | boolean) =>
    setForm(f => ({ ...f, [field]: value }));

  const validate = (): boolean => {
    const errs: typeof errors = {};
    const idRaw = form.id.trim().toUpperCase().replace(/\s+/g, '');
    if (!idRaw) errs.id = 'AMML ID is required';
    else if (!/^AMML-\d{3}$/.test(idRaw)) errs.id = 'Format must be AMML-001';
    else if (state.staff.some(s => s.id === idRaw)) errs.id = 'This ID already exists';
    if (!form.first.trim()) errs.first = 'Required';
    if (!form.last.trim()) errs.last = 'Required';
    if (!form.dept) errs.dept = 'Required';
    if (!form.market) errs.market = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const id = form.id.trim().toUpperCase().replace(/\s+/g, '');
    const staff: Staff = {
      id,
      first: form.first.trim(),
      last: form.last.trim(),
      dept: form.dept,
      market: form.market,
      phone: form.phone.replace(/\D/g, ''),
      role: form.role.trim(),
      salary: form.salary ? parseFloat(form.salary) : 0,
      authLevel: form.authLevel,
      active: form.active,
    };
    dispatch({ type: 'ADD_STAFF', payload: staff });
    dispatch({ type: 'AUDIT_LOG', payload: { action: 'CREATE', detail: `Staff ${id} (${staff.first} ${staff.last}) enrolled manually` } });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,.45)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
        width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 60px rgba(0,0,0,.3)',
      }}>
        {/* Modal Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>👤 Add New Staff</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Manually enroll a single staff member</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text3)', padding: 4, lineHeight: 1 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* ID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>AMML ID *</label>
                <input className="search-input" value={form.id} onChange={e => set('id', e.target.value.toUpperCase())}
                  placeholder="AMML-001" maxLength={9}
                  style={{ fontFamily: 'monospace', fontSize: 13, padding: '7px 10px' }} />
                {errors.id && <span style={{ fontSize: 11, color: '#C0392B', marginTop: 3, display: 'block' }}>{errors.id}</span>}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Auth Level *</label>
                <select className="search-input" value={form.authLevel} onChange={e => set('authLevel', e.target.value as AuthLevel)}
                  style={{ padding: '7px 10px', cursor: 'pointer' }}>
                  {AUTH_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            {/* Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>First Name *</label>
                <input className="search-input" value={form.first} onChange={e => set('first', e.target.value)}
                  placeholder="Chibuzor" style={{ padding: '7px 10px' }} />
                {errors.first && <span style={{ fontSize: 11, color: '#C0392B', marginTop: 3, display: 'block' }}>{errors.first}</span>}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Last Name *</label>
                <input className="search-input" value={form.last} onChange={e => set('last', e.target.value)}
                  placeholder="Udekwu" style={{ padding: '7px 10px' }} />
                {errors.last && <span style={{ fontSize: 11, color: '#C0392B', marginTop: 3, display: 'block' }}>{errors.last}</span>}
              </div>
            </div>

            {/* Dept + Market */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Department *</label>
                <select className="search-input" value={form.dept} onChange={e => set('dept', e.target.value)}
                  style={{ padding: '7px 10px', cursor: 'pointer' }}>
                  <option value="">Select department</option>
                  {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.dept && <span style={{ fontSize: 11, color: '#C0392B', marginTop: 3, display: 'block' }}>{errors.dept}</span>}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Market *</label>
                <select className="search-input" value={form.market} onChange={e => set('market', e.target.value)}
                  style={{ padding: '7px 10px', cursor: 'pointer' }}>
                  <option value="">Select market</option>
                  {state.markets.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
                {errors.market && <span style={{ fontSize: 11, color: '#C0392B', marginTop: 3, display: 'block' }}>{errors.market}</span>}
              </div>
            </div>

            {/* Role + Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Role / Title</label>
                <input className="search-input" value={form.role} onChange={e => set('role', e.target.value)}
                  placeholder="Market Officer" style={{ padding: '7px 10px' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Phone</label>
                <input className="search-input" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="08034561234" style={{ padding: '7px 10px', fontFamily: 'monospace' }} />
              </div>
            </div>

            {/* Salary */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Monthly Salary (₦)</label>
              <input className="search-input" type="number" value={form.salary} onChange={e => set('salary', e.target.value)}
                placeholder="85000" min="0" step="1000" style={{ padding: '7px 10px', fontFamily: 'monospace' }} />
            </div>

            {/* Active toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Active</span>
              </label>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>Inactive staff cannot log in</span>
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-blue">✅ Add Staff</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit-Staff Modal ─────────────────────────────────────────
function EditStaffModal({ staff, onClose }: { staff: Staff; onClose: () => void }) {
  const { state, dispatch } = useApp();

  const [form, setForm] = useState<StaffFormData>({
    id: staff.id,
    first: staff.first,
    last: staff.last,
    dept: staff.dept,
    market: staff.market,
    phone: staff.phone,
    role: staff.role,
    salary: staff.salary ? staff.salary.toString() : '',
    authLevel: staff.authLevel,
    active: staff.active,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof StaffFormData, string>>>({});

  const set = (field: keyof StaffFormData, value: string | boolean) =>
    setForm(f => ({ ...f, [field]: value }));

  const validate = (): boolean => {
    const errs: typeof errors = {};
    const idRaw = form.id.trim().toUpperCase().replace(/\s+/g, '');
    if (!idRaw) errs.id = 'AMML ID is required';
    else if (!/^AMML-\d{3}$/.test(idRaw)) errs.id = 'Format must be AMML-001';
    else if (state.staff.some(s => s.id === idRaw && s.id !== staff.id)) errs.id = 'This ID already exists';
    if (!form.first.trim()) errs.first = 'Required';
    if (!form.last.trim()) errs.last = 'Required';
    if (!form.dept) errs.dept = 'Required';
    if (!form.market) errs.market = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const id = form.id.trim().toUpperCase().replace(/\s+/g, '');
    const staff: Staff = {
      id,
      first: form.first.trim(),
      last: form.last.trim(),
      dept: form.dept,
      market: form.market,
      phone: form.phone.replace(/\D/g, ''),
      role: form.role.trim(),
      salary: form.salary ? parseFloat(form.salary) : 0,
      authLevel: form.authLevel,
      active: form.active,
    };
    dispatch({ type: 'UPDATE_STAFF', payload: staff });
    dispatch({ type: 'AUDIT_LOG', payload: { action: 'UPDATE', detail: `Staff ${id} (${staff.first} ${staff.last}) updated` } });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,.45)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
        width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 60px rgba(0,0,0,.3)',
      }}>
        {/* Modal Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>👤 Edit Staff</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Update details for {staff.first} {staff.last}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text3)', padding: 4, lineHeight: 1 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* ID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>AMML ID *</label>
                <input className="search-input" value={form.id} onChange={e => set('id', e.target.value.toUpperCase())}
                  placeholder="AMML-001" maxLength={9}
                  style={{ fontFamily: 'monospace', fontSize: 13, padding: '7px 10px' }} />
                {errors.id && <span style={{ fontSize: 11, color: '#C0392B', marginTop: 3, display: 'block' }}>{errors.id}</span>}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Auth Level *</label>
                <select className="search-input" value={form.authLevel} onChange={e => set('authLevel', e.target.value as AuthLevel)}
                  style={{ padding: '7px 10px', cursor: 'pointer' }}>
                  {AUTH_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            {/* Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>First Name *</label>
                <input className="search-input" value={form.first} onChange={e => set('first', e.target.value)}
                  placeholder="Chibuzor" style={{ padding: '7px 10px' }} />
                {errors.first && <span style={{ fontSize: 11, color: '#C0392B', marginTop: 3, display: 'block' }}>{errors.first}</span>}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Last Name *</label>
                <input className="search-input" value={form.last} onChange={e => set('last', e.target.value)}
                  placeholder="Udekwu" style={{ padding: '7px 10px' }} />
                {errors.last && <span style={{ fontSize: 11, color: '#C0392B', marginTop: 3, display: 'block' }}>{errors.last}</span>}
              </div>
            </div>

            {/* Dept + Market */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Department *</label>
                <select className="search-input" value={form.dept} onChange={e => set('dept', e.target.value)}
                  style={{ padding: '7px 10px', cursor: 'pointer' }}>
                  <option value="">Select department</option>
                  {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.dept && <span style={{ fontSize: 11, color: '#C0392B', marginTop: 3, display: 'block' }}>{errors.dept}</span>}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Market *</label>
                <select className="search-input" value={form.market} onChange={e => set('market', e.target.value)}
                  style={{ padding: '7px 10px', cursor: 'pointer' }}>
                  <option value="">Select market</option>
                  {state.markets.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
                {errors.market && <span style={{ fontSize: 11, color: '#C0392B', marginTop: 3, display: 'block' }}>{errors.market}</span>}
              </div>
            </div>

            {/* Role + Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Role / Title</label>
                <input className="search-input" value={form.role} onChange={e => set('role', e.target.value)}
                  placeholder="Market Officer" style={{ padding: '7px 10px' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Phone</label>
                <input className="search-input" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="08034561234" style={{ padding: '7px 10px', fontFamily: 'monospace' }} />
              </div>
            </div>

            {/* Salary */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Monthly Salary (₦)</label>
              <input className="search-input" type="number" value={form.salary} onChange={e => set('salary', e.target.value)}
                placeholder="85000" min="0" step="1000" style={{ padding: '7px 10px', fontFamily: 'monospace' }} />
            </div>

            {/* Active toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Active</span>
              </label>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>Inactive staff cannot log in</span>
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-blue">✅ Update Staff</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main StaffPage ──────────────────────────────────────────
export default function StaffPage() {
  const { state, dispatch } = useApp();
  const { staff, markets } = state;
  const { readFile, preview, error, confirmImport, cancelImport } = useStaffImport();

  const [search, setSearch] = useState('');
  const [mktFilter, setMktFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'table' | 'import'>('table');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Staff | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string>('');

  const filtered = useMemo(() => {
    return staff.filter(s => {
      const q = search.toLowerCase();
      const match = !q ||
        `${s.first} ${s.last}`.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.dept.toLowerCase().includes(q) ||
        s.market.toLowerCase().includes(q);
      const mkt = !mktFilter || s.market === mktFilter;
      const lvl = !levelFilter || s.authLevel === levelFilter;
      return match && mkt && lvl;
    });
  }, [staff, search, mktFilter, levelFilter]);

  const authBadge = (lvl: string) => {
    const colors: Record<string, string> = {
      SUPERADMIN: 'background:#f3e8ff;color:#4a148c',
      MD: 'background:#dbeafe;color:#003c78',
      MANAGER: 'background:#dbeafe;color:#0064b4',
      SUPERVISOR: 'background:#fff7ed;color:#dc6400',
      OFFICER: 'background:#f0fdf4;color:#288c28',
    };
    return (
      <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: 10, fontWeight: 800, letterSpacing: '.04em', ...Object.fromEntries(colors[lvl]?.split(';').map(s => s.split(':'))) } }>
        {lvl}
      </span>
    );
  };

  const duplicateCount = preview ? preview.filter(p => staff.some(s => s.id === p.id)).length : 0;

  return (
    <div className="page active">
      {/* Page Header */}
      <div className="ph">
        <div className="ph-l">
          <h2>👥 Staff Management</h2>
          <p>{staff.length} registered staff across all markets</p>
        </div>
        <div className="ph-r">
          <button className={`btn btn-sm ${activeTab === 'table' ? 'btn-blue' : 'btn-outline'}`} onClick={() => setActiveTab('table')}>
            📋 All Staff ({staff.length})
          </button>
          <button className={`btn btn-sm ${activeTab === 'import' ? 'btn-blue' : 'btn-outline'}`} onClick={() => setActiveTab('import')}>
            📥 Import Nominal Roll
          </button>
          <button className="btn btn-sm btn-outline" onClick={() => setShowAddModal(true)}>
            📖 Add Staff
          </button>
        </div>
      </div>

      {activeTab === 'import' && (
        <div className="card">
          <div className="card-head">
            <div className="card-title">📥 Import Staff from Excel / CSV</div>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {!preview ? (
              <>
                {/* Upload Area */}
                <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--r)', padding: '36px 24px', textAlign: 'center', background: 'var(--surface2)' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Upload your Nominal Roll</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>
                    Supported: <strong>.xlsx, .xls, .csv</strong>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16, maxWidth: 480, margin: '0 auto 16px' }}>
                    Required columns: <code>AMML ID</code>, <code>First</code>, <code>Last</code>, <code>Department</code>, <code>Market</code>.<br />
                    Optional: <code>Phone</code>, <code>Role</code>, <code>Salary</code>, <code>AuthLevel</code>.<br />
                    AuthLevel accepts: SUPERADMIN, MD, MANAGER, SUPERVISOR, OFFICER.
                  </div>
                  <label className="btn btn-blue" style={{ cursor: 'pointer', display: 'inline-block' }}>
                    Choose File
                    <input type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f); }} />
                  </label>
                  {error && <div style={{ color: '#C0392B', fontSize: 13, marginTop: 10 }}>{error}</div>}
                </div>

                {/* Market summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                  {markets.slice(0, 6).map(m => {
                    const cnt = staff.filter(s => s.market === m.name).length;
                    return (
                      <div key={m.id} style={{ padding: '10px 14px', background: 'var(--surface2)', borderRadius: 'var(--r-sm)', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>{m.name}</span>
                        <span style={{ background: 'var(--blue)', color: '#fff', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>{cnt}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                {/* Preview */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{preview.length} records ready to import</span>
                    {duplicateCount > 0 && (
                      <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--orange)' }}>
                        ⚠️ {duplicateCount} will update existing records
                      </span>
                    )}
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={cancelImport}>✕ Clear Preview</button>
                </div>

                <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)' }}>
                  <table className="tbl" style={{ fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th>AMML ID</th><th>First</th><th>Last</th><th>Department</th><th>Market</th><th>Phone</th><th>Role</th><th>Salary</th><th>Auth Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((s, i) => (
                        <tr key={i} style={{ background: staff.some(x => x.id === s.id) ? 'rgba(220,100,0,.05)' : 'transparent' }}>
                          <td><span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 11 }}>{s.id}</span></td>
                          <td>{s.first}</td>
                          <td>{s.last}</td>
                          <td style={{ color: 'var(--text3)' }}>{s.dept || '—'}</td>
                          <td style={{ color: 'var(--text3)' }}>{s.market || '—'}</td>
                          <td style={{ color: 'var(--text3)', fontFamily: 'monospace', fontSize: 11 }}>{s.phone || '—'}</td>
                          <td style={{ color: 'var(--text3)' }}>{s.role || '—'}</td>
                          <td style={{ fontFamily: 'monospace' }}>{s.salary > 0 ? s.salary.toLocaleString() : '—'}</td>
                          <td>{authBadge(s.authLevel)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {duplicateCount > 0 && (
                  <div style={{ padding: '10px 14px', background: 'rgba(220,100,0,.08)', border: '1px solid rgba(220,100,0,.2)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--orange)' }}>
                    ⚠️ {duplicateCount} staff already exist with matching IDs and will be <strong>updated</strong> with the new data.
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-blue" onClick={confirmImport}>✅ Confirm Import ({preview.length} records)</button>
                  <button className="btn btn-outline" onClick={cancelImport}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'table' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              className="search-input"
              placeholder="Search staff name, ID, department…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: '1', minWidth: 220, padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)', fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', color: 'var(--text)', outline: 'none' }}
            />
            <select value={mktFilter} onChange={e => setMktFilter(e.target.value)}
              style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)', fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', color: 'var(--text)', outline: 'none', cursor: 'pointer', minWidth: 160 }}>
              <option value="">All Markets</option>
              {[...new Set(staff.map(s => s.market))].sort().map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
              style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)', fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', color: 'var(--text)', outline: 'none', cursor: 'pointer', minWidth: 160 }}>
              <option value="">All Levels</option>
              <option>SUPERADMIN</option><option>MD</option><option>MANAGER</option><option>SUPERVISOR</option><option>OFFICER</option>
            </select>
            <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 4 }}>{filtered.length} of {staff.length}</span>
          </div>

          {/* Staff Table */}
          <div className="card" style={{ padding: 0 }}>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="es-icon">👥</div>
                <div className="es-title">No staff found</div>
                <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>AMML ID</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Market</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Salary</th>
                      <th>Auth Level</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr key={s.id}>
                        <td><span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700 }}>{s.id}</span></td>
                        <td style={{ fontWeight: 600 }}>{s.first} {s.last}</td>
                        <td style={{ fontSize: 12, color: 'var(--text3)' }}>{s.dept}</td>
                        <td style={{ fontSize: 12, color: 'var(--text3)' }}>{s.market}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{s.phone || '—'}</td>
                        <td style={{ fontSize: 12, color: 'var(--text3)' }}>{s.role || '—'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.salary > 0 ? `₦${s.salary.toLocaleString()}` : '—'}</td>
                        <td>{authBadge(s.authLevel)}</td>
                        <td>
                          <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                            background: s.active ? 'rgba(40,140,40,.1)' : 'var(--surface3)',
                            color: s.active ? 'var(--green-logo)' : 'var(--text3)',
                          }}>
                            {s.active ? '● Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          {deleteConfirm === s.id ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-sm" style={{ background: '#C0392B', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 700 }}
                                onClick={() => { dispatch({ type: 'DELETE_STAFF', payload: s.id }); dispatch({ type: 'AUDIT_LOG', payload: { action: 'DELETE', detail: `Staff ${s.id} (${s.first} ${s.last}) removed` } }); setDeleteConfirm(''); }}>
                                Confirm
                              </button>
                              <button className="btn btn-sm btn-outline" style={{ padding: '4px 10px', fontSize: 11 }}
                                onClick={() => setDeleteConfirm('')}>Cancel</button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-sm btn-outline" style={{ padding: '4px 10px', fontSize: 11 }}
                                onClick={() => setEditTarget(s)}>Edit</button>
                              <button className="btn btn-sm" style={{ padding: '4px 10px', fontSize: 11, background: 'transparent', color: '#C0392B', border: '1.5px solid #C0392B', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}
                                onClick={() => setDeleteConfirm(s.id)}>Delete</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {showAddModal && <AddStaffModal onClose={() => setShowAddModal(false)} />}
      {editTarget && <EditStaffModal staff={editTarget} onClose={() => setEditTarget(null)} />}
    </div>
  );
}
