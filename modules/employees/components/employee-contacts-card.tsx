"use client";

import { PhoneInput } from "@/components/ui/phone-input";
import { EmployeeDatePicker } from "@/modules/employees/components/employee-date-picker";
import { EMPLOYEE_ROLES, type EmployeeProfile } from "@/modules/employees/employees.types";
import {
  type ContactsDraft,
  formatDate,
} from "@/modules/employees/components/employee-profile.helpers";

export function EmployeeContactsCard({
  employee,
  contactsDraft,
  isEditing,
  rolePickerOpen,
  serializedSchedule,
  onEdit,
  onCancel,
  onRolePickerChange,
  onDraftChange,
  onSave,
}: {
  employee: EmployeeProfile;
  contactsDraft: ContactsDraft;
  isEditing: boolean;
  rolePickerOpen: boolean;
  serializedSchedule: string;
  onEdit: () => void;
  onCancel: () => void;
  onRolePickerChange: (isOpen: boolean) => void;
  onDraftChange: (draft: ContactsDraft) => void;
  onSave: (formData: FormData) => Promise<void>;
}) {
  const patchDraft = (patch: Partial<ContactsDraft>) => {
    onDraftChange({ ...contactsDraft, ...patch });
  };

  return (
    <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 shadow-sm shadow-zinc-950/5 sm:p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-950">Контакты</h2>
        {!isEditing ? (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Изменить данные
          </button>
        ) : null}
      </div>

      {isEditing ? (
        <form action={onSave} className="mt-4 space-y-4 text-sm text-zinc-700">
          <label className="block space-y-2">
            <span className="font-medium text-zinc-900">Имя</span>
            <input
              name="name"
              type="text"
              value={contactsDraft.name}
              onChange={(event) => patchDraft({ name: event.target.value })}
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            />
          </label>

          <label className="block space-y-2">
            <span className="font-medium text-zinc-900">Роль</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => onRolePickerChange(!rolePickerOpen)}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-left text-zinc-950 transition hover:border-zinc-500 focus:border-zinc-500 focus:outline-none"
              >
                <span className="block text-sm font-medium text-zinc-900">{contactsDraft.role}</span>
                <span className="text-xs text-zinc-500">Нажмите, чтобы выбрать</span>
              </button>

              {rolePickerOpen ? (
                <div className="absolute left-0 top-full z-20 mt-3 w-full overflow-hidden rounded-[14px] border border-zinc-200 bg-white shadow-lg">
                  <div className="p-3">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Выберите роль</div>
                    <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-track-zinc-100 scrollbar-thumb-zinc-300">
                      {EMPLOYEE_ROLES.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            patchDraft({ role });
                            onRolePickerChange(false);
                          }}
                          className={`mb-2 flex w-full items-center justify-center rounded-2xl px-3 py-2 text-sm transition ${
                            role === contactsDraft.role
                              ? "bg-zinc-950 text-white"
                              : "bg-white text-zinc-950 hover:bg-zinc-100"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <input type="hidden" name="role" value={contactsDraft.role} />
          </label>

          <label className="block space-y-2">
            <span className="font-medium text-zinc-900">Телефон</span>
            <PhoneInput name="phone" value={contactsDraft.phone} onChange={(phone) => patchDraft({ phone })} />
          </label>

          <label className="block space-y-2">
            <span className="font-medium text-zinc-900">Мессенджер</span>
            <input
              name="messenger"
              type="url"
              value={contactsDraft.messenger}
              onChange={(event) => patchDraft({ messenger: event.target.value })}
              placeholder="https://t.me/ivan или https://wa.me/79991234567"
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            />
          </label>

          <EmployeeDatePicker
            name="birthDate"
            label="Дата рождения"
            value={contactsDraft.birthDate}
            onChange={(birthDate) => patchDraft({ birthDate })}
          />
          <EmployeeDatePicker
            name="hireDate"
            label="Дата приема на работу"
            value={contactsDraft.hireDate}
            onChange={(hireDate) => patchDraft({ hireDate })}
          />

          <input type="hidden" name="schedule" value={serializedSchedule} />

          <div className="flex gap-2">
            <button type="submit" className="flex-1 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800">
              Сохранить изменения
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-950 transition hover:border-zinc-500"
            >
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-4 space-y-3 text-sm text-zinc-700">
          <p><span className="font-medium text-zinc-900">Имя:</span> {employee.name}</p>
          <p><span className="font-medium text-zinc-900">Роль:</span> {employee.role}</p>
          <p><span className="font-medium text-zinc-900">Телефон:</span> {employee.phone || "Не указан"}</p>
          <p>
            <span className="font-medium text-zinc-900">Мессенджер:</span>{" "}
            {employee.messenger ? (
              <a href={employee.messenger} target="_blank" rel="noopener noreferrer" className="text-zinc-950 underline hover:text-zinc-700">
                {employee.messenger}
              </a>
            ) : (
              "Не указан"
            )}
          </p>
          <p>
            <span className="font-medium text-zinc-900">Дата рождения:</span>{" "}
            {employee.birthDate ? formatDate(employee.birthDate) : "Не указана"}
          </p>
          <p>
            <span className="font-medium text-zinc-900">Дата приема на работу:</span>{" "}
            {employee.hireDate ? formatDate(employee.hireDate) : "Не указана"}
          </p>
        </div>
      )}
    </section>
  );
}
