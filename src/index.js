import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import AppRouter from "./AppRouter";
import { ToastProvider } from "./components/feedback/ToastContext";
// Ficheiro de entrada da aplicação React: cria a root e renderiza o AppRouter.
// Envolve a árvore com ToastProvider para disponibilizar toasts globais.

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  </React.StrictMode>
);

// Opcional: reporte de métricas de performance (CLS, LCP, etc.)
// Passe uma função (ex: console.log) para observar os valores
// Ex.: reportWebVitals(console.log)
reportWebVitals();
