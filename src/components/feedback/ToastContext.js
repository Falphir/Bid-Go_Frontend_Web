import React, { createContext, useCallback, useContext, useState } from "react";
import "./ToastContext.css";

// Contexto de toasts temporários
const ToastCtx = createContext({ showToast: () => {}, toasts: [] });

export function ToastProvider({ children, duration = 3000 }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(
    (msg, type = "success") => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, msg, type }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, duration);
    },
    [duration]
  );

  return (
    <ToastCtx.Provider value={{ showToast, toasts }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
