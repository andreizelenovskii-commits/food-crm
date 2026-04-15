"use client";

import { useEffect, useMemo, useState } from "react";

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
  placeholder = "Выберите дату",
}: EmployeeDatePickerProps) {
  const [value, setValue] = useState(defaultValue);
  const [draftValue, setDraftValue] = useState(defaultValue);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    setValue(defaultValue);
    setDraftValue(defaultValue);
  }, [defaultValue]);

  const parsedDate = useMemo(() => {
    const raw = pickerOpen ? draftValue || defaultValue : value || defaultValue;
    const parsed = raw ? new Date(raw) : new Date();
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [draftValue, pickerOpen, value, defaultValue]);

  const selectedDay = parsedDate.getDate();
  const selectedMonth = parsedDate.getMonth();
  const selectedYear = parsedDate.getFullYear();
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const currentYear = new Date().getFullYear();

  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, index) => index + 1), [daysInMonth]);
  const years = useMemo(
    () => Array.from({ length: currentYear - 1926 + 1 }, (_, index) => 1926 + index),
    [currentYear],
  );

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
    setValue(iso);
    setPickerOpen(false);
  };

  const saveDate = () => {
    setValue(draftValue);
    setPickerOpen(false);
  };

  const clearDate = () => {
    setValue("");
    setDraftValue("");
    setPickerOpen(false);
  };

  return (
    <label className="block space-y-2">
      <span className="font-medium text-zinc-900">{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setDraftValue(value);
            setPickerOpen(true);
          }}
          onDoubleClick={clearDate}
          className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-left text-zinc-950 transition hover:border-zinc-500 focus:border-zinc-500 focus:outline-none"
        >
          <span className="block text-sm font-medium text-zinc-900">
            {value ? formatPreview(value) : placeholder}
          </span>
          <span className="text-xs text-zinc-500">Двойной клик очистит дату</span>
        </button>

        {pickerOpen && (
          <div className="absolute left-0 top-full z-20 mt-3 w-full overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-lg">
            <div className="grid gap-4 p-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-3">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">День</div>
                <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-zinc-100">
                  {days.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => updateDay(day)}
                      className={`mb-2 flex w-full items-center justify-center rounded-2xl px-3 py-2 text-sm transition ${
                        day === selectedDay
                          ? 'bg-zinc-950 text-white'
                          : 'bg-white text-zinc-950 hover:bg-zinc-100'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-3">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Месяц</div>
                <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-zinc-100">
                  {MONTH_NAMES.map((month, index) => (
                    <button
                      key={month}
                      type="button"
                      onClick={() => updateMonth(index)}
                      className={`mb-2 flex w-full items-center justify-center rounded-2xl px-3 py-2 text-sm transition ${
                        index === selectedMonth
                          ? 'bg-zinc-950 text-white'
                          : 'bg-white text-zinc-950 hover:bg-zinc-100'
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-3">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Год</div>
                <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-zinc-100">
                  {years.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => updateYear(year)}
                      className={`mb-2 flex w-full items-center justify-center rounded-2xl px-3 py-2 text-sm transition ${
                        year === selectedYear
                          ? 'bg-zinc-950 text-white'
                          : 'bg-white text-zinc-950 hover:bg-zinc-100'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-zinc-200 px-4 py-3">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  saveDate();
                }}
                className="rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
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
                className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:border-zinc-500"
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
                className="rounded-2xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
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
