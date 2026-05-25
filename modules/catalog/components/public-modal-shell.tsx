"use client";

import { type ReactNode, useEffect } from "react";

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function PublicModalOverlay({
  children,
  labelledBy,
  onClose,
}: {
  children: ReactNode;
  labelledBy: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#211316]/58 px-4 py-6 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}

export function PublicModalCloseButton({
  className = "",
  label = "Закрыть окно",
  onClose,
}: {
  className?: string;
  label?: string;
  onClose: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClose}
      className={`flex size-11 items-center justify-center rounded-full border border-[#f1d6d9] bg-white text-[#b00012] shadow-sm shadow-[#d50014]/5 transition hover:border-[#d50014] hover:bg-[#fff1f2] hover:text-[#d50014] ${className}`}
      aria-label={label}
    >
      <CloseIcon className="size-5" />
    </button>
  );
}
