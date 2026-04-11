import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ─────────────────────────────────────────────────────────────
//  AMML — Attendance Page
// ─────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
export default function AttendancePage() {
    const { state, dispatch } = useApp();
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().slice(0, 10);
    });
    const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
    const [showClockIn, setShowClockIn] = useState(false);
    const [ciStaffId, setCiStaffId] = useState('');
    const [ciTime, setCiTime] = useState(() => new Date().toISOString().slice(0, 16));
    const today = new Date().toISOString().slice(0, 10);
    // Filter by date range + search
    const filtered = useMemo(() => {
        return state.att
            .filter(r => {
            const inRange = r.date >= dateFrom && r.date <= dateTo;
            const match = !search ||
                r.staffName?.toLowerCase().includes(search.toLowerCase()) ||
                r.staffId?.toLowerCase().includes(search.toLowerCase()) ||
                r.market?.toLowerCase().includes(search.toLowerCase());
            return inRange && match;
        })
            .sort((a, b) => b.date.localeCompare(a.date) || b.clockIn.localeCompare(a.clockIn));
    }, [state.att, dateFrom, dateTo, search]);
    // Summary stats for the visible range
    const stats = useMemo(() => {
        const total = filtered.length;
        const clockOut = filtered.filter(r => r.clockOut).length;
        const late = filtered.filter(r => r.late).length;
        const activeStaff = state.staff.filter(s => s.active).length;
        return { total, clockOut, late, activeStaff };
    }, [filtered, state.staff]);
    function handleClockIn() {
        if (!ciStaffId.trim())
            return;
        const match = state.staff.find(s => s.id.toLowerCase() === ciStaffId.trim().toLowerCase() ||
            s.id.toLowerCase().startsWith(ciStaffId.trim().toLowerCase()));
        if (!match) {
            alert('Staff ID not found');
            return;
        }
        const todayD = new Date().toISOString().slice(0, 10);
        const [date, HM] = ciTime.split('T');
        const [h, m] = HM.split(':').map(Number);
        const late = h > 8 || (h === 8 && m > 0);
        const id = 'a' + Math.random().toString(36).slice(2, 8);
        dispatch({
            type: 'ADD_ATTENDANCE',
            payload: {
                id, staffId: match.id, staffName: `${match.first} ${match.last}`,
                market: match.market, dept: match.dept, date,
                clockIn: HM + ':00', clockOut: '', device: 'Manual', late, duration: null,
            },
        });
        dispatch({ type: 'AUDIT_LOG', payload: { action: 'CLOCK_IN', detail: `${match.first} ${match.last} clocked in at ${HM}` } });
        setShowClockIn(false);
        setCiStaffId('');
    }
    function handleClockOut() {
        if (!ciStaffId.trim())
            return;
        const match = state.staff.find(s => s.id.toLowerCase() === ciStaffId.trim().toLowerCase());
        if (!match) {
            alert('Staff ID not found');
            return;
        }
        const [date, HM] = ciTime.split('T');
        const rec = state.att.find(r => r.staffId === match.id && r.date === date && !r.clockOut);
        if (rec) {
            dispatch({
                type: 'UPDATE_ATT',
                payload: { ...rec, clockOut: HM + ':00' },
            });
            dispatch({ type: 'AUDIT_LOG', payload: { action: 'CLOCK_OUT', detail: `${match.first} ${match.last} clocked out at ${HM}` } });
        }
        else {
            alert('No open clock-in record found for today');
            return;
        }
        setShowClockIn(false);
        setCiStaffId('');
    }
    return (_jsxs("div", { className: "page active", children: [_jsxs("div", { className: "ph", children: [_jsxs("div", { className: "ph-l", children: [_jsx("h2", { children: "\uD83D\uDD50 Attendance" }), _jsxs("p", { children: [stats.total, " records \u00B7 ", stats.clockOut, " clocked out \u00B7 ", stats.late, " late"] })] }), _jsx("div", { className: "ph-r", children: _jsx("button", { className: "btn btn-green", onClick: () => setShowClockIn(v => !v), children: showClockIn ? '✕ Cancel' : '🕐 Manual Clock' }) })] }), showClockIn && (_jsxs("div", { className: "card", style: { border: '1.5px solid var(--green-logo)' }, children: [_jsx("div", { className: "card-head", children: _jsx("div", { className: "card-title", children: "\uD83D\uDD50 Manual Clock-In / Clock-Out" }) }), _jsxs("div", { className: "mf", style: { alignItems: 'flex-end', flexWrap: 'wrap' }, children: [_jsxs("div", { className: "fg", children: [_jsx("label", { children: "Staff ID" }), _jsx("input", { type: "text", placeholder: "AMML-001", value: ciStaffId, onChange: e => setCiStaffId(e.target.value) })] }), _jsxs("div", { className: "fg", children: [_jsx("label", { children: "Date & Time" }), _jsx("input", { type: "datetime-local", value: ciTime, onChange: e => setCiTime(e.target.value) })] }), _jsxs("div", { className: "fg", style: { flex: 'none' }, children: [_jsx("label", { children: "\u00A0" }), _jsx("button", { className: "btn btn-green", onClick: handleClockIn, children: "\u2705 Clock In" })] }), _jsxs("div", { className: "fg", style: { flex: 'none' }, children: [_jsx("label", { children: "\u00A0" }), _jsx("button", { className: "btn btn-orange", onClick: handleClockOut, children: "\uD83D\uDEAA Clock Out" })] })] }), _jsx("p", { style: { fontSize: 12, color: 'var(--text3)', marginTop: 8 }, children: "Use to record attendance for staff who forgot to badge. Requires a Supervisor or higher role." })] })), _jsx("div", { className: "card", children: _jsxs("div", { style: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }, children: [_jsxs("div", { className: "fg", children: [_jsx("label", { children: "From" }), _jsx("input", { type: "date", value: dateFrom, onChange: e => setDateFrom(e.target.value) })] }), _jsxs("div", { className: "fg", children: [_jsx("label", { children: "To" }), _jsx("input", { type: "date", value: dateTo, onChange: e => setDateTo(e.target.value) })] }), _jsxs("div", { className: "fg", style: { flex: 1 }, children: [_jsx("label", { children: "Search" }), _jsx("input", { type: "search", placeholder: "Staff name, ID, or market\u2026", value: search, onChange: e => setSearch(e.target.value) })] }), _jsx("button", { className: "btn btn-outline btn-sm", onClick: () => { setDateFrom(today); setDateTo(today); setSearch(''); }, children: "Today" })] }) }), filtered.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "es-icon", children: "\uD83D\uDD50" }), _jsx("div", { className: "es-title", children: "No records found" }), _jsx("p", { children: "Try adjusting the date range or search." })] })) : (_jsx("div", { className: "card", style: { padding: 0, overflow: 'auto' }, children: _jsxs("table", { className: "tbl", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Staff" }), _jsx("th", { children: "Market" }), _jsx("th", { children: "Date" }), _jsx("th", { children: "Clock In" }), _jsx("th", { children: "Clock Out" }), _jsx("th", { children: "Duration" }), _jsx("th", { children: "Status" })] }) }), _jsx("tbody", { children: filtered.map(r => (_jsxs("tr", { children: [_jsxs("td", { children: [_jsx("div", { style: { fontWeight: 700 }, children: r.staffName }), _jsx("div", { style: { fontSize: 11, color: 'var(--text3)' }, children: r.staffId })] }), _jsx("td", { style: { fontSize: 12 }, children: r.market }), _jsx("td", { style: { fontSize: 12 }, children: r.date }), _jsx("td", { children: r.clockIn?.slice(0, 5) || '—' }), _jsx("td", { children: r.clockOut?.slice(0, 5) || _jsx("span", { style: { color: 'var(--text3)', fontSize: 12 }, children: "\u2014" }) }), _jsx("td", { style: { fontSize: 12, color: 'var(--text2)' }, children: r.duration || '—' }), _jsx("td", { children: r.late
                                            ? _jsx("span", { className: "badge b-orange", children: "\u26A0\uFE0F Late" })
                                            : r.clockIn
                                                ? _jsx("span", { className: "badge b-green", children: "\u2705 On Time" })
                                                : _jsx("span", { className: "badge b-navy", children: "\u2014" }) })] }, r.id))) })] }) }))] }));
}
