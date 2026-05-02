import { hasPermission } from "@/modules/auth/authz";
import { USER_ROLE_LABELS, type SessionUser } from "@/modules/auth/auth.types";
import type { UpcomingBirthdayClient } from "@/modules/clients/clients.page-model";
import type { ModuleIconName } from "@/components/ui/module-icon";
import type {
  DashboardSnapshot,
  EmployeeDashboardSnapshot,
} from "@/modules/dashboard/dashboard.types";

const STAFF_ROLES = new Set(["Повар", "Курьер", "Диспетчер"]);

export type DashboardPageSearchParams = {
  month?: string | string[];
};

export type DashboardPageProps = {
  user: SessionUser;
  dashboard: DashboardSnapshot;
  employeeDashboard: EmployeeDashboardSnapshot;
  upcomingBirthdays?: UpcomingBirthdayClient[];
};

type ModuleCard = {
  href: string;
  label: string;
  value: string | number;
  description: string;
  icon: ModuleIconName;
  visible: boolean;
};

function formatMonthKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

export function resolveDashboardSelectedMonth(searchParams?: DashboardPageSearchParams) {
  const selectedMonthParam = Array.isArray(searchParams?.month)
    ? searchParams.month[0]
    : searchParams?.month;

  return selectedMonthParam?.trim() ?? "";
}

export function buildDashboardPageViewModel({
  user,
  dashboard,
  employeeDashboard,
}: DashboardPageProps) {
  const isStaffRole = STAFF_ROLES.has(user.role);
  const activeMonthDate =
    employeeDashboard && /^\d{4}-\d{2}$/.test(employeeDashboard.monthKey)
      ? new Date(
          Number(employeeDashboard.monthKey.slice(0, 4)),
          Number(employeeDashboard.monthKey.slice(5, 7)) - 1,
          1,
        )
      : new Date();
  const previousMonth = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth() - 1, 1);
  const nextMonth = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth() + 1, 1);
  const monthNavigation = employeeDashboard
    ? {
        previousHref: `/dashboard?month=${formatMonthKey(previousMonth)}`,
        nextHref: `/dashboard?month=${formatMonthKey(nextMonth)}`,
      }
    : null;

  const moduleCards: ModuleCard[] = [
    {
      href: "/dashboard/sales",
      label: "Продажи",
      value: "BI",
      description: "Аналитика и маржа",
      icon: "chart",
      visible: hasPermission(user, "view_orders"),
    },
    {
      href: "/dashboard/reports",
      label: "Отчеты",
      value: "PDF",
      description: "Месячные срезы",
      icon: "report",
      visible: hasPermission(user, "view_dashboard"),
    },
    {
      href: "/dashboard/orders",
      label: "Заказы",
      value: dashboard.entityCounts.orders,
      description: "Список заказов",
      icon: "receipt",
      visible: hasPermission(user, "view_orders"),
    },
    {
      href: "/dashboard/clients",
      label: "Клиенты",
      value: dashboard.entityCounts.clients,
      description: "Список и создание",
      icon: "users",
      visible: hasPermission(user, "view_clients"),
    },
    {
      href: "/dashboard/inventory",
      label: "Склад",
      value: dashboard.entityCounts.products,
      description: "Товары и остатки",
      icon: "box",
      visible: hasPermission(user, "view_inventory"),
    },
    {
      href: "/dashboard/catalog",
      label: "Каталог",
      value: "Site",
      description: "Прайс и позиции сайта",
      icon: "book",
      visible: hasPermission(user, "view_catalog"),
    },
    {
      href: "/dashboard/website",
      label: "Наш сайт",
      value: "Web",
      description: "Ссылка и быстрый переход",
      icon: "globe",
      visible: true,
    },
    {
      href: "/dashboard/reviews",
      label: "Отзывы",
      value: "New",
      description: "Оценки и комментарии",
      icon: "message",
      visible: true,
    },
    {
      href: "/dashboard/loyalty",
      label: "Система лояльности",
      value: "CRM",
      description: "Баллы, скидки, уровни",
      icon: "star",
      visible: true,
    },
    {
      href: "/dashboard/settings",
      label: "Настройки",
      value: "Core",
      description: "ОФД, кассы, интеграции",
      icon: "settings",
      visible: hasPermission(user, "view_settings"),
    },
    {
      href: "/dashboard/employees",
      label: "Сотрудники",
      value: dashboard.entityCounts.employees,
      description: "Профили",
      icon: "badge",
      visible: hasPermission(user, "view_employees"),
    },
    {
      href: "/dashboard/profile",
      label: "Мой профиль",
      value: USER_ROLE_LABELS[user.role],
      description: "Аккаунт и роль в системе",
      icon: "user",
      visible: true,
    },
  ];

  return {
    isStaffRole,
    monthNavigation,
    showSalesSection: hasPermission(user, "view_orders") && !isStaffRole,
    visibleModuleCards: moduleCards.filter((card) => card.visible),
  };
}
