import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const { isDark } = useTheme();

  if (totalItems === 0) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div
      className={`px-4 sm:px-6 py-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none ${
        isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-600"
      }`}
    >
      <div className="flex items-center gap-3 text-xs">
        <span>
          Showing <strong className={isDark ? "text-white" : "text-slate-900"}>{startItem}</strong> to{" "}
          <strong className={isDark ? "text-white" : "text-slate-900"}>{endItem}</strong> of{" "}
          <strong className={isDark ? "text-white" : "text-slate-900"}>{totalItems}</strong> entries
        </span>

        {onPageSizeChange && (
          <div className="hidden md:flex items-center gap-1.5 ml-2">
            <span className="text-[11px] text-slate-400">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className={`px-2 py-1 rounded-lg border text-xs outline-none cursor-pointer transition-all ${
                isDark
                  ? "bg-white/[0.04] border-white/10 text-white focus:border-orange-500/60"
                  : "bg-white border-slate-200 text-slate-800 focus:border-orange-500/60 shadow-xs"
              }`}
            >
              {pageSizeOptions.map((opt) => (
                <option
                  key={opt}
                  value={opt}
                  className={isDark ? "bg-[#0b0f1e] text-white" : "bg-white text-slate-900"}
                >
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
            isDark
              ? "border-white/10 hover:bg-white/10 text-slate-300"
              : "border-slate-200 hover:bg-slate-100 text-slate-700"
          }`}
          title="First Page"
        >
          <ChevronsLeft size={14} />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
            isDark
              ? "border-white/10 hover:bg-white/10 text-slate-300"
              : "border-slate-200 hover:bg-slate-100 text-slate-700"
          }`}
          title="Previous Page"
        >
          <ChevronLeft size={14} />
        </button>

        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-slate-400 select-none text-xs"
                >
                  ...
                </span>
              );
            }
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs shadow-orange-500/30"
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
            isDark
              ? "border-white/10 hover:bg-white/10 text-slate-300"
              : "border-slate-200 hover:bg-slate-100 text-slate-700"
          }`}
          title="Next Page"
        >
          <ChevronRight size={14} />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
            isDark
              ? "border-white/10 hover:bg-white/10 text-slate-300"
              : "border-slate-200 hover:bg-slate-100 text-slate-700"
          }`}
          title="Last Page"
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
}
