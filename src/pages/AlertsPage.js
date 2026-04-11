import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ─────────────────────────────────────────────────────────────
//  AMML — Alerts Page
// ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { AlertCircle, CheckCircle, Info, XCircle, Bell, CheckCheck } from 'lucide-react';
const ICONS = {
    info: _jsx(Info, { size: 16 }),
    success: _jsx(CheckCircle, { size: 16 }),
    warning: _jsx(AlertCircle, { size: 16 }),
    error: _jsx(XCircle, { size: 16 }),
};
const COLORS = {
    info: { bg: 'rgba(0,100,180,.08)', border: '#0064B4', text: '#0064B4' },
    success: { bg: 'rgba(40,140,40,.08)', border: '#288C28', text: '#288C28' },
    warning: { bg: 'rgba(220,100,0,.08)', border: '#DC6400', text: '#DC6400' },
    error: { bg: 'rgba(192,57,43,.08)', border: '#C0392B', text: '#C0392B' },
};
export default function AlertsPage() {
    const { state, dispatch, can } = useApp();
    const [filter, setFilter] = useState('all');
    const alerts = filter === 'unread'
        ? state.alerts.filter(a => !a.dismissed)
        : state.alerts;
    const dismiss = (id) => {
        dispatch({ type: 'DISMISS_ALERT', payload: id });
    };
    const dismissAll = () => {
        state.alerts.forEach(a => {
            if (!a.dismissed)
                dispatch({ type: 'DISMISS_ALERT', payload: a.id });
        });
    };
    const stats = {
        total: state.alerts.length,
        unread: state.alerts.filter(a => !a.dismissed).length,
        info: state.alerts.filter(a => a.type === 'info').length,
        success: state.alerts.filter(a => a.type === 'success').length,
        warning: state.alerts.filter(a => a.type === 'warning').length,
        error: state.alerts.filter(a => a.type === 'error').length,
    };
    return (_jsxs("div", { className: "page active", children: [_jsxs("div", { className: "ph", children: [_jsxs("div", { className: "ph-l", children: [_jsx("h2", { children: "\uD83D\uDD14 Alerts & Notices" }), _jsxs("p", { children: [stats.unread, " unread \u00B7 ", stats.total, " total"] })] }), _jsx("div", { className: "ph-r", children: _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { className: `btn btn-sm ${filter === 'all' ? 'btn-blue' : 'btn-outline'}`, onClick: () => setFilter('all'), children: ["All (", stats.total, ")"] }), _jsxs("button", { className: `btn btn-sm ${filter === 'unread' ? 'btn-blue' : 'btn-outline'}`, onClick: () => setFilter('unread'), children: ["Unread (", stats.unread, ")"] }), stats.unread > 0 && (_jsxs("button", { className: "btn btn-sm btn-outline", onClick: dismissAll, children: [_jsx(CheckCheck, { size: 14 }), " Mark all read"] }))] }) })] }), _jsx("div", { className: "stats-row", children: [
                    { label: 'Info', val: stats.info, color: '#0064B4' },
                    { label: 'Success', val: stats.success, color: '#288C28' },
                    { label: 'Warnings', val: stats.warning, color: '#DC6400' },
                    { label: 'Errors', val: stats.error, color: '#C0392B' },
                ].map(s => (_jsxs("div", { className: "sr", children: [_jsx("div", { className: "sr-val", style: { color: s.color }, children: s.val }), _jsx("div", { className: "sr-lbl", children: s.label })] }, s.label))) }), alerts.length === 0 ? (_jsx("div", { className: "card", children: _jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "es-icon", children: _jsx(Bell, { size: 40 }) }), _jsx("div", { className: "es-title", children: "No alerts" }), _jsx("p", { children: "All caught up. New alerts appear here when triggered." })] }) })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: alerts.map(alert => {
                    const c = COLORS[(alert.type ?? 'info')] ?? COLORS.info;
                    return (_jsx("div", { className: "card", style: {
                            borderLeft: `4px solid ${c.border}`,
                            background: c.bg,
                            paddingLeft: 16,
                            opacity: alert.dismissed ? 0.5 : 1,
                            transition: 'opacity .2s',
                        }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'flex-start', gap: 12 }, children: [_jsx("div", { style: { color: c.text, marginTop: 2, flexShrink: 0 }, children: ICONS[(alert.type ?? 'info')] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontWeight: 700, fontSize: 14, color: 'var(--text)' }, children: alert.title }), alert.message && (_jsx("p", { style: { fontSize: 13, color: 'var(--text2)', marginTop: 4 }, children: alert.message })), _jsxs("div", { style: { fontSize: 11, color: 'var(--text3)', marginTop: 6 }, children: [new Date(alert.timestamp).toLocaleString('en-GB'), alert.staffId && ` · Staff: ${alert.staffId}`] })] }), !alert.dismissed && (_jsx("button", { onClick: () => dismiss(alert.id), className: "btn btn-sm btn-outline", title: "Dismiss", children: "\u2715" }))] }) }, alert.id));
                }) }))] }));
}
