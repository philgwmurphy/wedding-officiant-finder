"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    const queryString = params.toString();
    return `${basePath}${queryString ? `?${queryString}` : ""}`;
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const showPages = 5; // Number of page buttons to show

    if (totalPages <= showPages + 2) {
      // Show all pages if there aren't many
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if at the edges
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, 4);
      } else if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }

      // Add ellipsis if needed before range
      if (start > 2) {
        pages.push("...");
      }

      // Add pages in range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed after range
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="flex items-center justify-center gap-1 mt-8"
      aria-label="Pagination"
    >
      {/* Previous button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Previous
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed">
          Previous
        </span>
      )}

      {/* Page numbers */}
      <div className="hidden sm:flex items-center gap-1">
        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-sm text-gray-500"
            >
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={createPageUrl(page)}
              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                page === currentPage
                  ? "bg-violet-600 text-white"
                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </Link>
          )
        )}
      </div>

      {/* Mobile page indicator */}
      <span className="sm:hidden px-3 py-2 text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Next
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed">
          Next
        </span>
      )}
    </nav>
  );
}
