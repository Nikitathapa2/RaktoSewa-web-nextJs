/**
 * Frontend Pagination Utilities
 * Provides interfaces and helpers for handling paginated responses
 */

export interface PaginationMetadata {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}

/**
 * Parse pagination metadata from API response
 */
export const parsePaginationResponse = <T>(response: any): PaginatedResponse<T> | null => {
  if (response?.pagination && Array.isArray(response?.data)) {
    return {
      data: response.data,
      pagination: response.pagination,
    };
  }
  return null;
};

/**
 * Check if response has pagination
 */
export const hasPagination = (response: any): boolean => {
  return !!(response?.pagination && Array.isArray(response?.data));
};

/**
 * Get page numbers for pagination component
 */
export const getPageNumbers = (
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): (number | string)[] => {
  const pages: (number | string)[] = [];

  if (totalPages <= maxVisible) {
    // Show all pages
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Show truncated page numbers
    const leftSide = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const rightSide = Math.min(totalPages, leftSide + maxVisible - 1);
    const adjustedLeftSide = Math.max(1, rightSide - maxVisible + 1);

    if (adjustedLeftSide > 1) {
      pages.push(1);
      if (adjustedLeftSide > 2) {
        pages.push('...');
      }
    }

    for (let i = adjustedLeftSide; i <= rightSide; i++) {
      pages.push(i);
    }

    if (rightSide < totalPages) {
      if (rightSide < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
  }

  return pages;
};

/**
 * Calculate offset for displaying results
 */
export const getResultsOffset = (currentPage: number, pageSize: number): { start: number; end: number } => {
  const start = (currentPage - 1) * pageSize + 1;
  const end = currentPage * pageSize;
  return { start, end };
};
