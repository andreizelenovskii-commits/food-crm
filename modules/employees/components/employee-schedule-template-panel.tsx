import {
  CALENDAR_WEEKDAYS,
  MAX_SCHEDULE_HOURS,
  MIN_SCHEDULE_HOURS,
  clampScheduleHours,
} from "@/modules/employees/employees.schedule";

const WEEKDAY_NUMBERS = [1, 2, 3, 4, 5, 6, 0] as const;
const HOUR_OPTIONS = Array.from(
  { length: MAX_SCHEDULE_HOURS - MIN_SCHEDULE_HOURS + 1 },
  (_, index) => MIN_SCHEDULE_HOURS + index,
);

export function EmployeeScheduleTemplatePanel({
  selectedWeekdays,
  templateHours,
  onTemplateHoursChange,
  onSetWeekdays,
  onToggleWeekday,
  onApplyTemplate,
  onClearSelected,
  onClearMonth,
}: {
  selectedWeekdays: number[];
  templateHours: number;
  onTemplateHoursChange: (hours: number) => void;
  onSetWeekdays: (weekdays: number[]) => void;
  onToggleWeekday: (weekday: number) => void;
  onApplyTemplate: () => void;
  onClearSelected: () => void;
  onClearMonth: () => void;
}) {
  return (
    <div className="space-y-5 rounded-[12px] border border-zinc-200 bg-white p-4">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Шаблон месяца</p>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-900">Часы для выбранных дней</span>
          <select
            value={templateHours}
            onChange={(event) => onTemplateHoursChange(clampScheduleHours(Number(event.target.value)))}
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          >
            {HOUR_OPTIONS.map((hours) => (
              <option key={hours} value={hours}>
                {hours} ч
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-zinc-900">Дни недели для массового заполнения</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onSetWeekdays([1, 2, 3, 4, 5])} className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-500">
            Будни
          </button>
          <button type="button" onClick={() => onSetWeekdays([6, 0])} className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-500">
            Выходные
          </button>
          <button type="button" onClick={() => onSetWeekdays([...WEEKDAY_NUMBERS])} className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-500">
            Все
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {CALENDAR_WEEKDAYS.map((label, index) => {
            const weekday = WEEKDAY_NUMBERS[index];
            const isSelected = selectedWeekdays.includes(weekday);

            return (
              <button
                key={label}
                type="button"
                onClick={() => onToggleWeekday(weekday)}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  isSelected
                    ? "bg-zinc-950 text-white"
                    : "border border-zinc-300 bg-white text-zinc-950 hover:bg-zinc-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <button type="button" onClick={onApplyTemplate} className="min-h-12 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800">
            Заполнить месяц
          </button>
          <button type="button" onClick={onClearSelected} className="min-h-12 rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-950 transition hover:border-zinc-500">
            Снять выбранные дни
          </button>
          <button type="button" onClick={onClearMonth} className="min-h-12 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 transition hover:bg-red-100 sm:col-span-2 xl:col-span-1">
            Очистить месяц
          </button>
        </div>
      </div>
    </div>
  );
}
