import { useState } from "react";

type Shift = {
  hours: number;
};

type DaySchedule = {
  shifts: Shift[];
};

type ScheduleData = {
  shiftsPerDay: 1 | 2;
  days: Record<string, DaySchedule>; // key: "2024-04-15"
};

type EmployeeScheduleEditorProps = {
  initialSchedule: ScheduleData;
  onSave: (schedule: ScheduleData) => void;
  onCancel: () => void;
};

export function EmployeeScheduleEditor({ initialSchedule, onSave, onCancel }: EmployeeScheduleEditorProps) {
  const [schedule, setSchedule] = useState<ScheduleData>(initialSchedule);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0]; // "2024-04-15"
  };

  const isDaySelected = (date: Date) => {
    const key = formatDateKey(date);
    return key in schedule.days;
  };

  const toggleDay = (date: Date) => {
    const key = formatDateKey(date);
    setSchedule(prev => {
      const next = { ...prev };
      if (key in next.days) {
        delete next.days[key];
      } else {
        next.days[key] = {
          shifts: Array.from({ length: next.shiftsPerDay }, () => ({ hours: 8 }))
        };
      }
      return next;
    });
  };

  const updateShiftHours = (date: Date, shiftIndex: number, hours: number) => {
    const key = formatDateKey(date);
    setSchedule(prev => {
      const next = { ...prev };
      if (next.days[key]) {
        next.days[key].shifts[shiftIndex].hours = hours;
      }
      return next;
    });
  };

  const setShiftsPerDay = (shifts: 1 | 2) => {
    setSchedule(prev => {
      const next = { ...prev, shiftsPerDay: shifts };

      // Update existing days to match new shift count
      Object.keys(next.days).forEach(key => {
        const day = next.days[key];
        if (day.shifts.length !== shifts) {
          day.shifts = Array.from({ length: shifts }, (_, i) => ({
            hours: day.shifts[i]?.hours || 8
          }));
        }
      });

      return next;
    });
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="space-y-6">
      {/* Shift count selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-900">
          Количество смен в день
        </label>
        <div className="flex gap-2">
          {[1, 2].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setShiftsPerDay(count as 1 | 2)}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                schedule.shiftsPerDay === count
                  ? 'bg-zinc-950 text-white'
                  : 'bg-white text-zinc-950 border border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              {count} смена{count > 1 ? 'ы' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
          className="rounded-2xl border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
        >
          ← Предыдущий
        </button>

        <h3 className="text-lg font-semibold text-zinc-950">
          {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
        </h3>

        <button
          type="button"
          onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
          className="rounded-2xl border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
        >
          Следующий →
        </button>
      </div>

      {/* Calendar */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-4">
        <div className="grid grid-cols-7 gap-1">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-zinc-500">
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: (days[0].getDay() + 6) % 7 }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2" />
          ))}

          {/* Days */}
          {days.map(day => {
            const isSelected = isDaySelected(day);
            const daySchedule = schedule.days[formatDateKey(day)];

            return (
              <div key={day.toISOString()} className="relative">
                <button
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`w-full aspect-square rounded-2xl text-sm font-medium transition ${
                    isSelected
                      ? 'bg-zinc-950 text-white'
                      : 'hover:bg-zinc-100 text-zinc-950'
                  }`}
                >
                  {day.getDate()}
                </button>

                {isSelected && daySchedule && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10 mt-2 w-32 rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg">
                    <div className="space-y-1">
                      {daySchedule.shifts.map((shift, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <span className="text-xs text-zinc-500">
                            Смена {index + 1}:
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="24"
                            value={shift.hours}
                            onChange={(e) => updateShiftHours(day, index, parseInt(e.target.value) || 0)}
                            className="w-12 rounded border border-zinc-300 px-1 py-0.5 text-xs text-center"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-xs text-zinc-500">ч</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onSave(schedule)}
          className="rounded-2xl bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Сохранить
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-50"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}