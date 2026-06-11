"use client";

import { useState } from "react";
import type { SalesPeriod } from "@/modules/sales/sales.periods";

type PickerOption = {
  value: string;
  label: string;
};

type SalesDateParts = {
  day: string;
  month: string;
  year: string;
  days: string[];
  months: PickerOption[];
  years: string[];
};

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="5" width="18" height="16" rx="4" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
    </svg>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function PickerButton({
  id,
  label,
  value,
  options,
  isOpen,
  onOpen,
  onChange,
  wide = false,
}: {
  id: string;
  label: string;
  value: string;
  options: PickerOption[];
  isOpen: boolean;
  onOpen: () => void;
  onChange: (value: string) => void;
  wide?: boolean;
}) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? value;

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={label}
        onClick={onOpen}
        className={[
          "inline-flex h-9 items-center justify-between gap-2 rounded-full bg-white/70 px-3 text-[15px] font-semibold text-zinc-950 transition hover:bg-white focus:outline-none focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-red-900/10",
          wide ? "min-w-32" : "min-w-16",
        ].join(" ")}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronIcon className={`size-3.5 text-red-900/70 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen ? (
        <div className="absolute right-0 top-11 z-[100] w-max min-w-full overflow-hidden rounded-[18px] border border-red-950/10 bg-white p-1.5 shadow-[0_24px_60px_rgba(69,10,10,0.18)]">
          <div className="max-h-72 overflow-auto rounded-[14px]">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange(option.value)}
                  className={[
                    "block w-full rounded-[12px] px-3 py-2 text-left text-sm font-semibold transition",
                    isSelected
                      ? "bg-red-800 text-white shadow-sm shadow-red-950/10"
                      : "text-zinc-800 hover:bg-red-50 hover:text-red-900",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      <input type="hidden" name={id} value={value} />
    </div>
  );
}

export function SalesPeriodPicker({
  period,
  dateParts,
}: {
  period: SalesPeriod;
  dateParts: SalesDateParts;
}) {
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [day, setDay] = useState(dateParts.day);
  const [month, setMonth] = useState(dateParts.month);
  const [year, setYear] = useState(dateParts.year);
  const showDay = period !== "year";
  const showMonth = period !== "year";
  const dayOptions = dateParts.days.map((value) => ({ value, label: value }));
  const yearOptions = dateParts.years.map((value) => ({ value, label: value }));

  function togglePicker(id: string) {
    setOpenPicker((current) => (current === id ? null : id));
  }

  return (
    <form action="/dashboard/sales" className="flex flex-wrap gap-2">
      <input type="hidden" name="period" value={period} />
      <div className="inline-flex min-h-12 items-center gap-1.5 rounded-full border border-red-950/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,248,0.92))] py-1.5 pl-2 pr-3 text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_24px_rgba(127,29,29,0.06)] transition focus-within:border-red-900/40 focus-within:bg-white focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_0_0_3px_rgba(153,27,27,0.08),0_14px_30px_rgba(127,29,29,0.08)]">
        {showDay ? (
          <PickerButton
            id="day"
            label="День отчета"
            value={day}
            options={dayOptions}
            isOpen={openPicker === "day"}
            onOpen={() => togglePicker("day")}
            onChange={(value) => {
              setDay(value);
              setOpenPicker(null);
            }}
          />
        ) : null}
        {showMonth ? (
          <PickerButton
            id="month"
            label="Месяц отчета"
            value={month}
            options={dateParts.months}
            isOpen={openPicker === "month"}
            onOpen={() => togglePicker("month")}
            onChange={(value) => {
              setMonth(value);
              setOpenPicker(null);
            }}
            wide
          />
        ) : null}
        <PickerButton
          id="year"
          label="Год отчета"
          value={year}
          options={yearOptions}
          isOpen={openPicker === "year"}
          onOpen={() => togglePicker("year")}
          onChange={(value) => {
            setYear(value);
            setOpenPicker(null);
          }}
        />
        <CalendarIcon className="pointer-events-none size-5 shrink-0 text-red-900" />
      </div>
      <button type="submit" className="foodlike-button-primary">Показать</button>
    </form>
  );
}
