import placeholderImage from "../assets/Image-not-found.png";

/**
 * Normalizes a raw transport list payload into an array of card-friendly objects.
 *
 * @param {any} data - Raw data returned by the backend for transport listing.
 * @returns {Object[]} Array of normalized transport objects.
 */
export function normalizeTransportList(data) {
  const arr = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.results)
    ? data.results
    : [];

  return arr.map((t) => ({
    id: t.id ?? t.transportRequestId ?? null,
    image: t.image ?? placeholderImage,
    package: t.package ?? "Pedido",
    route: t.route ?? "",
    origin: t.origin ?? "—",
    destination: t.destination ?? "—",
    maxPrice: t.maxPrice ?? "—",
    timeRemaining: t.timeRemaining ?? "",
    biddingEndDate: t.biddingEndDate ?? null,
    status: t.status ?? null,
    createdAt:
      t.createdAt ??
      t.creationDate ??
      t.created_at ??
      t.date ??
      t.updatedAt ??
      null,
  }));
}

/**
 * Formats a date-like value into a localized string.
 *
 * @param {any} value - Raw date value from the backend.
 * @returns {string} Localized date/time string or "—" when invalid.
 */
function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}

/**
 * Normalizes driver history data into table-friendly rows.
 *
 * @param {any} data - Raw driver history payload from the backend.
 * @returns {Object[]} Array of normalized driver history entries.
 */
export function normalizeHistoryDriver(data) {
  const arr = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.results)
    ? data.results
    : [];
  return arr.map((t) => {
    const companyName = t.companyName ?? "—";
    const pkg = t.package ?? "—";
    const destination = t.destination ?? "—";
    const price = t.value ?? "—";
    const status = t.status ?? "—";
    const rating = t.rating ?? "—";
    const dateRaw = t.date ?? null;
    const time = (() => {
      const d = new Date(dateRaw);
      const ms = d.getTime();
      return isNaN(ms) ? 0 : ms;
    })();
    return {
      companyName,
      package: pkg,
      date: fmtDate(dateRaw),
      dateTime: time,
      destination,
      price,
      status,
      rating,
    };
  });
}

/**
 * Normalizes company history data into table-friendly rows.
 *
 * @param {any} data - Raw company history payload from the backend.
 * @returns {Object[]} Array of normalized company history entries.
 */
export function normalizeHistoryCompany(data) {
  const arr = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.results)
    ? data.results
    : [];
  return arr.map((t) => {
    const requestId = t.transportRequestId ?? null;
    const pkg = t.package ?? "—";
    const driverName = t.name ?? "—";
    const destination = t.destination ?? "—";
    const price = t.price ?? "—";
    const status = t.status ?? "—";
    const dateRaw = t.date ?? null;
    const time = (() => {
      const d = new Date(dateRaw);
      const ms = d.getTime();
      return isNaN(ms) ? 0 : ms;
    })();
    return {
      requestId,
      package: pkg,
      driverName,
      date: fmtDate(dateRaw),
      dateTime: time,
      destination,
      price,
      status,
    };
  });
}
