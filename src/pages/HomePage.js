import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
const MODULES = [
    {
        icon: (_jsxs("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1" }), _jsx("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1" }), _jsx("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" }), _jsx("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1" })] })),
        title: 'Dashboard',
        desc: 'KPIs, market overview, and real-time attendance summary',
        color: '#0064B4',
    },
    {
        icon: (_jsxs("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }), _jsx("circle", { cx: "9", cy: "7", r: "4" }), _jsx("path", { d: "M23 21v-2a4 4 0 0 0-3-3.87" }), _jsx("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })] })),
        title: 'Staff Management',
        desc: 'Manage personnel, roles, biometric enrollment, and nominal roll imports',
        color: '#288C28',
    },
    {
        icon: (_jsxs("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("rect", { x: "2", y: "7", width: "20", height: "14", rx: "2" }), _jsx("path", { d: "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" })] })),
        title: 'Biometric Devices',
        desc: 'ZKTeco & Bantech log import, device status monitoring, and clock reconciliation',
        color: '#DC6400',
    },
    {
        icon: (_jsxs("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }), _jsx("polyline", { points: "14 2 14 8 20 8" }), _jsx("line", { x1: "16", y1: "13", x2: "8", y2: "13" }), _jsx("line", { x1: "16", y1: "17", x2: "8", y2: "17" }), _jsx("polyline", { points: "10 9 9 9 8 9" })] })),
        title: 'Reports & Payroll',
        desc: 'Attendance reports, late/absent analysis, and per-market payroll computation',
        color: '#003C78',
    },
    {
        icon: (_jsxs("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" }), _jsx("polyline", { points: "7.5 4.21 12 6.81 16.5 4.21" }), _jsx("polyline", { points: "7.5 19.79 7.5 14.6 3 12" }), _jsx("polyline", { points: "21 12 16.5 14.6 16.5 19.79" }), _jsx("polyline", { points: "3.27 6.96 12 12.01 20.73 6.96" }), _jsx("line", { x1: "12", y1: "22.08", x2: "12", y2: "12" })] })),
        title: 'AI Sales Suite',
        desc: 'Claude-powered daily briefings, virtual sales agents, and ICP prospecting',
        color: '#7B3FE4',
    },
];
export default function HomePage() {
    return (_jsxs("div", { style: { minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }, children: [_jsxs("header", { style: {
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 40px', height: 64,
                    background: 'var(--navy)',
                    borderBottom: '2px solid var(--orange)',
                    flexShrink: 0,
                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12 }, children: [_jsx("img", { src: "/images/ammllogo.png", alt: "AMML", style: { height: 36, filter: 'brightness(1.1)' } }), _jsxs("div", { children: [_jsx("div", { style: { color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: '-.01em' }, children: "Abuja Markets Management Limited" }), _jsx("div", { style: { color: 'rgba(255,255,255,.45)', fontSize: 11, fontWeight: 500 }, children: "Enterprise Management System" })] })] }), _jsx("a", { href: "/app", style: {
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '9px 22px',
                            background: 'linear-gradient(135deg,var(--blue),var(--blue-dk))',
                            color: '#fff', fontWeight: 700, fontSize: 13.5,
                            borderRadius: 'var(--r)',
                            textDecoration: 'none',
                            boxShadow: '0 4px 14px rgba(0,100,180,.4)',
                            transition: 'transform .18s, box-shadow .18s',
                        }, onMouseEnter: e => { e.target.style.transform = 'translateY(-1px)'; }, onMouseLeave: e => { e.target.style.transform = ''; }, children: "Enter System \u2192" })] }), _jsxs("section", { style: {
                    background: 'linear-gradient(160deg, var(--navy) 0%, var(--blue-dkr) 55%, #001F4D 100%)',
                    padding: '72px 40px 80px',
                    textAlign: 'center',
                    flexShrink: 0,
                }, children: [_jsx(Badge, { style: {
                            background: 'rgba(220,100,0,.2)', color: 'var(--orange-lt)',
                            border: '1px solid rgba(220,100,0,.35)',
                            padding: '5px 14px', borderRadius: 99,
                            fontSize: 11, fontWeight: 700, letterSpacing: '.08em',
                            textTransform: 'uppercase',
                            marginBottom: 20,
                        }, children: "FCT Administration \u00B7 Abuja, Nigeria" }), _jsxs("h1", { style: {
                            color: '#fff', fontSize: 42, fontWeight: 800,
                            letterSpacing: '-.03em', lineHeight: 1.1,
                            marginBottom: 16,
                            maxWidth: 640, margin: '0 auto 16px',
                        }, children: ["Markets Management", _jsx("br", {}), _jsx("span", { style: { background: 'linear-gradient(90deg,var(--blue),var(--orange))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }, children: "Made Simple" })] }), _jsx("p", { style: { color: 'rgba(255,255,255,.6)', fontSize: 16, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 36px' }, children: "Staff attendance, biometric device reconciliation, market operations, payroll, and AI-powered sales intelligence \u2014 all in one system." }), _jsxs("div", { style: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }, children: [_jsx("a", { href: "/app", style: {
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    padding: '13px 28px',
                                    background: 'linear-gradient(135deg,var(--blue),var(--blue-dk))',
                                    color: '#fff', fontWeight: 800, fontSize: 14.5,
                                    borderRadius: 'var(--r)',
                                    textDecoration: 'none',
                                    boxShadow: '0 6px 24px rgba(0,100,180,.5)',
                                    transition: 'transform .18s',
                                }, onMouseEnter: e => { e.target.style.transform = 'translateY(-2px)'; }, onMouseLeave: e => { e.target.style.transform = ''; }, children: "Launch System" }), _jsx("a", { href: "/app", style: {
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    padding: '13px 28px',
                                    background: 'rgba(255,255,255,.08)',
                                    color: '#fff', fontWeight: 700, fontSize: 14.5,
                                    borderRadius: 'var(--r)',
                                    border: '1.5px solid rgba(255,255,255,.15)',
                                    textDecoration: 'none',
                                }, children: "View Documentation" })] })] }), _jsx("section", { style: {
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 0, flexShrink: 0,
                }, children: [
                    { val: '18', label: 'Markets' },
                    { val: '44', label: 'Staff' },
                    { val: '21', label: 'Devices' },
                    { val: '1,200+', label: 'Attendance Records' },
                ].map(s => (_jsxs("div", { style: {
                        padding: '28px 24px', textAlign: 'center',
                        background: 'var(--surface)',
                        borderRight: '1px solid var(--border)',
                        borderBottom: '1px solid var(--border)',
                    }, children: [_jsx("div", { style: { fontSize: 32, fontWeight: 800, color: 'var(--blue)', letterSpacing: '-.03em' }, children: s.val }), _jsx("div", { style: { fontSize: 12, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4 }, children: s.label })] }, s.label))) }), _jsx("section", { style: { padding: '56px 40px', flex: 1 }, children: _jsxs("div", { style: { maxWidth: 960, margin: '0 auto' }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: 40 }, children: [_jsx("h2", { style: { fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.02em', marginBottom: 8 }, children: "Everything you need" }), _jsx("p", { style: { color: 'var(--text3)', fontSize: 14 }, children: "Five integrated modules covering the full operations lifecycle" })] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }, children: MODULES.map(m => (_jsxs(Card, { style: { borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }, children: [_jsx("div", { style: { height: 4, background: m.color } }), _jsxs(CardContent, { style: { padding: 24 }, children: [_jsx("div", { style: {
                                                    width: 52, height: 52, borderRadius: 12,
                                                    background: `${m.color}18`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    marginBottom: 16, color: m.color,
                                                }, children: m.icon }), _jsx("h3", { style: { fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }, children: m.title }), _jsx("p", { style: { fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }, children: m.desc })] })] }, m.title))) })] }) }), _jsxs("footer", { style: {
                    padding: '20px 40px',
                    borderTop: '1px solid var(--border)',
                    background: 'var(--surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexShrink: 0,
                }, children: [_jsx("span", { style: { fontSize: 12, color: 'var(--text3)' }, children: "\u00A9 2026 Abuja Markets Management Limited \u00B7 FCT Administration" }), _jsxs("span", { style: { fontSize: 12, color: 'var(--text3)' }, children: ["Powered by", ' ', _jsx("span", { style: { color: 'var(--blue)', fontWeight: 700 }, children: "Zo Computer" })] })] })] }));
}
