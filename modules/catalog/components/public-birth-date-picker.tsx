"use client";

import { useMemo, useState } from "react";

const MONTHS = [
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

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

function formatValue(date: Date | null) {
  if (!date) {
    return "";
  }

  return [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    date.getFullYear(),
  ].join(".");
}

function toIsoDate(date: Date | null) {
  if (!date) {
    return "";
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function buildCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function sameDate(a: Date | null, b: Date) {
  return (
    a?.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function PublicBirthDatePicker() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [isOpen, setIsOpen] = useState(false);
  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);

  function changeMonth(delta: number) {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  function changeYear(delta: number) {
    setViewDate((current) => new Date(current.getFullYear() + delta, current.getMonth(), 1));
  }

  return (
    <label className="relative block space-y-2">
      <span className="text-sm font-semibold text-[#3a292d]">Дата рождения</span>
      <input type="hidden" name="birthDate" value={toIsoDate(selectedDate)} />
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="foodlike-field flex min-h-12 items-center justify-between rounded-[8px] text-left"
      >
        <span className={selectedDate ? "text-[#241316]" : "text-[#a98f95]"}>
          {formatValue(selectedDate) || "дд.мм.гггг"}
        </span>
        <span className="flex size-8 items-center justify-center rounded-full bg-[#fff1f2] text-[#b00012]">
          <CalendarIcon className="size-4" />
        </span>
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+10px)] z-[60] w-[320px] rounded-[22px] border border-[#f3dadd] bg-white p-4 shadow-[0_22px_60px_rgba(90,12,20,0.2)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d50014]">
                Дата рождения
              </p>
              <p className="mt-1 text-lg font-semibold text-[#241316]">
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </p>
            </div>
            <div className="flex gap-1">
              <PickerButton label="Год назад" onClick={() => changeYear(-1)} text="‹‹" />
              <PickerButton label="Месяц назад" onClick={() => changeMonth(-1)} text="‹" />
              <PickerButton label="Месяц вперед" onClick={() => changeMonth(1)} text="›" />
              <PickerButton label="Год вперед" onClick={() => changeYear(1)} text="››" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#9b7d83]">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((date) => {
              const isCurrentMonth = date.getMonth() === viewDate.getMonth();
              const isSelected = sameDate(selectedDate, date);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => {
                    setSelectedDate(date);
                    setIsOpen(false);
                  }}
                  className={`flex aspect-square items-center justify-center rounded-full text-sm font-semibold transition ${
                    isSelected
                      ? "bg-[#d50014] text-white shadow-sm shadow-[#d50014]/24"
                      : isCurrentMonth
                        ? "text-[#3a292d] hover:bg-[#fff1f2] hover:text-[#d50014]"
                        : "text-[#c3afb4] hover:bg-[#fff8f8]"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </label>
  );
}

function PickerButton({
  label,
  onClick,
  text,
}: {
  label: string;
  onClick: () => void;
  text: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-full text-sm font-semibold text-[#6b5960] transition hover:bg-[#fff1f2] hover:text-[#d50014]"
      aria-label={label}
    >
      {text}
    </button>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18" />
    </svg>
  );
}
