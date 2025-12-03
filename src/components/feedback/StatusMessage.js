/**
 * @typedef {Object} StatusMessageProps
 * @property {"info"|"error"} [type] - Message type that controls styling.
 * @property {*} [children] - React children to render as the message content.
 * @property {string} [message] - Plain text message used when no children are provided.
 * @property {string} [className] - Extra class names to append to the root element.
 */

import React from "react";
import "./StatusMessage.css";


/**
 * Simple status message component.
 *
 * It renders a paragraph with styling that depends on the `type` prop,
 * defaulting to an informational message and using `children` or the
 * `message` prop as content.
 *
 * @param {StatusMessageProps} props - Message configuration and content.
 * @returns {JSX.Element} Rendered status message paragraph.
 */
export default function StatusMessage({
  type = "info",
  children,
  message,
  className = "",
}) {
  const msg = children || message;
  const isError = type === "error";
  const baseClass = "status-message";
  const classes = [baseClass, isError ? "error" : "", className]
    .filter(Boolean)
    .join(" ");
  return <p className={classes}>{msg}</p>;
}
