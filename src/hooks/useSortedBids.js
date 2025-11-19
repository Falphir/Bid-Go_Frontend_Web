import { useMemo } from "react";

export function useSortedBids(bids, sortBy, ascending) {
  return useMemo(() => {
    if (!Array.isArray(bids)) return [];
    const arr = [...bids];
    arr.sort((a, b) => {
      if (sortBy === "value") {
        return ascending ? a.value - b.value : b.value - a.value;
      }
      if (sortBy === "deadline") {
        const da = new Date(a.deliveryDeadline);
        const db = new Date(b.deliveryDeadline);
        return ascending ? da - db : db - da;
      }
      return 0;
    });
    return arr;
  }, [bids, sortBy, ascending]);
}

export default useSortedBids;