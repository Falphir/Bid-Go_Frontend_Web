/**
 * Application entry point.
 *
 * This file bootstraps the React application, rendering the root
 * `App` component into the DOM and wiring any global configuration
 * such as performance reporting.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import AppRouter from "./AppRouter";
import { ToastProvider } from "./components/feedback/ToastContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  </React.StrictMode>
);

reportWebVitals();
