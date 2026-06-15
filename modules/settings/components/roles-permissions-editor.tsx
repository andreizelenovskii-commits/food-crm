"use client";

import { useMemo, useState } from "react";
import { browserBackendJson } from "@/shared/api/browser-backend";
import type { AccessModel } from "@/modules/settings/access-model.api";
import type { AuthPermission } from "@/modules/auth/authz";
import type { UserRole } from "@/modules/auth/auth.types";

type Permission = {
  id: AuthPermission;
  label: string;
  hint: string;
};

type PermissionGroup = {
  title: string;
  items: Permission[];
};

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    title: "Заказы",
    items: [
      { id: "view_orders", label: "Видит заказы", hint: "Открывает список и карточки заказов" },
      { id: "manage_orders", label: "Управляет заказами", hint: "Создаёт, меняет статусы и редактирует заказы" },
    ],
  },
  {
    title: "Каталог и склад",
    items: [
      { id: "view_catalog", label: "Видит каталог", hint: "Открывает меню, товары и карточки" },
      { id: "manage_catalog", label: "Управляет каталогом", hint: "Меняет цены, фото, состав и публикацию" },
      { id: "view_inventory", label: "Видит склад", hint: "Открывает остатки, поступления, списания и техкарты" },
      { id: "manage_inventory", label: "Управляет складом", hint: "Создаёт движения, инвентаризации и техкарты" },
    ],
  },
  {
    title: "Клиенты и команда",
    items: [
      { id: "view_clients", label: "Видит клиентов", hint: "Открывает клиентскую базу и карточки" },
      { id: "manage_clients", label: "Управляет клиентами", hint: "Создаёт и редактирует клиентов" },
      { id: "view_employees", label: "Видит сотрудников", hint: "Открывает команду, карточки и графики" },
      { id: "manage_employees", label: "Управляет сотрудниками", hint: "Меняет карточки, должности и доступы" },
    ],
  },
  {
    title: "Система",
    items: [
      { id: "view_dashboard", label: "Видит дашборд", hint: "Открывает главную CRM и базовую аналитику" },
      { id: "view_settings", label: "Видит настройки", hint: "Открывает раздел настроек" },
      { id: "manage_settings", label: "Управляет настройками", hint: "Меняет роли, права и системные параметры" },
    ],
  },
];

function allPermissionIds(): AuthPermission[] {
  return PERMISSION_GROUPS.flatMap((group) => group.items.map((item) => item.id));
}

function roleSubtitle(role: UserRole) {
  if (role === "Администратор" || role === "admin") return "Система, команда и настройки";
  if (role === "Шеф повар") return "Кухня, склад и операционный контроль";
  if (role === "Управляющий") return "Полный операционный доступ";
  if (role === "Старший курьер") return "Доставка, команда и контроль смены";
  if (role === "Диспетчер") return "Заказы, клиенты, смена";
  if (role === "Повар") return "Кухня и заказы";
  return "Доставка и статусы";
}

function buildMatrix(accessModel: AccessModel) {
  return Object.fromEntries(
    accessModel.roles.map((role) => [role.role, role.permissions]),
  ) as Record<UserRole, AuthPermission[]>;
}

