import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useApp } from '../contexts/AppContext';
export default function ReportsPage() {
    const { state } = useApp();
    return (_jsxs("div", { className: "page active", children: [_jsx("div", { className: "ph", children: _jsxs("div", { className: "ph-l", children: [_jsx("h2", { children: "\uD83D\uDCCB Reports" }), _jsx("p", { children: "Attendance summaries and market analytics" })] }) }), _jsx("div", { className: "card", children: _jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "es-icon", children: "\uD83D\uDCCA" }), _jsx("div", { className: "es-title", children: "Reports Module" }), _jsx("p", { style: { fontSize: 13, color: 'var(--text3)', marginTop: 6 }, children: "Monthly attendance summaries, market performance, and payroll reports." })] }) })] }));
}
