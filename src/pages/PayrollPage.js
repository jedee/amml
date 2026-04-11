import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useApp } from '../contexts/AppContext';
export default function PayrollPage() {
    const { state } = useApp();
    return (_jsxs("div", { className: "page active", children: [_jsx("div", { className: "ph", children: _jsxs("div", { className: "ph-l", children: [_jsx("h2", { children: "\uD83D\uDCB5 Payroll" }), _jsx("p", { children: "Staff salary management and payroll periods" })] }) }), _jsx("div", { className: "card", children: _jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "es-icon", children: "\uD83D\uDCB5" }), _jsx("div", { className: "es-title", children: "Payroll Module" }), _jsx("p", { style: { fontSize: 13, color: 'var(--text3)', marginTop: 6 }, children: "Configure payroll periods and staff salaries here. Uses attendance data and configured daily rates." })] }) })] }));
}
