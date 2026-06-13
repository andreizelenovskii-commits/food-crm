"use client";

import { useMemo, useState } from "react";

type RoleKey = "manager" | "dispatcher" | "cook" | "courier" | "admin";

type Permission = {
  id: string;
  label: string;
  hint: string;
};

type PermissionGroup = {
  title: string;
  items: Permission[];
};

const ROLES: Array<{ id: RoleKey; title: string; subtitle: string }> = [
  { id: "manager", title: "Управляющий", subtitle: "Полный операционный доступ" },
  { id: "dispatcher", title: "Диспетчер", subtitle: "Заказы, клиенты, смена" },
  { id: "cook", title: "Повар", subtitle: "Кухня и упаковка" },
  { id: "courier", title: "Курьер", subtitle: "Доставка и статусы" },
  { id: "admin", title: "Администратор", subtitle: "Система и подключения" },
];

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    title: "Заказы",
    items: [
      { id: "orders.view", label: "Просмотр заказов", hint: "Видит список и карточки заказов" },
      { id: "orders.create", label: "Создание заказов", hint: "Может оформить заказ вручную" },
      { id: "orders.edit", label: "Редактирование заказов", hint: "Меняет состав, клиента и сумму" },
      { id: "orders.status", label: "Смена статусов", hint: "Двигает заказ по этапам" },
      { id: "orders.cancel", label: "Отмена заказов", hint: "Закрывает ошибочные заказы" },
    ],
  },
  {
    title: "Кухня и доставка",
    items: [
      { id: "kitchen.view", label: "Кухонный экран", hint: "Видит заказы на приготовление" },
      { id: "kitchen.manage", label: "Управление кухней", hint: "Назначает зоны и упаковку" },
      { id: "delivery.view", label: "Маршруты доставки", hint: "Видит адреса и курьеров" },
      { id: "delivery.close", label: "Закрытие доставки", hint: "Отмечает доставлено и оплачено" },
    ],
  },
  {
    title: "Каталог и склад",
    items: [
      { id: "catalog.view", label: "Просмотр каталога", hint: "Видит меню и техкарты" },
      { id: "catalog.manage", label: "Управление каталогом", hint: "Меняет цены, фото и публикацию" },
      { id: "inventory.view", label: "Просмотр склада", hint: "Видит остатки и движения" },
      { id: "inventory.manage", label: "Управление складом", hint: "Поступления, списания, инвентаризация" },
      { id: "suppliers.manage", label: "Поставщики", hint: "Создаёт и редактирует поставщиков" },
    ],
  },
  {
    title: "Клиенты и команда",
    items: [
      { id: "clients.view", label: "Просмотр клиентов", hint: "Видит базу клиентов" },
      { id: "clients.manage", label: "Управление клиентами", hint: "Редактирует данные и заметки" },
      { id: "loyalty.manage", label: "Лояльность", hint: "Настраивает уровни и бонусы" },
      { id: "employees.view", label: "Просмотр сотрудников", hint: "Видит карточки команды" },
      { id: "employees.manage", label: "Управление сотрудниками", hint: "Роли, доступы, графики" },
    ],
  },
  {
    title: "Финансы и система",
    items: [
      { id: "reports.view", label: "Отчёты", hint: "Продажи, каналы, клиенты" },
      { id: "payments.manage", label: "Оплаты и эквайринг", hint: "Онлайн-оплата и терминалы" },
      { id: "cashbox.manage", label: "Касса и ОФД", hint: "Фискализация и чеки" },
      { id: "settings.view", label: "Просмотр настроек", hint: "Видит системные разделы" },
      { id: "settings.manage", label: "Управление настройками", hint: "Меняет права, устройства и интеграции" },
      { id: "site.manage", label: "Сайт и приложение", hint: "Техработы, розыгрыши, промо" },
    ],
  },
];

const DEFAULT_PERMISSIONS: Record<RoleKey, string[]> = {
  manager: allPermissionIds(),
  admin: allPermissionIds(),
  dispatcher: [
    "orders.view",
    "orders.create",
    "orders.edit",
    "orders.status",
    "clients.view",
    "clients.manage",
    "catalog.view",
    "delivery.view",
    "reports.view",
  ],
  cook: ["orders.view", "orders.status", "kitchen.view", "kitchen.manage", "catalog.view", "inventory.view"],
  courier: ["orders.view", "orders.status", "delivery.view", "delivery.close", "clients.view"],
};

function allPermissionIds() {
  return PERMISSION_GROUPS.flatMap((group) => group.items.map((item) => item.id));
}

export function RolesPermissionsEditor() {
  const [activeRole, setActiveRole] = useState<RoleKey>("manager");
  const [matrix, setMatrix] = useState(DEFAULT_PERMISSIONS);
  const totalPermissions = allPermissionIds().length;
  const activePermissions = matrix[activeRole];
  const activeRoleMeta = ROLES.find((role) => role.id === activeRole) ?? ROLES[0];

  const groupStats = useMemo(
    () =>
      PERMISSION_GROUPS.map((group) => ({
        title: group.title,
        selected: group.items.filter((item) => activePermissions.includes(item.id)).length,
        total: group.items.length,
      })),
    [activePermissions],
  );

  function togglePermission(permissionId: string) {
    setMatrix((current) => {
      const rolePermissions = current[activeRole];
      const nextPermissions = rolePermissions.includes(permissionId)
        ? rolePermissions.filter((item) => item !== permissionId)
        : [...rolePermissions, permissionId];

      return { ...current, [activeRole]: nextPermissions };
    });
  }

  function setRolePermissions(permissionIds: string[]) {
    setMatrix((current) => ({ ...current, [activeRole]: permissionIds }));
  }

  return (
    <div className="foodlike-frame grid gap-4 p-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-[18px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_54px_rgba(127,29,29,0.09)] backdrop-blur-2xl">
        <p className="foodlike-kicker">Роли</p>
        <div className="mt-3 grid gap-2">
          {ROLES.map((role) => {
            const isActive = role.id === activeRole;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setActiveRole(role.id)}
                className={[
                  "rounded-[14px] border p-3 text-left transition",
                  isActive ? "border-red-800 bg-red-800 text-white" : "border-red-950/10 bg-white/76 text-zinc-950 hover:border-red-200",
                ].join(" ")}
              >
                <span className="block text-sm font-semibold">{role.title}</span>
                <span className={["mt-1 block text-xs leading-5", isActive ? "text-white/75" : "text-zinc-500"].join(" ")}>
                  {role.subtitle}
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
              <h2 className="mt-1 text-xl font-semibold text-zinc-950">{activeRoleMeta.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Выбери конкретные действия, которые доступны этой роли.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setRolePermissions(allPermissionIds())} className="foodlike-button-secondary">Все права</button>
              <button type="button" onClick={() => setRolePermissions([])} className="foodlike-button-secondary">Очистить</button>
              <button type="button" onClick={() => setRolePermissions(DEFAULT_PERMISSIONS[activeRole])} className="foodlike-button-primary">Вернуть роль</button>
            </div>
          </div>

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
                      className={[
                        "grid gap-3 rounded-[14px] border p-3 text-left transition sm:grid-cols-[1fr_auto] sm:items-center",
                        checked ? "border-red-200 bg-red-50/70" : "border-red-950/10 bg-white/76 hover:border-red-200",
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
