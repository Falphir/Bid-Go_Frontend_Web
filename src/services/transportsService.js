import api from "../api/axiosConfig";
import { normalizeTransportList } from "../utils/normalizers";

function buildQueryString(filters) {
  const params = new URLSearchParams();
  if (!filters) return "";
  if (filters.origin) params.append("origin", filters.origin);
  if (filters.destination) params.append("destination", filters.destination);
  if (filters.deliveryDate) params.append("deliveryDate", filters.deliveryDate);
  if (filters.priceOrder) params.append("priceOrder", filters.priceOrder);
  return params.toString();
}

export async function getCompanyTransports(userId, signal) {
  if (!userId) return [];
  const res = await api.get(`/transports/company/${userId}`, { signal });
  console.log("Company Transports Response:", res);
  return normalizeTransportList(res?.data);
}

export async function getDriverTransports(filters, signal) {
  const qs = buildQueryString(filters);
  const url = qs ? `/pageTransports/filters?${qs}` : `/pageTransports/filters`;
  const res = await api.get(url, { signal });
  return normalizeTransportList(res?.data);
}

export async function createTransportJson(payload, signal) {
  const res = await api.post("/transports/createTransport", payload, { signal });
  return res.data;
}

export async function createTransportForm(formData, signal) {
  const res = await api.post("/transports/createTransport", formData, {
    signal,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function createDraftJson(payload, signal) {
  const res = await api.post("/transports/createDRAFTTransport", payload, { signal });
  return res.data;
}

export async function createDraftForm(formData, signal) {
  const res = await api.post("/transports/createDRAFTTransport", formData, {
    signal,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getTransportById(transportId, signal) {
  const res = await api.get(`/transports/${transportId}`, { signal });
  return res.data;
}

export async function updateTransport(transportId, payload, signal) {
  try {
    const res = await api.post(`/transports/updateTransport/${transportId}`, payload, { signal });
    return res.data;
  } catch (err) {
    if (err.response && err.response.status === 405) {
      const res = await api.put(`/transports/updateTransport/${transportId}`, payload, { signal });
      return res.data;
    }
    throw err;
  }
}

export async function publishCompanyTransport(transportId, signal) {
  const res = await api.put(`/transports/company/publish/${transportId}`, null, { signal });
  return res.data;
}

export async function cancelTransport(transportId, signal) {
  const res = await api.put(`/transports/canceled/${transportId}`, null, { signal });
  return res.data;
}

export async function updateTransportStatus(transportId, status, signal) {
  const res = await api.put(`/transports/updateStatus/${transportId}`, { status }, { signal });
  return res.data;
}
