"use client";

import type { ReactNode } from "react";

export function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[14px] border border-red-950/10 bg-white/76 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/65">{label}</p>
      <p className="mt-1 text-xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

export function ControlRow({
  actionLabel,
  children,
  hint,
  label,
  onAction,
  value,
}: {
  actionLabel: string;
  children: ReactNode;
  hint: string;
  label: string;
  onAction: () => void;
  value: string;
}) {
  return (
    <div className="grid gap-3 rounded-[14px] border border-red-950/10 bg-white/76 p-3 md:grid-cols-[1fr_auto_auto] md:items-center">
      <div>
        <p className="text-sm font-semibold text-zinc-950">{label}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{hint}</p>
      </div>
      <p className="text-sm font-semibold text-red-800">{value}</p>
      <div className="flex items-center gap-2">
        {children}
        <button type="button" onClick={onAction} className="foodlike-button-secondary min-h-9 px-4 text-xs">
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

export function EditableCard({ hint, onEdit, title, value }: { hint: string; onEdit: () => void; title: string; value: string }) {
  return (
    <button type="button" onClick={onEdit} className="rounded-[14px] border border-red-950/10 bg-white/76 p-3 text-left transition hover:border-red-200 hover:bg-white">
      <span className="block text-sm font-semibold text-zinc-950">{title}</span>
      <span className="mt-1 block text-sm font-semibold text-red-800">{value}</span>
      <span className="mt-1 block text-xs leading-5 text-zinc-500">{hint}</span>
    </button>
  );
}

export function Switch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 rounded-[12px] transition ${checked ? "bg-red-800" : "bg-zinc-200"}`}
    >
      <span className={`absolute top-1 size-6 rounded-[9px] bg-white shadow-sm transition ${checked ? "left-7" : "left-1"}`} />
    </button>
  );
}
