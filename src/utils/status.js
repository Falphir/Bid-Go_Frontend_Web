// Utilitários de estado: normalizam e formatam status
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

// Status → classe CSS (ex.: "InTransit" → "status-intransit")
export function mapStatusToClass(raw) {
  if (!raw || typeof raw !== "string") return "status-unknown";
  const norm = raw.toLowerCase().replace(/[^a-z]/g, "");
  return "status-" + (aliases[norm] || norm || "unknown");
}

// Status → texto legível (ex.: "WAITING_PICKUP" → "Waiting Pickup")
export function prettyStatus(value) {
  if (!value || typeof value !== "string") return "—";
  return value
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
