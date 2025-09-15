'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ 
  pagination, 
  onPageChange,
  showInfo = true,
  showFirstLast = true 
}) => {
  if (!pagination) return null;

  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    itemsInCurrentPage,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage
  } = pagination;

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
      {showInfo && (
        <div className="text-sm text-slate-700 dark:text-slate-300">
          Mostrando {itemsInCurrentPage} de {totalItems} elementos
          {itemsPerPage && ` (${itemsPerPage} por página)`}
        </div>
      )}

      <div className="flex items-center gap-1">
        {/* First Page */}
        {showFirstLast && currentPage > 3 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="p-2 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Primera página"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-slate-400">...</span>
          </>
        )}

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(prevPage)}
          disabled={!hasPrevPage}
          className="p-2 border border-slate-300 dark:border-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-3 py-2 border rounded transition-colors ${
              pageNum === currentPage
                ? 'bg-yellow-500 border-yellow-500 text-white'
                : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {pageNum}
          </button>
        ))}

        {/* Next Page */}
        <button
          onClick={() => onPageChange(nextPage)}
          disabled={!hasNextPage}
          className="p-2 border border-slate-300 dark:border-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        {showFirstLast && currentPage < totalPages - 2 && (
          <>
            <span className="px-2 text-slate-400">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className="p-2 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Última página"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Pagination;