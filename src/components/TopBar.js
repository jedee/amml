import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ─────────────────────────────────────────────────────────────
//  AMML — Top Bar
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
const ROLE_COLORS = {
    SUPERADMIN: '#4A148C', MD: '#003C78', MANAGER: '#0064B4',
    SUPERVISOR: '#DC6400', OFFICER: '#288C28',
};
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
export default function TopBar() {
    const { state, dispatch } = useApp();
    const [time, setTime] = useState('');
    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const d = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
            const t = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setTime(d + '  ' + t);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);
    if (!state.user)
        return null;
    const roleColor = ROLE_COLORS[state.user.authLevel] ?? '#0064B4';
    const initials = getInitials(state.user.name);
    return (_jsxs("header", { className: "topbar", children: [_jsx("a", { href: "/", className: "topbar-brand", children: _jsx("img", { src: "/images/ammllogo.png", alt: "AMML", className: "topbar-brand-img" }) }), _jsx("div", { className: "topbar-sep" }), _jsxs("div", { className: "market-select", children: [_jsx("span", { children: "\uD83D\uDCCD" }), _jsxs("select", { value: state.marketFilter, onChange: e => dispatch({ type: 'SET_MARKET_FILTER', payload: e.target.value }), children: [_jsx("option", { children: "All Markets" }), state.markets.map(m => _jsx("option", { children: m.name }, m.id))] })] }), _jsx("div", { className: "topbar-spacer" }), _jsx("div", { className: "topbar-clock", children: time }), _jsxs("div", { className: "topbar-notif", title: "Notifications", children: ["\uD83D\uDD14", state.alerts.length > 0 && _jsx("div", { className: "topbar-notif-dot" })] }), _jsxs("div", { className: "topbar-user", onClick: () => dispatch({ type: 'LOGOUT' }), title: "Click to logout", children: [_jsx("div", { className: "topbar-avatar", style: { background: roleColor }, children: initials }), _jsx("span", { className: "topbar-username", children: state.user.name.split(' ')[0] })] })] }));
}
;
