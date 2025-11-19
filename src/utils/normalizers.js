// Common data normalization functions extracted from pages

export function normalizeTransportList(data) {
  const arr = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.results)
    ? data.results
    : [];
  return arr.map((t) => ({
    id: t.id ?? t.transportRequestId ?? t.transportId,
    image: t.image ?? "https://via.placeholder.com/400x250",
    package: t.package ?? t.title ?? "Pedido",
    route: t.route ?? "",
    origin: t.origin ?? t.from ?? "—",
    destination: t.destination ?? t.to ?? "—",
    maxPrice: t.maxPrice ?? t.maxBudget ?? "—",
    timeRemaining: t.timeRemaining ?? "",
    biddingEndDate:
      t.biddingEndDate ?? t.biddingEnd ?? t.bidding_end_date ?? null,
    status: t.status ?? null,
  }));
}

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}

export function normalizeHistoryDriver(data) {
  const arr = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.results)
    ? data.results
    : [];
  return arr.map((t) => {
    const companyName = t.companyName ?? t.company?.name ?? t.company ?? "—";
    const pkg = t.package ?? t.cargo ?? t.goods ?? t.title ?? "—";
    const destination = t.destination ?? t.to ?? t.route?.to ?? "—";
    const price = t.price ?? t.value ?? t.amount ?? t.maxPrice ?? "—";
    const status = t.status ?? t.state ?? "—";
    const rating = t.rating ?? t.evaluation ?? t.score ?? "—";
    const dateRaw =
      t.date ??
      t.createdAt ??
      t.updatedAt ??
      t.biddingEndDate ??
      t.deliveryDate ??
      null;
    return {
      companyName,
      package: pkg,
      date: fmtDate(dateRaw),
      destination,
      price,
      status,
      rating,
      requestId:
        t.id ?? t.requestId ?? t.transportRequestId ?? t.transportId ?? null,
    };
  });
}

export function normalizeHistoryCompany(data) {
  const arr = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.results)
    ? data.results
    : [];
  return arr.map((t) => {
    const requestId =
      t.id ?? t.requestId ?? t.transportRequestId ?? t.transportId ?? null;
    const pkg = t.package ?? t.cargo ?? t.goods ?? t.title ?? "—";
    const driverName =
      t.driverName ?? t.name ?? t.driver?.name ?? t.driver ?? "—";
    const destination = t.destination ?? t.to ?? t.route?.to ?? "—";
    const price = t.price ?? t.value ?? t.amount ?? t.maxPrice ?? "—";
    const status = t.status ?? t.state ?? "—";
    const dateRaw =
      t.date ??
      t.createdAt ??
      t.updatedAt ??
      t.biddingEndDate ??
      t.deliveryDate ??
      null;
    return {
      requestId,
      package: pkg,
      driverName,
      date: fmtDate(dateRaw),
      destination,
      price,
      status,
    };
  });
}
