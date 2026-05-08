"use client";

import { clampScheduleHours } from "@/modules/employees/employees.schedule";

export type EmployeeDayDraft = {
  dateKey: string;
  isWorkingDay: boolean;
  hours: number;
};

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
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-zinc-950/38 px-4 py-6 backdrop-blur-sm">
      <button type="button" onClick={onClose} className="fixed inset-0 cursor-default" aria-label="Закрыть настройку дня" />
      <div className="relative w-full max-w-lg rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.22)] sm:p-5">
        <div className="rounded-[22px] border border-white/70 bg-white/78 p-4 shadow-sm shadow-red-950/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Настройка дня</p>
              <h3 className="mt-1 text-lg font-semibold capitalize text-zinc-950">{title}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
            >
              Закрыть
            </button>
          </div>
        </div>

        <div className="mt-3 rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-sm shadow-red-950/5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-red-800/55">Тип дня</p>
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-[16px] border border-red-950/10 bg-white/84 p-1.5">
            <button
              type="button"
              onClick={() => onChange({ ...draft, isWorkingDay: true })}
              className={`h-10 rounded-[12px] text-sm font-semibold transition ${
                draft.isWorkingDay
                  ? "bg-red-800 text-white shadow-sm shadow-red-950/15"
                  : "text-zinc-600 hover:bg-red-50 hover:text-red-800"
              }`}
            >
              Рабочий
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...draft, isWorkingDay: false })}
              className={`h-10 rounded-[12px] text-sm font-semibold transition ${
                !draft.isWorkingDay
                  ? "bg-red-800 text-white shadow-sm shadow-red-950/15"
                  : "text-zinc-600 hover:bg-red-50 hover:text-red-800"
              }`}
            >
              Выходной
            </button>
          </div>

          {draft.isWorkingDay ? (
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-red-800/55">Длительность смены</p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ ...draft, hours: clampScheduleHours(draft.hours - 1) })}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-red-100 bg-white/90 text-lg font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
                  aria-label="Уменьшить часы"
                >
                  −
                </button>
                <div className="flex h-12 flex-1 items-center justify-center rounded-[16px] border border-red-950/10 bg-white/90 text-xl font-semibold text-zinc-950">
                  {draft.hours} ч
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ ...draft, hours: clampScheduleHours(draft.hours + 1) })}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-red-100 bg-white/90 text-lg font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
                  aria-label="Увеличить часы"
                >
                  +
                </button>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[4, 6, 8, 12].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => onChange({ ...draft, hours: clampScheduleHours(hours) })}
                    className={`h-9 rounded-full text-xs font-semibold transition ${
                      draft.hours === hours
                        ? "bg-red-800 text-white"
                        : "border border-red-100 bg-white/90 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"
                    }`}
                  >
                    {hours} ч
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-[16px] border border-red-950/10 bg-white/84 px-4 py-3 text-sm leading-6 text-zinc-600">
              День будет сохранён как выходной и не попадёт в рабочие часы месяца.
            </div>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onApply}
            className="flex-1 rounded-full bg-red-800 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900"
          >
            Сохранить день
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-red-100 bg-white/90 px-5 py-3 text-sm font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
