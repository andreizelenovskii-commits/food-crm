"use client";

import { useState } from "react";

const MONTH_NAMES = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
] as const;

type EmployeeDatePickerProps = {
  name: string;
  label: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
};

function formatPreview(value: string) {
  if (!value) return "Выберите дату";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function EmployeeDatePicker({
  name,
  label,
  defaultValue = "",
  value: controlledValue,
  onChange,
  placeholder = "Выберите дату",
}: EmployeeDatePickerProps) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = isControlled ? controlledValue ?? "" : internalValue;
  const [draftValue, setDraftValue] = useState(value);
  const [pickerOpen, setPickerOpen] = useState(false);
  const raw = pickerOpen ? draftValue || value : value || defaultValue;
  const parsed = raw ? new Date(raw) : new Date();
  const parsedDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;

  const selectedDay = parsedDate.getDate();
  const selectedMonth = parsedDate.getMonth();
  const selectedYear = parsedDate.getFullYear();
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const currentYear = new Date().getFullYear();

  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const years = Array.from({ length: 101 }, (_, index) => currentYear - index);
  const setDateValue = (day: number, month: number, year: number) => {
    const nextDay = Math.min(day, new Date(year, month + 1, 0).getDate());
    const next = new Date(year, month, nextDay);
    setDraftValue(formatISODate(next));
  };

  const updateDay = (day: number) => setDateValue(day, selectedMonth, selectedYear);
  const updateMonth = (month: number) => setDateValue(selectedDay, month, selectedYear);
  const updateYear = (year: number) => setDateValue(selectedDay, selectedMonth, year);
  const setToday = () => {
    const today = new Date();
    const iso = formatISODate(today);
    setDraftValue(iso);
    if (isControlled) {
      onChange?.(iso);
    } else {
      setInternalValue(iso);
    }
    setPickerOpen(false);
  };

  const saveDate = () => {
    if (isControlled) {
      onChange?.(draftValue);
    } else {
      setInternalValue(draftValue);
    }
    setPickerOpen(false);
  };

  const clearDate = () => {
    if (isControlled) {
      onChange?.("");
    } else {
      setInternalValue("");
    }
    setDraftValue("");
    setPickerOpen(false);
  };

  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold text-zinc-700">{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            const currentValue = isControlled ? controlledValue ?? "" : internalValue;
            setDraftValue(currentValue || formatISODate(new Date()));
            setPickerOpen(true);
          }}
          onDoubleClick={clearDate}
          className="flex h-9 w-full items-center rounded-full border border-red-950/10 bg-white/85 px-4 text-left text-zinc-950 transition hover:border-red-200 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-800/10"
        >
          <span className="block truncate text-xs font-medium text-zinc-900">
            {value ? formatPreview(value) : placeholder}
          </span>
        </button>

        {pickerOpen && (
          <div className="absolute left-0 top-full z-20 mt-3 w-full overflow-hidden rounded-[14px] border border-zinc-200 bg-white shadow-lg">
            <div className="flex items-center justify-center border-b border-zinc-200 bg-red-50/50 px-4 py-3">
              <div className="text-center">
                <p key={`${selectedMonth}-${selectedYear}`} className="animate-[date-picker-flip_220ms_ease-out] text-xs font-semibold text-zinc-950">
                  {MONTH_NAMES[selectedMonth]} {selectedYear}
                </p>
                <p className="text-[11px] text-zinc-500">По умолчанию открывается сегодня</p>
              </div>
            </div>
            <div className="grid animate-[date-picker-flip_220ms_ease-out] gap-3 p-3 sm:grid-cols-3">
              <div className="rounded-[14px] border border-red-950/10 bg-white/70 p-2.5">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">День</div>
                <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-zinc-100">
                  {days.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => updateDay(day)}
                      className={`mb-1.5 flex h-8 w-full items-center justify-center rounded-full px-3 text-xs font-semibold transition ${
                        day === selectedDay
                          ? 'bg-red-800 text-white'
                          : 'border border-red-100 bg-white text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[14px] border border-red-950/10 bg-white/70 p-2.5">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">Месяц</div>
                <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-zinc-100">
                  {MONTH_NAMES.map((month, index) => (
                    <button
                      key={month}
                      type="button"
                      onClick={() => updateMonth(index)}
                      className={`mb-1.5 flex h-8 w-full items-center justify-center rounded-full px-3 text-xs font-semibold transition ${
                        index === selectedMonth
                          ? 'bg-red-800 text-white'
                          : 'border border-red-100 bg-white text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white'
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[14px] border border-red-950/10 bg-white/70 p-2.5">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">Год</div>
                <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-zinc-100">
                  {years.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => updateYear(year)}
                      className={`mb-1.5 flex h-8 w-full items-center justify-center rounded-full px-3 text-xs font-semibold transition ${
                        year === selectedYear
                          ? 'bg-red-800 text-white'
                          : 'border border-red-100 bg-white text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-red-950/10 px-3 py-3">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  saveDate();
                }}
                className="inline-flex h-8 items-center rounded-full border border-red-100 bg-white px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
              >
                Сохранить
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setToday();
                }}
                className="inline-flex h-8 items-center rounded-full border border-red-100 bg-white px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
              >
                Сегодня
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  clearDate();
                }}
                className="inline-flex h-8 items-center rounded-full border border-red-100 bg-white px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
              >
                Очистить
              </button>
            </div>
          </div>
        )}
      </div>
      <input type="hidden" name={name} value={value} />
    </label>
  );
}
