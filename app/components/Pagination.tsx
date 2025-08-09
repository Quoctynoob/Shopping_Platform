"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Generate an array of page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    // If we have 5 or fewer pages, show all of them
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }
    
    // Always include the first page
    pageNumbers.push(1);
    
    // Calculate the start and end pages to show
    let startPage = Math.max(currentPage - 1, 2);
    let endPage = Math.min(startPage + 2, totalPages - 1);
    
    // Adjust if we're near the end
    if (endPage === totalPages - 1) {
      startPage = Math.max(endPage - 2, 2);
    }
    
    // Add ellipsis if needed
    if (startPage > 2) {
      pageNumbers.push(-1); // Use -1 to represent ellipsis "..."
    }
    
    // Add the middle pages
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push(-2); // Use -2 to represent another ellipsis "..."
    }
    
    // Always include the last page
    pageNumbers.push(totalPages);
    
    return pageNumbers;
  };

  // If there's only 1 page, don't show pagination
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center my-8">
      <nav className="flex items-center space-x-2">
        {/* Previous button */}
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <span>←</span>
        </button>
        
        {/* Page numbers */}
        {pageNumbers.map((pageNum, index) => {
          // Render ellipsis
          if (pageNum < 0) {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2">
                ...
              </span>
            );
          }
          
          // Render regular page number
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-4 py-2 rounded-md ${
                currentPage === pageNum
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              aria-current={currentPage === pageNum ? "page" : undefined}
            >
              {pageNum}
            </button>
          );
        })}
        
        {/* Next button */}
        <button
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <span>→</span>
        </button>
      </nav>
    </div>
  );
}