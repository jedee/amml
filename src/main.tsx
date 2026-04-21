import "./styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";

// Initialize Sentry if DSN is available (set SENTRY_DSN in Settings > Advanced)
const dsn = (import.meta as any).env?.PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,   // 10% of sessions — enough for alerts, not overkill
    replaysSessionSampleRate: 0, // disable session replays (privacy + cost)
    environment: import.meta.env.MODE,
    // Catch React rendering errors
    hooks: {
      beforeSend(event) {
        // Don't send 4xx errors — only real crashes
        if (event.exception) return event;
        return null;
      },
    },
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={null}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
