import React from "react";
import "./Pagination.css";
import {faAngleLeft} from "@fortawesome/free-solid-svg-icons/faAngleLeft";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleRight} from "@fortawesome/free-solid-svg-icons/faAngleRight";

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
            <span className="pagination-current">{currentPage} / {totalPages}</span>
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
