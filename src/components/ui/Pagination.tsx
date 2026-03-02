/**
 * Pagination Component
 * 
 * A reusable pagination component for displaying and navigating through paginated data.
 * Displays current page, total pages, item range, and provides Previous/Next navigation.
 * 
 * @param currentPage - The current active page number (1-indexed)
 * @param totalPages - The total number of pages available
 * @param totalItems - Optional total number of items across all pages
 * @param pageSize - Optional number of items per page (used with totalItems for range display)
 * @param onPageChange - Callback function called when page changes, receives new page number
 */

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
};

/**
 * Helper function to safely get current page number
 * Ensures page is always at least 1
 */
function getCurrentPageSafe(page: number): number {
  return page > 0 ? page : 1;
}

/**
 * Helper function to generate page range text
 * Formats as "X–Y of Z" (e.g., "1–10 of 50")
 */
function getPageRangeText(page: number, size: number, total: number): string {
  const start = (page - 1) * size + 1;
  const end = Math.min(page * size, total);
  return `${start}–${end} of ${total}`;
}

/**
 * Pagination Component
 * 
 * Renders pagination controls with page information and navigation buttons.
 * Only displays when totalPages > 1 to avoid showing pagination for single-page results.
 */
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  // Don't render pagination if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  // Calculate navigation button states
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Get safe current page value
  const safeCurrentPage = getCurrentPageSafe(currentPage);

  /**
   * Handle Previous button click
   * Only navigates if previous page is available
   */
  const handlePrev = () => {
    if (canGoPrev) {
      onPageChange(currentPage - 1);
    }
  };

  /**
   * Handle Next button click
   * Only navigates if next page is available
   */
  const handleNext = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
      {/* Page information text */}
      <div className="text-sm text-gray-600">
        Page {safeCurrentPage} of {totalPages || 1}
        {/* Show item range if totalItems and pageSize are provided */}
        {typeof totalItems === 'number' && typeof pageSize === 'number' ? (
          <> • {getPageRangeText(safeCurrentPage, pageSize, totalItems)}</>
        ) : null}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-2">
        {/* Previous button */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={!canGoPrev}
          className="btn-secondary btn-sm disabled:opacity-50"
        >
          Prev
        </button>

        {/* Next button */}
        <button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          className="btn-secondary btn-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;
