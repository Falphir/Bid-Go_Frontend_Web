/**
 * @typedef {Object} PaginationProps
 * @property {number} currentPage - Current page (1-based) being viewed.
 * @property {number} totalPages - Total number of pages available.
 * @property {function(number): void} onPageChange - Callback invoked with the new page index.
 */

import React from "react";
import "./Pagination.css";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons/faAngleLeft";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons/faAngleRight";


/**
 * Simple previous/next pagination control.
 *
 * It hides itself when there is only a single page and disables the
 * corresponding arrow buttons when at the bounds.
 *
 * @param {PaginationProps} props - Pagination state and change handler.
 * @returns {JSX.Element|null} Rendered pagination navigation or null when not needed.
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination-root">
      <button
        className="pagination-btn pagination-arrow"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <FontAwesomeIcon icon={faAngleLeft} />
      </button>
      <span className="pagination-current">
        {currentPage} / {totalPages}
      </span>
      <button
        className="pagination-btn pagination-arrow"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <FontAwesomeIcon icon={faAngleRight} />
      </button>
    </nav>
  );
}
