/**
 * Extracts a user-friendly error message from an HTTP/Axios error.
 *
 * This utility inspects common Axios error shapes (network errors,
 * validation errors, structured `errors` arrays/objects, RFC7807-style
 * payloads, etc.) and converts them into a single localized string that
 * can be displayed in the UI.
 *
 * @param {any} err - Error object thrown by Axios or by the HTTP layer.
 * @returns {string} Human-readable error message suitable for display to the user.
 */
export function getApiErrorMessage(err) {
  if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
    return "Request canceled.";
  }

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

  return `Request failed (${status}).`;
}
