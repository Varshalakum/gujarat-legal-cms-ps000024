import React from 'react';

export const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, pageSize }) => {
  if (totalPages <= 1 && (!totalItems || totalItems <= pageSize)) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || currentPage * pageSize);

  return (
    <nav aria-label="Pagination Navigation">
      <hr />
      <div>
        {totalItems ? (
          <p>
            Showing {startItem} to {endItem} of {totalItems} entries
          </p>
        ) : null}
        <div>
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            &laquo; Previous
          </button>
          <span>
            {' '}Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong>{' '}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next &raquo;
          </button>
        </div>
      </div>
      <hr />
    </nav>
  );
};

export default Pagination;
