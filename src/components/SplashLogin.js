import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ─────────────────────────────────────────────────────────────
//  AMML — Splash + Login Screens
// ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
export function SplashScreen() {
    return (_jsxs("div", { id: "splash", children: [_jsx("div", { className: "splash-logo-wrap", children: _jsx("img", { src: "/images/ammllogo.png", alt: "AMML", className: "splash-logo" }) }), _jsx("div", { className: "splash-tagline", children: "Abuja Markets Management Limited" }), _jsx("div", { className: "splash-bar", children: _jsx("div", { className: "splash-bar-fill" }) })] }));
}
export function LoginScreen() {
    const { dispatch, state } = useApp();
    const [staffId, setStaffId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleLogin = () => {
        if (!staffId.trim()) {
            setError('Please enter your Staff ID.');
            return;
        }
        const match = state.staff.find(s => s.id.toLowerCase() === staffId.trim().toLowerCase() ||
            s.id.toLowerCase().startsWith(staffId.trim().toLowerCase()));
        if (!match) {
            setError('Staff ID not found. Try AMML-001, AMML-002…');
            return;
        }
        if (match.password && match.password !== password) {
            setError('Incorrect password.');
            setPassword('');
            return;
        }
        setLoading(true);
        dispatch({ type: 'LOGIN', payload: { id: match.id, name: match.first + ' ' + match.last, staffId: match.id, authLevel: match.authLevel, market: match.market } });
        dispatch({ type: 'AUDIT_LOG', payload: { action: 'LOGIN', detail: 'Staff ID ' + match.id + ' signed in' } });
    };
    return (_jsx("div", { id: "loginScreen", children: _jsxs("div", { className: "login-card", children: [_jsx("img", { src: "/images/ammllogo.png", alt: "AMML", className: "login-logo" }), _jsx("div", { className: "login-divider" }), _jsx("div", { className: "login-title", children: "Welcome Back" }), _jsx("div", { className: "login-sub", children: "Sign in to Abuja Markets Management" }), _jsxs("div", { className: "login-input-group", children: [_jsx("label", { className: "login-label", children: "Staff ID" }), _jsx("input", { className: "login-input", type: "text", placeholder: "e.g. AMML-001", value: staffId, onChange: e => { setStaffId(e.target.value); setError(''); }, onKeyDown: e => e.key === 'Enter' && handleLogin(), autoComplete: "username", autoFocus: true })] }), (state.staff.find(s => s.id.toLowerCase() === staffId.trim().toLowerCase() || s.id.toLowerCase().startsWith(staffId.trim().toLowerCase()))?.password) && (_jsxs("div", { className: "login-input-group", children: [_jsx("label", { className: "login-label", children: "Password" }), _jsx("input", { className: "login-input", type: "password", placeholder: "Enter your password", value: password, onChange: e => { setPassword(e.target.value); setError(''); }, onKeyDown: e => e.key === 'Enter' && handleLogin(), autoComplete: "current-password" })] })), error && _jsx("div", { className: "login-error", children: error }), _jsx("button", { className: "login-btn", onClick: handleLogin, disabled: loading, children: loading ? 'Signing in…' : 'Sign In' }), _jsx("p", { className: "login-hint", children: "Staff ID format: AMML-001 \u00B7 Contact admin if locked out" })] }) }));
}
;
