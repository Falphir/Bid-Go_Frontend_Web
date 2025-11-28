import React from "react";
import "./StatusMessage.css";

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
