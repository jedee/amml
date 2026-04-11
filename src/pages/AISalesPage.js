import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useApp } from '../contexts/AppContext';
export default function AISalesPage() {
    const { state } = useApp();
    return (_jsxs("div", { className: "page active", children: [_jsxs("div", { className: "ph", children: [_jsxs("div", { className: "ph-l", children: [_jsx("h2", { children: "\uD83E\uDD16 AI Sales Suite" }), _jsx("p", { children: "45 virtual collaborators \u00B7 Powered by Claude AI" })] }), _jsx("div", { className: "ph-r", children: _jsx("span", { style: { fontSize: 12, padding: '5px 14px' }, className: "badge b-blue", children: "\u26A1 AI Ready" }) })] }), _jsx("div", { className: "card", children: _jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "es-icon", children: "\uD83E\uDD16" }), _jsx("div", { className: "es-title", children: "AI Sales Suite" }), _jsx("p", { style: { fontSize: 13, color: 'var(--text3)', marginTop: 6 }, children: "Daily briefings, virtual team, ICP builder, and AI-powered prospecting. Configure your Anthropic API key in Settings to enable." })] }) })] }));
}
