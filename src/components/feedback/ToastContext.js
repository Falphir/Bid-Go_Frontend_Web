/**
 * @typedef {Object} Toast
 * @property {number} id - Unique identifier for the toast item.
 * @property {string} msg - Text message displayed in the toast.
 * @property {string} type - Visual type (e.g. "success", "error").
 */

/**
 * @typedef {Object} ToastContextValue
 * @property {function(string, string=): void} showToast - Function to enqueue a new toast.
 * @property {Toast[]} toasts - Current list of active toasts.
 */

import React, { createContext, useCallback, useContext, useState } from "react";
import "./ToastContext.css";


/**
 * React context that exposes toast helpers to the component tree.
 *
 * The default value only provides a no-op `showToast` and an empty
 * `toasts` array, which is overridden by {@link ToastProvider}.
 *
 * @type {React.Context<ToastContextValue>}
 */
const ToastCtx = createContext({ showToast: () => {}, toasts: [] });

/**
 * Provider component that manages temporary toast notifications.
 *
 * It exposes a `showToast` function via context and automatically
 * removes toasts after the given `duration` (in milliseconds).
 *
 * @param {Object} props - Provider props.
 * @param {*} props.children - React children to wrap with the provider.
 * @param {number} [props.duration] - Time in milliseconds before a toast is auto-dismissed.
 * @returns {JSX.Element} Provider wrapping the toast container and children.
 */
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

/**
 * Hook to access the toast context.
 *
 * Components can call `useToast()` to get access to `showToast` and the
 * current `toasts` list managed by {@link ToastProvider}.
 *
 * @returns {ToastContextValue} Toast API and current toasts.
 */
export function useToast() {
  return useContext(ToastCtx);
}
