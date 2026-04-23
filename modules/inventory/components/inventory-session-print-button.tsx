"use client";

export function InventorySessionPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 print:hidden"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M7 9V4h10v5" />
        <path d="M7 14H6a2 2 0 0 1-2-2v-1.5A2.5 2.5 0 0 1 6.5 8h11A2.5 2.5 0 0 1 20 10.5V12a2 2 0 0 1-2 2h-1" />
        <path d="M7 12h10v8H7z" />
        <path d="M9.5 16h5" />
      </svg>
      <span>Распечатать / PDF</span>
    </button>
  );
}
