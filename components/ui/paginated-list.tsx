"use client";

import { Children, useMemo, useState, type ReactNode } from "react";

const DEFAULT_PAGE_SIZE = 10;

type PaginatedListProps = {
  children: ReactNode;
  className?: string;
  itemLabel?: string;
  pageSize?: number;
};

function getVisiblePages(currentPage: number, totalPages: number) {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);

  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

export function PaginatedList({
  children,
  className = "space-y-4",
  itemLabel = "записей",
  pageSize = DEFAULT_PAGE_SIZE,
}: PaginatedListProps) {
  const items = useMemo(() => Children.toArray(children), [children]);
  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const safePage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safePage - 1) * pageSize;
  const visibleItems = items.slice(pageStartIndex, pageStartIndex + pageSize);
  const visibleStart = totalItems === 0 ? 0 : pageStartIndex + 1;
  const visibleEnd = Math.min(pageStartIndex + pageSize, totalItems);

  return (
    <div className="space-y-4">
      <div className={className}>{visibleItems}</div>

      {totalItems > pageSize ? (
        <div className="foodlike-card flex flex-col gap-3 px-3 py-3 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Показано {visibleStart}-{visibleEnd} из {totalItems} {itemLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            <PaginationButton
              disabled={safePage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Назад
            </PaginationButton>
            {getVisiblePages(safePage, totalPages).map((page) => (
              <PaginationButton
                key={page}
                isActive={page === safePage}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </PaginationButton>
            ))}
            <PaginationButton
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              Вперёд
            </PaginationButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PaginationButton({
  children,
  disabled,
  isActive,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "min-h-9 min-w-9 rounded-full border px-3 text-sm font-semibold transition",
        isActive
          ? "border-red-800 bg-red-800 text-white"
          : "border-red-100 bg-white text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white",
        disabled ? "cursor-not-allowed opacity-45 hover:border-red-100 hover:bg-white hover:text-red-800" : "",
      ].join(" ")}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </button>
  );
}