export function RolesPermissionsEditor({
  accessModel,
  canManageSettings,
}: {
  accessModel: AccessModel;
  canManageSettings: boolean;
}) {
  const roles = accessModel.roles.filter((role) => role.role !== "admin");
  const [activeRole, setActiveRole] = useState<UserRole>(roles[0]?.role ?? "Администратор");
  const [matrix, setMatrix] = useState(() => buildMatrix(accessModel));
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const totalPermissions = allPermissionIds().length;
  const activePermissions = useMemo(() => matrix[activeRole] ?? [], [activeRole, matrix]);
  const activeRoleMeta = roles.find((role) => role.role === activeRole) ?? roles[0];

  const groupStats = useMemo(
    () =>
      PERMISSION_GROUPS.map((group) => ({
        title: group.title,
        selected: group.items.filter((item) => activePermissions.includes(item.id)).length,
        total: group.items.length,
      })),
    [activePermissions],
  );

  async function saveRolePermissions(role: UserRole, permissions: AuthPermission[]) {
    setSaveState("saving");

    try {
      await browserBackendJson(`/api/v1/access-model/${encodeURIComponent(role)}`, {
        method: "PUT",
        body: { permissions },
      });
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  function setRolePermissions(permissionIds: AuthPermission[]) {
    if (!canManageSettings) {
      return;
    }

    setMatrix((current) => {
      const next = { ...current, [activeRole]: permissionIds };
      void saveRolePermissions(activeRole, permissionIds);

      return next;
    });
  }

  function togglePermission(permissionId: AuthPermission) {
    if (!canManageSettings) {
      return;
    }

    setMatrix((current) => {
      const rolePermissions = current[activeRole] ?? [];
      const nextPermissions = rolePermissions.includes(permissionId)
        ? rolePermissions.filter((item) => item !== permissionId)
        : [...rolePermissions, permissionId];
      void saveRolePermissions(activeRole, nextPermissions);

      return { ...current, [activeRole]: nextPermissions };
    });
  }

  return (
    <div className="foodlike-frame grid gap-4 p-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-[18px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_54px_rgba(127,29,29,0.09)] backdrop-blur-2xl">
        <p className="foodlike-kicker">Роли</p>
        <div className="mt-3 grid gap-2">
          {roles.map((role) => {
            const isActive = role.role === activeRole;
            return (
              <button
                key={role.role}
                type="button"
                onClick={() => setActiveRole(role.role)}
                className={[
                  "rounded-[14px] border p-3 text-left transition",
                  isActive ? "border-red-800 bg-red-800 text-white" : "border-red-950/10 bg-white/76 text-zinc-950 hover:border-red-200",
                ].join(" ")}
              >
                <span className="block text-sm font-semibold">{role.label}</span>
                <span className={["mt-1 block text-xs leading-5", isActive ? "text-white/75" : "text-zinc-500"].join(" ")}>
                  {roleSubtitle(role.role)}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="space-y-4">
        <div className="rounded-[18px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_54px_rgba(127,29,29,0.09)] backdrop-blur-2xl">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="foodlike-kicker">Матрица доступа</p>
              <h2 className="mt-1 text-xl font-semibold text-zinc-950">{activeRoleMeta?.label ?? activeRole}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Эти права реально управляют видимостью разделов CRM и доступом к API.
              </p>
              {!canManageSettings ? (
                <p className="mt-2 text-xs font-semibold text-red-800">У тебя есть только просмотр матрицы, без сохранения изменений.</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setRolePermissions(allPermissionIds())} disabled={!canManageSettings} className="foodlike-button-secondary disabled:opacity-50">Все права</button>
              <button type="button" onClick={() => setRolePermissions([])} disabled={!canManageSettings} className="foodlike-button-secondary disabled:opacity-50">Очистить</button>
            </div>
          </div>
          <p className="mt-3 text-xs font-semibold text-zinc-500">
            {saveState === "saving"
              ? "Сохраняю права..."
              : saveState === "saved"
                ? "Права сохранены. Они применятся к новым запросам и после обновления сессии."
                : saveState === "error"
                  ? "Не удалось сохранить права. Проверь доступ к управлению настройками."
                  : "Изменение галочки сразу сохраняется в backend."}
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <Metric label="Выбрано" value={`${activePermissions.length}/${totalPermissions}`} />
            {groupStats.slice(0, 3).map((group) => (
              <Metric key={group.title} label={group.title} value={`${group.selected}/${group.total}`} />
            ))}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {PERMISSION_GROUPS.map((group) => (
            <section key={group.title} className="rounded-[18px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_54px_rgba(127,29,29,0.09)] backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-zinc-950">{group.title}</h3>
                <span className="rounded-[10px] bg-red-50 px-3 py-1 text-xs font-semibold text-red-800">
                  {group.items.filter((item) => activePermissions.includes(item.id)).length}/{group.items.length}
                </span>
              </div>
              <div className="mt-3 grid gap-2">
                {group.items.map((permission) => {
                  const checked = activePermissions.includes(permission.id);
                  return (
                    <button
                      key={permission.id}
                      type="button"
                      onClick={() => togglePermission(permission.id)}
                      disabled={!canManageSettings}
                      className={[
                        "grid gap-3 rounded-[14px] border p-3 text-left transition sm:grid-cols-[1fr_auto] sm:items-center",
                        checked ? "border-red-200 bg-red-50/70" : "border-red-950/10 bg-white/76 hover:border-red-200",
                        !canManageSettings ? "cursor-not-allowed opacity-70" : "",
                      ].join(" ")}
                    >
                      <span>
                        <span className="block text-sm font-semibold text-zinc-950">{permission.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-zinc-500">{permission.hint}</span>
                      </span>
                      <span className={`relative h-8 w-14 rounded-[12px] transition ${checked ? "bg-red-800" : "bg-zinc-200"}`}>
                        <span className={`absolute top-1 size-6 rounded-[9px] bg-white shadow-sm transition ${checked ? "left-7" : "left-1"}`} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[14px] border border-red-950/10 bg-white/76 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/65">{label}</p>
      <p className="mt-1 text-xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
