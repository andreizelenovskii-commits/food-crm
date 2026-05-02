"use client";

import { MAX_SCHEDULE_HOURS, MIN_SCHEDULE_HOURS, clampScheduleHours } from "@/modules/employees/employees.schedule";

export type EmployeeDayDraft = {
  dateKey: string;
  isWorkingDay: boolean;
  hours: number;
};

const HOUR_OPTIONS = Array.from(
  { length: MAX_SCHEDULE_HOURS - MIN_SCHEDULE_HOURS + 1 },
  (_, index) => MIN_SCHEDULE_HOURS + index,
);

export function EmployeeDayScheduleDialog({
  draft,
  title,
  onChange,
  onClose,
  onApply,
}: {
  draft: EmployeeDayDraft;
  title: string;
  onChange: (draft: EmployeeDayDraft) => void;
  onClose: () => void;
  onApply: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/35 px-4">
      <div className="w-full max-w-md rounded-[14px] border border-zinc-200 bg-white p-5 shadow-2xl shadow-zinc-950/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Дата</p>
            <h3 className="mt-1 text-lg font-semibold capitalize text-zinc-950">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Закрыть
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onChange({ ...draft, isWorkingDay: true })}
              className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                draft.isWorkingDay
                  ? "bg-zinc-950 text-white"
                  : "border border-zinc-300 bg-white text-zinc-950 hover:bg-zinc-50"
              }`}
            >
              Рабочий день
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...draft, isWorkingDay: false })}
              className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                !draft.isWorkingDay
                  ? "bg-zinc-950 text-white"
                  : "border border-zinc-300 bg-white text-zinc-950 hover:bg-zinc-50"
              }`}
            >
              Выходной
            </button>
          </div>

          {draft.isWorkingDay ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-900">Рабочие часы</span>
              <select
                value={draft.hours}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    hours: clampScheduleHours(Number(event.target.value)),
                  })
                }
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
              >
                {HOUR_OPTIONS.map((hours) => (
                  <option key={hours} value={hours}>
                    {hours} ч
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm leading-6 text-zinc-600">
              Этот день будет сохранён как выходной и исчезнет из списка рабочих дней.
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onApply}
            className="flex-1 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Сохранить день
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-950 transition hover:border-zinc-500"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
