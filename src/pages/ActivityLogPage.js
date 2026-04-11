import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ─────────────────────────────────────────────────────────────
//  AMML — Activity Log Page
// ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Download, FileText } from 'lucide-react';
export default function ActivityLogPage() {
    const { state } = useApp();
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const filtered = state.activityLog.filter(log => {
        const matchSearch = search
            ? log.action.toLowerCase().includes(search.toLowerCase()) ||
                log.detail.toLowerCase().includes(search.toLowerCase()) ||
                log.user.toLowerCase().includes(search.toLowerCase())
            : true;
        const matchAction = actionFilter === 'all' || log.action === actionFilter;
        return matchSearch && matchAction;
    });
    const uniqueActions = ['all', ...Array.from(new Set(state.activityLog.map(l => l.action)))];
    const exportCSV = () => {
        const header = 'Timestamp,User,Action,Detail\n';
        const rows = filtered.map(l => `"${l.timestamp}","${l.user}","${l.action}","${l.detail}"`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `amml-activity-log-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    return (_jsxs("div", { className: "page active", children: [_jsxs("div", { className: "ph", children: [_jsxs("div", { className: "ph-l", children: [_jsx("h2", { children: "\uD83D\uDCDC Activity Log" }), _jsxs("p", { children: [filtered.length, " of ", state.activityLog.length, " events"] })] }), _jsxs("div", { className: "ph-r", children: [_jsx("input", { type: "search", placeholder: "Search logs\u2026", value: search, onChange: e => setSearch(e.target.value), style: { padding: '8px 12px', borderRadius: 8, width: 220 } }), _jsx("select", { value: actionFilter, onChange: e => setActionFilter(e.target.value), style: { padding: '8px 12px', borderRadius: 8 }, children: uniqueActions.map(a => (_jsx("option", { value: a, children: a === 'all' ? 'All actions' : a }, a))) }), _jsxs("button", { className: "btn btn-outline btn-sm", onClick: exportCSV, children: [_jsx(Download, { size: 14 }), " Export CSV"] })] })] }), filtered.length === 0 ? (_jsx("div", { className: "card", children: _jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "es-icon", children: _jsx(FileText, { size: 40 }) }), _jsx("div", { className: "es-title", children: "No activity recorded" }), _jsx("p", { children: "Actions like logins, staff changes, and device events appear here." })] }) })) : (_jsxs("div", { className: "card", style: { padding: 0, overflow: 'hidden' }, children: [_jsxs("table", { className: "tbl", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Timestamp" }), _jsx("th", { children: "User" }), _jsx("th", { children: "Action" }), _jsx("th", { children: "Detail" })] }) }), _jsx("tbody", { children: filtered.slice(0, 200).map(log => (_jsxs("tr", { children: [_jsx("td", { style: { fontSize: 12, whiteSpace: 'nowrap', color: 'var(--text3)' }, children: new Date(log.timestamp).toLocaleString('en-GB') }), _jsx("td", { children: _jsx("span", { className: "badge b-navy", children: log.user }) }), _jsx("td", { children: _jsx("span", { className: "badge b-blue", children: log.action }) }), _jsx("td", { style: { fontSize: 12, color: 'var(--text2)' }, children: log.detail })] }, log.id))) })] }), filtered.length > 200 && (_jsxs("div", { style: { padding: '12px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text3)', borderTop: '1px solid var(--border)' }, children: ["Showing first 200 of ", filtered.length, " records. Export CSV for full data."] }))] }))] }));
}
