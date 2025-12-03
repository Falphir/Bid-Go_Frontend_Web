/**
 * Internal map of normalized status aliases.
 *
 * @type {Object.<string, string>}
 */
const aliases = {
  intransit: "intransit",
  intransito: "intransit",
  waitingpickup: "waitingpickup",
  waitingforpickup: "waitingpickup",
  accepted: "accepted",
  approved: "accepted",
  rejected: "rejected",
  canceled: "canceled",
  cancelled: "canceled",
  completed: "completed",
  finished: "completed",
  active: "active",
  pending: "pending",
  draft: "draft",
};

/**
 * Maps a raw status value to a CSS class name.
 *
 * @param {*} raw - Raw status value from the backend or UI.
 * @returns {string} CSS class name in the form `status-x`.
 */
export function mapStatusToClass(raw) {
  if (!raw || typeof raw !== "string") return "status-unknown";
  const norm = raw.toLowerCase().replace(/[^a-z]/g, "");
  return "status-" + (aliases[norm] || norm || "unknown");
}

/**
 * Converts a status string into a human-readable label.
 *
 * @param {*} value - Raw status string (e.g. "WAITING_PICKUP").
 * @returns {string} Pretty label (e.g. "Waiting Pickup") or "—" when invalid.
 */
export function prettyStatus(value) {
  if (!value || typeof value !== "string") return "—";
  return value
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
