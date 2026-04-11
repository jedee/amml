import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ─────────────────────────────────────────────────────────────
//  AMML — Splash Screen (auto-transitions to login after 2.8s)
// ─────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
export function SplashScreen({ onDone }) {
    const { dispatch } = useApp();
    useEffect(() => {
        const t = setTimeout(() => {
            dispatch({ type: 'GO_TO_LOGIN' });
            onDone?.();
        }, 2800);
        return () => clearTimeout(t);
    }, [dispatch, onDone]);
    return (_jsxs("div", { id: "splash", children: [_jsx("div", { className: "splash-logo-wrap", children: _jsx("img", { src: "/images/ammllogo.png", alt: "AMML", className: "splash-logo" }) }), _jsx("div", { className: "splash-tagline", children: "Abuja Markets Management Limited" }), _jsx("div", { className: "splash-bar", children: _jsx("div", { className: "splash-bar-fill" }) })] }));
}
