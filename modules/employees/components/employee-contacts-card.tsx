"use client";

import { createPortal } from "react-dom";
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
  className = "",
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
  className?: string;
}) {
  const patchDraft = (patch: Partial<ContactsDraft>) => {
    onDraftChange({ ...contactsDraft, ...patch });
  };

  return (
    <section
      className={[
        "rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
            Карточка сотрудника
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-zinc-950">{employee.name}</h2>
          <p className="mt-0.5 text-xs font-medium text-zinc-500">{employee.role}</p>
        </div>
        {!isEditing ? (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
          >
            Изменить
          </button>
        ) : null}
      </div>

      <dl className="mt-4 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">Телефон</dt>
          <dd className="mt-0.5 text-zinc-900">{employee.phone || "Не указан"}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">Мессенджер</dt>
          <dd className="mt-0.5 break-all text-zinc-900">
            {employee.messenger ? (
              <a href={employee.messenger} target="_blank" rel="noopener noreferrer" className="text-red-900 underline decoration-red-950/25 underline-offset-2 hover:text-red-950">
                {employee.messenger}
              </a>
            ) : (
              "Не указан"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">Дата рождения</dt>
          <dd className="mt-0.5 text-zinc-900">{employee.birthDate ? formatDate(employee.birthDate) : "Не указана"}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">Приём на работу</dt>
          <dd className="mt-0.5 text-zinc-900">{employee.hireDate ? formatDate(employee.hireDate) : "Не указана"}</dd>
        </div>
      </dl>

      {isEditing && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-100 overflow-y-auto bg-zinc-950/35 px-4 py-6 backdrop-blur-sm sm:py-8">
              <button
                type="button"
                onClick={onCancel}
                className="fixed inset-0 cursor-default"
                aria-label="Закрыть редактирование сотрудника"
              />
              <section className="relative mx-auto max-w-2xl rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
                <div className="mb-3 flex items-start justify-between gap-3 rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
                      Карточка сотрудника
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-zinc-950">Редактирование данных</h2>
                  </div>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
                  >
                    Закрыть
                  </button>
                </div>

                <form action={onSave} className="space-y-4 rounded-[22px] border border-white/70 bg-white/76 p-4 text-sm text-zinc-700 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-5">
                  <label className="block space-y-2">
                    <span className="font-medium text-zinc-900">Имя</span>
                    <input
                      name="name"
                      type="text"
                      value={contactsDraft.name}
                      onChange={(event) => patchDraft({ name: event.target.value })}
                      className="h-11 w-full rounded-[14px] border border-red-950/10 bg-white/90 px-4 text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="font-medium text-zinc-900">Роль</span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => onRolePickerChange(!rolePickerOpen)}
                        className="h-11 w-full rounded-[14px] border border-red-950/10 bg-white/90 px-4 text-left text-zinc-950 transition hover:border-red-200 focus:border-red-300 focus:outline-none"
                      >
                        <span className="block text-sm font-medium text-zinc-900">{contactsDraft.role}</span>
                        <span className="text-xs text-zinc-500">Нажмите, чтобы выбрать</span>
                      </button>

                      {rolePickerOpen ? (
                        <div className="absolute left-0 top-full z-20 mt-3 w-full overflow-hidden rounded-[14px] border border-red-950/10 bg-white shadow-lg">
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
                                      ? "bg-red-800 text-white"
                                      : "bg-white text-zinc-950 hover:bg-red-50/70"
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
                      className="h-11 w-full rounded-[14px] border border-red-950/10 bg-white/90 px-4 text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
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
                    <button type="submit" className="flex-1 rounded-[14px] bg-red-800 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900">
                      Сохранить изменения
                    </button>
                    <button
                      type="button"
                      onClick={onCancel}
                      className="rounded-[14px] border border-red-100 bg-white/90 px-4 py-3 text-sm font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </section>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
