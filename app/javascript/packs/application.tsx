import { createRoot } from "react-dom/client";

import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { SENTRY_DSN } from "../meta";

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 0.3,
});

import { App } from "../App";

import "video.js/dist/video-js.css";
import "../application.scss";

import * as Rails from "@rails/ujs";
Rails.start();

document.addEventListener("DOMContentLoaded", () => {
  const root = createRoot(document.querySelector("#app")!);
  root.render(
    <Sentry.ErrorBoundary fallback={<p>A critical error has occured...</p>}>
      <App />
    </Sentry.ErrorBoundary>,
  );
});
