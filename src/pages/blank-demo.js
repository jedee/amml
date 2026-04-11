import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { IconRocket } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
/**
 * Blank template - minimal starting point for your site.
 *
 * This is a simple welcome page that you can customize or replace entirely.
 * Ask Zo to help you build whatever you need.
 */
export default function BlankDemo() {
    const isDev = import.meta.env.MODE !== "production";
    useEffect(() => {
        console.log(`Zo site in ${isDev ? "development" : "production"} mode.`);
    }, []);
    return (_jsx("main", { className: "min-h-screen bg-gradient-to-b from-muted/40 to-background", children: _jsxs("div", { className: "mx-auto max-w-3xl px-6 py-16 md:py-24", children: [_jsxs("header", { className: "mb-12 text-center", children: [_jsx("img", { src: "/images/pegasus.png", alt: "Zo", className: "mx-auto mb-6 size-16 rounded-xl opacity-80" }), _jsxs(Badge, { variant: "outline", className: "mb-4", children: [_jsx(IconRocket, { className: "size-3" }), "Running on your Zo Computer"] }), _jsx("h1", { className: "text-4xl font-semibold tracking-tight md:text-5xl", children: "Your new Zo site" }), _jsx("p", { className: "mt-3 text-lg text-muted-foreground", children: "You've just created a new site running on your Zo Computer" })] }), _jsxs(Card, { className: "mb-8 bg-gradient-to-t from-primary/5 to-card shadow-xs", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Welcome" }), _jsx(CardDescription, { children: "This is your starting point \u2014 edit it, replace it, or build on it" })] }), _jsxs(CardContent, { className: "space-y-3 text-sm leading-relaxed text-muted-foreground", children: [_jsx("p", { children: "Sites can host interactive pages, serve an API, or both. You can make as many sites as you like and control who has access." }), _jsx("p", { children: "Zo can help you get started \u2014 ask to customize this page, add features, create local databases, or explore what's possible." })] })] }), _jsx(Card, { className: "border-primary/20 bg-primary/5", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("p", { className: "text-sm leading-relaxed text-muted-foreground", children: [_jsx("strong", { className: "text-foreground", children: "Getting started:" }), " This file is at", " ", _jsx("code", { className: "text-xs", children: "src/pages/blank-demo.tsx" }), ". Edit it directly or ask Zo to help you build something new."] }) }) })] }) }));
}
