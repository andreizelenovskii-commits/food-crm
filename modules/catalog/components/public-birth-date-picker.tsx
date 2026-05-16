"use client";

import { type ReactNode, useMemo, useState } from "react";

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
const AGE_PRESETS = [18, 25, 35] as const;

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

function isFutureDate(date: Date) {
  const today = new Date();
  return date > new Date(today.getFullYear(), today.getMonth(), today.getDate());
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

  function pickAge(age: number) {
    const today = new Date();
    const date = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());
    setSelectedDate(date);
    setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
    setIsOpen(false);
  }

  return (
    <label className="relative block space-y-2">
      <span className="text-sm font-semibold text-[#3a292d]">Дата рождения</span>
      <input type="hidden" name="birthDate" value={toIsoDate(selectedDate)} />
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="foodlike-field flex min-h-12 items-center justify-between rounded-[8px] bg-white text-left shadow-sm shadow-[#d50014]/6 transition hover:border-[#f2b8bf]"
      >
        <span className={selectedDate ? "text-[#241316]" : "text-[#a98f95]"}>
          {formatValue(selectedDate) || "дд.мм.гггг"}
        </span>
        <span className="flex size-8 items-center justify-center rounded-full bg-[#fff1f2] text-[#b00012]">
          <CalendarIcon className="size-4" />
        </span>
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+10px)] z-[60] w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden rounded-[8px] border border-[#f3dadd] bg-white shadow-[0_24px_70px_rgba(80,8,18,0.22)]">
          <div className="border-b border-[#f6e2e5] bg-[#fff7f8] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d50014]">
                  Дата рождения
                </p>
                <p className="mt-1 text-xl font-semibold text-[#241316]">
                  {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                </p>
              </div>
              <div className="flex gap-1">
                <PickerButton label="На год назад" onClick={() => changeYear(-1)}>
                  <DoubleChevronLeftIcon className="size-4" />
                </PickerButton>
                <PickerButton label="На месяц назад" onClick={() => changeMonth(-1)}>
                  <ChevronLeftIcon className="size-4" />
                </PickerButton>
                <PickerButton label="На месяц вперед" onClick={() => changeMonth(1)}>
                  <ChevronRightIcon className="size-4" />
                </PickerButton>
                <PickerButton label="На год вперед" onClick={() => changeYear(1)}>
                  <DoubleChevronRightIcon className="size-4" />
                </PickerButton>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {AGE_PRESETS.map((age) => (
                <button
                  key={age}
                  type="button"
                  onClick={() => pickAge(age)}
                  className="min-h-9 rounded-full border border-[#f0cfd3] bg-white px-3 text-xs font-semibold text-[#6b5960] transition hover:border-[#d50014] hover:text-[#b00012]"
                >
                  {age} лет
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#9b7d83]">
              {WEEKDAYS.map((day) => (
                <span key={day} className="py-1">
                  {day}
                </span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {days.map((date) => {
                const disabled = isFutureDate(date);
                const isCurrentMonth = date.getMonth() === viewDate.getMonth();
                const isSelected = sameDate(selectedDate, date);

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setSelectedDate(date);
                      setIsOpen(false);
                    }}
                    className={`flex aspect-square items-center justify-center rounded-full text-sm font-semibold transition disabled:cursor-not-allowed disabled:text-[#e4d7da] ${
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
        </div>
      ) : null}
    </label>
  );
}

function PickerButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-full text-sm font-semibold text-[#6b5960] transition hover:bg-[#fff1f2] hover:text-[#d50014]"
      aria-label={label}
    >
      {children}
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

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={className} aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={className} aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function DoubleChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={className} aria-hidden="true">
      <path d="m11 17-5-5 5-5" />
      <path d="m18 17-5-5 5-5" />
    </svg>
  );
}

function DoubleChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={className} aria-hidden="true">
      <path d="m6 17 5-5-5-5" />
      <path d="m13 17 5-5-5-5" />
    </svg>
  );
}
