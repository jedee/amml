import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ─────────────────────────────────────────────────────────────
//  AMML — Dashboard
// ─────────────────────────────────────────────────────────────
import { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
function StatCard({ value, label, accent }) {
    return (_jsxs("div", { className: "sr", children: [_jsx("div", { className: "sr-val", style: { color: accent }, children: value }), _jsx("div", { className: "sr-lbl", children: label })] }));
}
function KpiCard({ val, label, icon, accent }) {
    return (_jsx("div", { className: "kpi", children: _jsxs("div", { className: "kpi-l", children: [_jsx("div", { className: "kpi-icon", style: { background: accent + '18', color: accent }, children: icon }), _jsxs("div", { children: [_jsx("div", { className: "kpi-val", children: val }), _jsx("div", { className: "kpi-sub", children: label })] })] }) }));
}
export default function Dashboard() {
    const { state } = useApp();
    const { markets, staff, devices, att, user } = state;
    const today = new Date().toISOString().slice(0, 10);
    const todayRecs = useMemo(() => att.filter(r => r.date === today), [att, today]);
    const kpis = useMemo(() => ({
        activeStaff: staff.filter(s => s.active).length,
        marketsCount: markets.filter(m => m.active).length,
        onlineDevices: devices.filter(d => d.active).length,
        onTime: todayRecs.filter(r => !r.late).length,
        late: todayRecs.filter(r => r.late).length,
        absent: Math.max(0, staff.filter(s => s.active).length - todayRecs.length),
    }), [staff, markets, devices, todayRecs]);
    const dateLabel = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return (_jsxs("div", { className: "page active", children: [_jsxs("div", { className: "page-header", children: [_jsxs("div", { className: "page-header-l", children: [_jsx("h1", { children: "Dashboard" }), _jsxs("p", { children: [user?.name, " \u00B7 ", dateLabel] })] }), _jsxs("div", { className: "page-header-r", children: [_jsx("button", { className: "btn btn-outline btn-sm", children: "\uD83D\uDCCA Full Report" }), _jsx("button", { className: "btn btn-blue btn-sm", children: "\uD83D\uDD50 Attendance" })] })] }), _jsxs("div", { className: "kpi-grid", children: [_jsx(KpiCard, { val: kpis.activeStaff, label: "Active Staff", icon: "\uD83D\uDC65", accent: "#0064B4" }), _jsx(KpiCard, { val: kpis.marketsCount, label: "Markets", icon: "\uD83C\uDFEA", accent: "#DC6400" }), _jsx(KpiCard, { val: kpis.onlineDevices, label: "Online Devices", icon: "\uD83D\uDCF1", accent: "#288C28" }), _jsx(KpiCard, { val: kpis.onTime, label: "On Time", icon: "\u2705", accent: "#003C78" }), _jsx(KpiCard, { val: kpis.late, label: "Late Arrivals", icon: "\u26A0\uFE0F", accent: "#E8821A" }), _jsx(KpiCard, { val: kpis.absent, label: "Absent", icon: "\u274C", accent: "#C0392B" })] }), _jsxs("div", { className: "stats-row", children: [_jsx(StatCard, { value: kpis.onTime, label: "Clocked In", accent: "var(--color-brand-green)" }), _jsx(StatCard, { value: kpis.late, label: "Late", accent: "var(--color-brand-orange)" }), _jsx(StatCard, { value: todayRecs.length, label: "Total Events", accent: "var(--color-brand-blue)" }), _jsx(StatCard, { value: staff.length, label: "Total Staff", accent: "var(--color-text)" })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Today's Attendance Log" }), _jsx(CardAction, { children: _jsxs(Badge, { variant: "outline", children: [todayRecs.length, " records"] }) })] }), _jsx(CardContent, { children: todayRecs.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "es-icon", children: "\uD83D\uDD50" }), _jsx("div", { className: "es-title", children: "No attendance records yet" }), _jsx("p", { className: "es-sub", children: "Staff clock in using biometric devices or the Attendance page." })] })) : (_jsxs("table", { className: "tbl", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Staff" }), _jsx("th", { children: "Market" }), _jsx("th", { children: "Clock In" }), _jsx("th", { children: "Clock Out" }), _jsx("th", { children: "Duration" }), _jsx("th", { children: "Status" })] }) }), _jsx("tbody", { children: todayRecs.slice(0, 12).map(r => (_jsxs("tr", { children: [_jsx("td", { className: "fw-700", children: r.staffName }), _jsx("td", { className: "tbl-col-sm", children: r.market }), _jsx("td", { className: "tbl-col-mono", children: r.clockIn || '—' }), _jsx("td", { className: "tbl-col-mono", children: r.clockOut || '—' }), _jsx("td", { className: "tbl-col-mono", children: r.duration || '—' }), _jsx("td", { children: _jsx(Badge, { variant: r.late ? 'destructive' : 'secondary', children: r.late ? '⚠️ Late' : '✅ On Time' }) })] }, r.id))) })] })) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Quick Actions" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "mf", children: [_jsx("button", { className: "btn btn-outline btn-sm", children: "\u2795 Add Staff" }), _jsx("button", { className: "btn btn-outline btn-sm", children: "\uD83D\uDCF1 Register Device" }), _jsx("button", { className: "btn btn-outline btn-sm", children: "\uD83D\uDCCA View Reports" }), _jsx("button", { className: "btn btn-blue btn-sm", children: "\uD83D\uDD50 Record Attendance" })] }) })] })] }));
}
;
