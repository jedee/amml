import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ─────────────────────────────────────────────────────────────
//  AMML — Users Management Page  (Super Admin & MD only)
// ─────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { ROLE_CONFIG } from '../data/roles';
export default function UsersPage() {
    const { state, dispatch, can, authLevels, levelLabels, currentRole } = useApp();
    const [search, setSearch] = useState('');
    const [filterLevel, setFilterLevel] = useState('ALL');
    const [editingId, setEditingId] = useState(null);
    const [editLevel, setEditLevel] = useState('OFFICER');
    const [showAdd, setShowAdd] = useState(false);
    const [addId, setAddId] = useState('');
    const [addLevel, setAddLevel] = useState('OFFICER');
    const [addError, setAddError] = useState('');
    // Build user list from staff records
    const allUsers = useMemo(() => {
        return state.staff.map(s => ({
            id: s.id,
            name: `${s.first} ${s.last}`,
            staffId: s.id,
            authLevel: s.authLevel,
            market: s.market,
            dept: s.dept,
            active: true,
        }));
    }, [state.staff]);
    const filtered = useMemo(() => {
        return allUsers.filter(u => {
            const matchSearch = search === '' ||
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.id.toLowerCase().includes(search.toLowerCase()) ||
                u.market.toLowerCase().includes(search.toLowerCase());
            const matchLevel = filterLevel === 'ALL' || u.authLevel === filterLevel;
            return matchSearch && matchLevel;
        });
    }, [allUsers, search, filterLevel]);
    const handleSaveEdit = (staffId) => {
        dispatch({ type: 'UPDATE_STAFF_AUTH', payload: { staffId, authLevel: editLevel } });
        dispatch({ type: 'AUDIT_LOG', payload: { action: 'UPDATE_USER_ROLE', detail: `Changed ${staffId} to ${editLevel}` } });
        setEditingId(null);
    };
    const handleAddUser = () => {
        if (!addId.trim()) {
            setAddError('Enter a Staff ID.');
            return;
        }
        const match = state.staff.find(s => s.id.toLowerCase() === addId.trim().toLowerCase());
        if (!match) {
            setAddError('Staff ID not found.');
            return;
        }
        dispatch({ type: 'UPDATE_STAFF_AUTH', payload: { staffId: match.id, authLevel: addLevel } });
        dispatch({ type: 'AUDIT_LOG', payload: { action: 'ADD_USER', detail: `Added ${match.id} as ${addLevel}` } });
        setAddId('');
        setAddLevel('OFFICER');
        setAddError('');
        setShowAdd(false);
    };
    const levelBadge = (level) => {
        const cfg = ROLE_CONFIG[level];
        return (_jsx("span", { style: {
                padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 800,
                background: cfg.color + '22', color: cfg.color, letterSpacing: '.04em',
            }, children: cfg.label }));
    };
    return (_jsxs("div", { className: "page-header", children: [_jsxs("div", { children: [_jsx("h2", { children: "\uD83D\uDC51 User Management" }), _jsx("p", { style: { color: 'var(--text2)', fontSize: 13 }, children: "Assign and manage auth levels for registered staff" })] }), _jsx("div", { style: { display: 'flex', gap: 10 }, children: _jsx("button", { className: "btn btn-blue", onClick: () => setShowAdd(s => !s), children: "+ Assign Role" }) }), showAdd && (_jsxs("div", { style: {
                    background: 'var(--surface)', border: '1.5px solid var(--border)',
                    borderRadius: 'var(--r)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
                }, children: [_jsx("div", { style: { fontWeight: 700, fontSize: 14 }, children: "Assign Role to Staff Member" }), _jsxs("div", { style: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 6 }, children: [_jsx("label", { style: { fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.05em' }, children: "Staff ID" }), _jsx("input", { type: "text", value: addId, onChange: e => { setAddId(e.target.value); setAddError(''); }, placeholder: "AMML-001", style: { padding: '9px 14px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--border)', fontFamily: 'inherit', fontSize: 13, background: 'var(--surface2)', minWidth: 160 } })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 6 }, children: [_jsx("label", { style: { fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.05em' }, children: "Auth Level" }), _jsx("select", { value: addLevel, onChange: e => setAddLevel(e.target.value), style: { padding: '9px 14px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--border)', fontFamily: 'inherit', fontSize: 13, background: 'var(--surface2)', minWidth: 200 }, children: authLevels.map(l => (_jsx("option", { value: l, children: levelLabels[l] }, l))) })] }), _jsx("button", { className: "btn btn-blue", onClick: handleAddUser, children: "Assign" }), _jsx("button", { className: "btn btn-outline", onClick: () => { setShowAdd(false); setAddError(''); }, children: "Cancel" })] }), addError && _jsxs("div", { style: { color: '#e74c3c', fontSize: 12 }, children: ["\u26A0\uFE0F ", addError] }), _jsxs("div", { style: { fontSize: 11.5, color: 'var(--text3)' }, children: ["Available staff IDs: ", state.staff.slice(0, 8).map(s => s.id).join(', '), "\u2026"] })] })), _jsxs("div", { style: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }, children: [_jsx("input", { type: "text", placeholder: "Search by name, ID or market\u2026", value: search, onChange: e => setSearch(e.target.value), style: { padding: '9px 14px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--border)', fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', minWidth: 240, flex: 1 } }), _jsxs("select", { value: filterLevel, onChange: e => setFilterLevel(e.target.value), style: { padding: '9px 14px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--border)', fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)' }, children: [_jsx("option", { value: "ALL", children: "All Levels" }), authLevels.map(l => _jsx("option", { value: l, children: ROLE_CONFIG[l].label }, l))] }), _jsxs("span", { style: { fontSize: 12, color: 'var(--text3)', marginLeft: 'auto' }, children: [filtered.length, " user", filtered.length !== 1 ? 's' : ''] })] }), _jsx("div", { style: { background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--border)', overflow: 'hidden' }, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsx("tr", { style: { background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }, children: ['Staff ID', 'Name', 'Department', 'Market', 'Auth Level', 'Last Login', 'Action'].map(h => (_jsx("th", { style: { padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.07em' }, children: h }, h))) }) }), _jsxs("tbody", { children: [filtered.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 7, style: { padding: 32, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }, children: "No users match your filters." }) })), filtered.map((u, i) => (_jsxs("tr", { style: { borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }, children: [_jsx("td", { style: { padding: '12px 16px' }, children: _jsx("span", { style: { fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'var(--blue)' }, children: u.id }) }), _jsx("td", { style: { padding: '12px 16px', fontWeight: 600, fontSize: 13 }, children: u.name }), _jsx("td", { style: { padding: '12px 16px', fontSize: 12, color: 'var(--text2)' }, children: u.dept }), _jsx("td", { style: { padding: '12px 16px', fontSize: 12, color: 'var(--text2)' }, children: u.market }), _jsx("td", { style: { padding: '12px 16px' }, children: editingId === u.id ? (_jsx("select", { value: editLevel, onChange: e => setEditLevel(e.target.value), style: { padding: '5px 10px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--blue)', fontFamily: 'inherit', fontSize: 12, background: 'var(--surface)' }, children: authLevels.map(l => _jsx("option", { value: l, children: ROLE_CONFIG[l].label }, l)) })) : levelBadge(u.authLevel) }), _jsx("td", { style: { padding: '12px 16px', fontSize: 12, color: 'var(--text3)' }, children: "\u2014" }), _jsx("td", { style: { padding: '12px 16px' }, children: editingId === u.id ? (_jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { className: "btn btn-blue", style: { padding: '5px 12px', fontSize: 12 }, onClick: () => handleSaveEdit(u.id), children: "Save" }), _jsx("button", { className: "btn btn-outline", style: { padding: '5px 12px', fontSize: 12 }, onClick: () => setEditingId(null), children: "Cancel" })] })) : (_jsx("button", { className: "btn btn-outline", style: { padding: '5px 12px', fontSize: 12 }, onClick: () => { setEditingId(u.id); setEditLevel(u.authLevel); }, children: "Edit Role" })) })] }, u.id)))] })] }) }), _jsx("div", { style: { display: 'flex', gap: 16, flexWrap: 'wrap' }, children: authLevels.map(l => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 6 }, children: [levelBadge(l), _jsx("span", { style: { fontSize: 11.5, color: 'var(--text3)' }, children: l })] }, l))) })] }));
}
