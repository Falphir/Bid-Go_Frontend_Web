import placeholderImage from "../assets/Image-not-found.png";
// Normalizadores: ajustam respostas da API para o formato usado no UI

// Lista de transportes → objetos consistentes para cards
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

// Data → string legível (local)
function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}

// Histórico para Driver → linhas da tabela
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

// Histórico para Company → linhas da tabela
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
