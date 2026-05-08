import { CALENDAR_WEEKDAYS, clampScheduleHours } from "@/modules/employees/employees.schedule";

const WEEKDAY_NUMBERS = [1, 2, 3, 4, 5, 6, 0] as const;
const WEEKDAY_PRESETS = [
  { label: "Будни", weekdays: [1, 2, 3, 4, 5] },
  { label: "Выходные", weekdays: [6, 0] },
  { label: "Все дни", weekdays: [...WEEKDAY_NUMBERS] },
] as const;

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
  const hasSelectedDays = selectedWeekdays.length > 0;
  const selectedWeekdayKey = selectedWeekdays.join(",");

  return (
    <div className="space-y-3 rounded-[18px] border border-white/70 bg-white/78 p-3 shadow-sm shadow-red-950/5 backdrop-blur-xl sm:p-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Шаблон месяца</p>
        <h3 className="mt-1 text-base font-semibold text-zinc-950">Массовое заполнение</h3>
      </div>

      <div className="rounded-[16px] border border-red-950/10 bg-white/74 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">Часы смены</p>
        <div className="mt-3 grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2">
          <button
            type="button"
            onClick={() => onTemplateHoursChange(clampScheduleHours(templateHours - 1))}
            className="flex h-9 w-10 items-center justify-center rounded-full border border-red-100 bg-white/90 text-base font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
            aria-label="Уменьшить часы шаблона"
          >
            −
          </button>
          <div className="flex h-12 items-center justify-center rounded-[16px] border border-red-950/10 bg-white/90 text-xl font-semibold text-zinc-950 shadow-sm shadow-red-950/5">
            {templateHours} ч
          </div>
          <button
            type="button"
            onClick={() => onTemplateHoursChange(clampScheduleHours(templateHours + 1))}
            className="flex h-9 w-10 items-center justify-center rounded-full border border-red-100 bg-white/90 text-base font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
            aria-label="Увеличить часы шаблона"
          >
            +
          </button>
        </div>
      </div>

      <div className="rounded-[16px] border border-red-950/10 bg-white/74 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">Дни недели</p>
          <span className="text-xs font-semibold text-zinc-400">{selectedWeekdays.length}/7</span>
        </div>
        <div className="mt-3 grid gap-1.5">
          {WEEKDAY_PRESETS.map((preset) => {
            const isActive = selectedWeekdayKey === preset.weekdays.join(",");

            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onSetWeekdays([...preset.weekdays])}
                className={`flex h-9 items-center justify-between rounded-[12px] border px-3 text-xs font-semibold transition ${
                  isActive
                    ? "border-red-800 bg-red-800 text-white shadow-sm shadow-red-950/15"
                    : "border-red-950/10 bg-white/86 text-zinc-700 hover:border-red-200 hover:bg-red-50 hover:text-red-800"
                }`}
              >
                <span>{preset.label}</span>
                <span className={isActive ? "text-white/70" : "text-zinc-400"}>{preset.weekdays.length}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 overflow-hidden rounded-[14px] border border-red-950/10 bg-white/82 p-1.5">
          {CALENDAR_WEEKDAYS.map((label, index) => {
            const weekday = WEEKDAY_NUMBERS[index];
            const isSelected = selectedWeekdays.includes(weekday);

            return (
              <button
                key={label}
                type="button"
                onClick={() => onToggleWeekday(weekday)}
                className={`h-9 rounded-[10px] text-xs font-semibold transition ${
                  isSelected
                    ? "bg-red-800 text-white shadow-sm shadow-red-950/15"
                    : "text-zinc-500 hover:bg-red-50 hover:text-red-800"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-2">
        <button type="button" onClick={onApplyTemplate} disabled={!hasSelectedDays} className="h-11 rounded-[14px] bg-red-800 px-4 text-sm font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-300">
          Применить к месяцу
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onClearSelected} disabled={!hasSelectedDays} className="h-10 rounded-[14px] border border-red-100 bg-white/90 px-3 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
            Выходные
          </button>
          <button type="button" onClick={onClearMonth} className="h-10 rounded-[14px] border border-red-100 bg-white/90 px-3 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
            Очистить
          </button>
        </div>
      </div>
    </div>
  );
}
