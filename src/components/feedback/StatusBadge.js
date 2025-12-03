/**
 * @typedef {Object} StatusBadgeProps
 * @property {*} status - Raw status value to be mapped to a human-readable label and CSS class.
 * @property {string} [prefix] - Optional text shown before the status label.
 * @property {string} [className] - Extra class names to append to the badge.
 */

import React from "react";
import { mapStatusToClass, prettyStatus } from "../../utils/status";
import "./StatusBadge.css";


/**
 * Visual badge that displays a normalized status label with a color-coded style.
 *
 * It uses {@link mapStatusToClass} and {@link prettyStatus} helpers to derive
 * the CSS class and the human-friendly text from the raw `status` value.
 *
 * @param {StatusBadgeProps} props - Badge configuration and status value.
 * @returns {JSX.Element} Rendered status badge.
 */
export default function StatusBadge({ status, prefix, className = "" }) {
  const cls = mapStatusToClass(status);
  const label = prettyStatus(status);
  return (
    <span
      className={["status-badge", cls, className].filter(Boolean).join(" ")}
    >
      {prefix ? prefix + " " : ""}
      {label}
    </span>
  );
}
