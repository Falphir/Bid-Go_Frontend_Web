import api from "../api/axiosConfig";

export async function getBidsByDriver(userId, signal) {
  if (!userId) return [];
  const res = await api.get(`/bids/bidsByDriver/${userId}`, { signal });
  return res.data || [];
}

export async function getActiveBids(transportRequestId, signal) {
  if (!transportRequestId) return [];
  const res = await api.get(`/bids/bidsActive?transportRequestId=${transportRequestId}`, { signal });
  return res.data || [];
}

export async function createBid(payload, signal) {
  const res = await api.post(`/bids/createBid`, payload, { signal });
  return res.data;
}

export async function updateBid(bidId, payload, signal) {
  const res = await api.put(`/bids/updatebid/${bidId}`, payload, { signal });
  return res.data;
}

export async function cancelBid(bidId, signal) {
  const res = await api.patch(`/bids/cancel/${bidId}`, null, { signal });
  return res.data;
}

export async function manualBidAction(bidId, action, signal) {
  const res = await api.post(`/bids/manual/${bidId}/${action}`, null, { signal });
  return res.data;
}

const bidsService = {
  getBidsByDriver,
  getActiveBids,
  createBid,
  updateBid,
  cancelBid,
  manualBidAction,
};

export default bidsService;
