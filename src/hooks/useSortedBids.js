import { useMemo } from "react";

/**
 * Sorts a list of bids by value or deadline.
 *
 * @param {Object[]|null} bids - Original bids array.
 * @param {string} sortBy - Key used for sorting ("value" or "deadline").
 * @param {boolean} ascending - Whether to sort in ascending order.
 * @returns {Object[]} New array with bids sorted according to the criteria.
 */


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
