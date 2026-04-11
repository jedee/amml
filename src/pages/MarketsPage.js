import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ─────────────────────────────────────────────────────────────
//  AMML — Markets Page
// ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
export default function MarketsPage() {
    const { state } = useApp();
    const [search, setSearch] = useState('');
    const filtered = state.markets.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.location.toLowerCase().includes(search.toLowerCase()));
    return (_jsxs("div", { className: "page active", children: [_jsxs("div", { className: "ph", children: [_jsxs("div", { className: "ph-l", children: [_jsx("h2", { children: "\uD83C\uDFEA Markets" }), _jsxs("p", { children: [filtered.length, " of ", state.markets.length, " markets"] })] }), _jsxs("div", { className: "ph-r", children: [_jsx("input", { type: "search", placeholder: "Search markets\u2026", value: search, onChange: e => setSearch(e.target.value) }), _jsx("button", { className: "btn btn-blue", children: "\u2795 Add Market" })] })] }), _jsx("div", { className: "mkt-grid", children: filtered.map(m => (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "card-head", children: [_jsxs("div", { children: [_jsx("div", { className: "card-title", children: m.name }), _jsx("div", { className: "card-sub", children: m.location })] }), _jsx("span", { className: `badge ${m.active ? 'b-green' : 'b-navy'}`, children: m.active ? 'Active' : 'Inactive' })] }), _jsxs("div", { className: "mkt-card-info", children: [_jsxs("div", { children: ["\uD83D\uDC64 ", _jsx("strong", { children: "Manager:" }), " ", m.manager] }), _jsxs("div", { children: ["\uD83D\uDCC5 ", _jsx("strong", { children: "Days:" }), " ", m.days] }), _jsxs("div", { children: ["\uD83D\uDC65 ", _jsx("strong", { children: "Capacity:" }), " ", m.capacity, " stalls"] })] }), _jsx("p", { className: "card-sub", style: { marginTop: 8 }, children: m.desc })] }, m.id))) })] }));
}
