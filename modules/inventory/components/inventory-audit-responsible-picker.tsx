"use client";

import { useState } from "react";
import type { InventoryResponsibleOption } from "@/modules/inventory/inventory.types";

export function InventoryAuditResponsiblePicker({
  options,
  selectedResponsibleId,
  onChange,
}: {
  options: InventoryResponsibleOption[];
  selectedResponsibleId: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => String(option.id) === selectedResponsibleId);

  function selectResponsible(value: string) {
    onChange(value);
    setIsOpen(false);
  }

  return (
    <div className="relative space-y-1.5 rounded-[20px] border border-red-950/10 bg-white/62 p-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">Ответственный</span>
      <input type="hidden" name="responsibleEmployeeId" value={selectedResponsibleId} />
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex min-h-9 w-full items-center justify-between gap-3 rounded-full border border-red-950/10 bg-white/90 px-4 py-2 text-left text-[13px] font-medium leading-4 tracking-[-0.01em] text-zinc-950 outline-none transition hover:border-red-200 hover:bg-white focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
      >
        <span className="min-w-0">
          {selected ? `${selected.name} • ${selected.role}` : "Выбери сотрудника"}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={["h-4 w-4 shrink-0 text-red-800/55 transition", isOpen ? "rotate-180" : ""].join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-90 mt-2 overflow-hidden rounded-[18px] border border-red-100 bg-white/96 p-1.5 shadow-[0_18px_50px_rgba(127,29,29,0.18)] backdrop-blur-xl">
          {options.map((option) => {
            const isSelected = String(option.id) === selectedResponsibleId;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => selectResponsible(String(option.id))}
                className={["flex w-full items-start justify-between gap-3 rounded-[14px] px-3 py-2 text-left text-xs font-semibold transition", isSelected ? "bg-red-800 text-white" : "text-zinc-800 hover:bg-red-50 hover:text-red-800"].join(" ")}
              >
                <span className="min-w-0">{option.name}</span>
                <span className={["shrink-0 text-right", isSelected ? "text-white/70" : "text-zinc-400"].join(" ")}>
                  {option.role}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
