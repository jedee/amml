import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ─────────────────────────────────────────────────────────────
//  AMML — Sidebar Navigation
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useApp } from '../contexts/AppContext';
const SECTION_LABELS = {
    dashboard: 'Main', attendance: 'Operations', markets: 'Management',
    staff: 'People', devices: 'Hardware', payroll: 'Finance',
    reports: 'Insights', 'ai-sales': 'AI Suite', users: 'Admin', alerts: 'Notices',
};
export default function Sidebar({ currentPage, onNavigate }) {
    const { navItems, currentRole } = useApp();
    if (!navItems.length)
        return null;
    return (_jsxs("aside", { className: "sidebar", children: [_jsx("div", { className: "sidebar-header", children: _jsxs("div", { className: "sidebar-role", children: [_jsx("span", { className: "sidebar-role-badge", style: { background: currentRole?.color + '22', color: currentRole?.color }, children: currentRole?.short }), _jsx("span", { className: "sidebar-role-name", children: currentRole?.label })] }) }), navItems.map(item => (_jsxs(React.Fragment, { children: [item.id === 'dashboard' && _jsx("div", { className: "nav-section", children: "Main" }), item.id === 'markets' && currentPage !== 'dashboard' && !['attendance', 'staff', 'devices', 'payroll', 'reports', 'users', 'settings', 'ai-sales'].includes(currentPage) && _jsx("div", { className: "nav-section", children: "Operations" }), item.id === 'staff' && _jsx("div", { className: "nav-section", children: "People" }), item.id === 'devices' && _jsx("div", { className: "nav-section", children: "Hardware" }), item.id === 'payroll' && _jsx("div", { className: "nav-section", children: "Finance" }), item.id === 'reports' && _jsx("div", { className: "nav-section", children: "Insights" }), _jsxs("button", { className: 'nav-item' + (currentPage === item.id ? ' active' : ''), onClick: () => onNavigate(item.id), children: [_jsx("span", { className: "nav-item-icon", children: item.icon }), _jsx("span", { children: item.label }), item.id === 'alerts' && currentRole?.label && _jsx("span", { className: "nav-badge", children: "3" })] })] }, item.id))), _jsx("div", { className: "sidebar-foot", children: _jsx("small", { children: "AMML v1.0 \u00B7 Abuja MMD" }) })] }));
}
;
