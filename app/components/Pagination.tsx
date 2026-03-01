'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPageNumbers } from '@/lib/utils/pagination';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  isLoading = false,
}) => {
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const start = Math.max(1, (currentPage - 1) * pageSize + 1);
  const end = Math.min(totalItems, currentPage * pageSize);

  const handlePrevious = () => {
    if (currentPage > 1 && !isLoading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !isLoading) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: string | number) => {
    if (typeof page === 'number' && page !== currentPage && !isLoading) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 py-4 md:flex-row">
      {/* Results info */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing <span className="font-semibold">{start}</span> to <span className="font-semibold">{end}</span> of{' '}
        <span className="font-semibold">{totalItems}</span> results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1 || isLoading}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, idx) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-gray-500 dark:text-gray-400">
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              disabled={isLoading}
              className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium ${
                isActive
                  ? 'border border-red-500 bg-red-500 text-white dark:border-red-600 dark:bg-red-600'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
              aria-label={`Page ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || isLoading}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Page info */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
      </div>
    </div>
  );
};

export default Pagination;
