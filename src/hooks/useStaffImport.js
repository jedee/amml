// ─────────────────────────────────────────────────────────────
//  useStaffImport — Excel/CSV staff import hook
//  Reads: AMML ID | First | Last | Department | Market | Phone | Role | Salary | AuthLevel
// ─────────────────────────────────────────────────────────────
import { useState, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
const AUTH_OPTIONS = ['SUPERADMIN', 'MD', 'MANAGER', 'SUPERVISOR', 'OFFICER'];
export function useStaffImport() {
    const { state, dispatch } = useApp();
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');
    const readFile = useCallback((file) => {
        setError('');
        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
        if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
            setError('Supported formats: .xlsx, .xls, .csv');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result);
                parse(data, ext).then((rows) => {
                    if (!rows.length) {
                        setError('No data found in file.');
                        return;
                    }
                    setPreview(rows);
                });
            }
            catch {
                setError('Failed to read file.');
            }
        };
        if (ext === 'csv')
            reader.readAsText(file);
        else
            reader.readAsArrayBuffer(file);
    }, []);
    const parse = async (data, ext) => {
        const XLSX = (await import('xlsx')).default;
        let raw = [];
        if (ext === 'csv') {
            const text = new TextDecoder().decode(data);
            const lines = text.trim().split(/\r?\n/);
            if (!lines.length)
                return [];
            const sep = lines[0].includes(',') ? ',' : '\t';
            const headers = lines[0].split(sep).map((h) => h.trim().replace(/["']/g, ''));
            raw = lines.slice(1).map(l => {
                const vals = l.split(sep).map((v) => v.trim().replace(/["']/g, ''));
                const obj = {};
                headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
                return obj;
            });
        }
        else {
            const wb = XLSX.read(data, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            raw = XLSX.utils.sheet_to_json(ws, { raw: false, defval: '' });
        }
        const get = (r, keys, allKeys) => {
            for (const n of keys) {
                const k = allKeys.find(k => k.toLowerCase().replace(/[\s._-]/g, '') === n.toLowerCase().replace(/[\s._-]/g, ''));
                if (k !== undefined)
                    return (r[k] ?? '').toString().trim();
            }
            return '';
        };
        return raw.map(r => {
            const allKeys = Object.keys(r);
            const id = (get(r, ['ammlid', 'id', 'staffid', 'employeeid'], allKeys) || '').toUpperCase().replace(/\s+/g, '');
            const first = get(r, ['first', 'firstname', 'first_name', 'givenname'], allKeys) || '';
            const last = get(r, ['last', 'lastname', 'last_name', 'surname', 'familyname'], allKeys) || '';
            const dept = get(r, ['department', 'dept', 'division'], allKeys) || '';
            const market = get(r, ['market', 'location', 'station', 'marketname'], allKeys) || '';
            const phone = get(r, ['phone', 'telephone', 'mobile', 'contact'], allKeys).replace(/\D/g, '');
            const role = get(r, ['jobrole', 'role', 'position', 'title', 'designation'], allKeys) || '';
            const salary = parseFloat(get(r, ['salary', 'amount', 'pay', 'remuneration'], allKeys) || '0') || 0;
            const rawAuth = get(r, ['authlevel', 'level', 'accesslevel', 'authorization'], allKeys).toLowerCase().replace(/[\s._-]/g, '');
            const authLevel = AUTH_OPTIONS.find(a => a.toLowerCase() === rawAuth || rawAuth.includes(a.toLowerCase())) ?? 'OFFICER';
            if (!id && !first && !last)
                return null;
            return { id, first, last, dept, market, phone, role, salary, authLevel };
        }).filter(Boolean);
    };
    const confirmImport = useCallback(() => {
        if (!preview?.length)
            return;
        let added = 0, updated = 0;
        preview.forEach(s => {
            const existing = state.staff.find(x => x.id === s.id);
            if (existing) {
                dispatch({ type: 'UPDATE_STAFF', payload: { ...existing, ...s } });
                updated++;
            }
            else {
                dispatch({ type: 'ADD_STAFF', payload: { ...s, active: true } });
                added++;
            }
        });
        dispatch({ type: 'AUDIT_LOG', payload: { action: 'IMPORT', detail: `Staff Excel: ${added} added, ${updated} updated` } });
        setPreview(null);
        return { added, updated };
    }, [preview, state.staff, dispatch]);
    const cancelImport = useCallback(() => setPreview(null), []);
    return { readFile, preview, error, confirmImport, cancelImport };
}
