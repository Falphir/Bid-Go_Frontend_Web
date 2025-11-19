// src/utils/httpError.js
export function getApiErrorMessage(err) {
  // Request was cancelled
  if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
    return "Request canceled.";
  }

  // No response (network/DNS/CORS)
  if (!err?.response) {
    return err?.message
      ? `Network error: ${err.message}`
      : "Network error: no response from server.";
  }

  const { status, data } = err.response;

  if (data?.errors && typeof data.errors === "object") {
    const lines = [];
    for (const [field, arr] of Object.entries(data.errors)) {
      if (Array.isArray(arr) && arr.length) {
        lines.push(`${field}: ${arr.join(", ")}`);
      }
    }
    if (lines.length) return lines.join("\n");
  }

  // Common shapes
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (data?.error?.message) return data.error.message;
  if (Array.isArray(data?.errors) && data.errors.length) {
    const msgs = data.errors
      .map((e) => (typeof e === "string" ? e : e?.message))
      .filter(Boolean);
    if (msgs.length) return msgs.join("\n");
  }
  if (data?.title && data?.detail) return `${data.title}: ${data.detail}`;
  if (data?.title) return data.title;
  if (data?.detail) return data.detail;

  // Fallback including status
  return `Request failed (${status}).`;
}
