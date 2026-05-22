"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ModuleIcon } from "@/components/ui/module-icon";
import { SidebarNavGroup } from "@/components/ui/sidebar-nav-group";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Главная", icon: "grid" },
  { href: "/dashboard/sales", label: "Продажи", icon: "chart" },
  { href: "/dashboard/reports", label: "Отчеты", icon: "report" },
  { href: "/dashboard/orders", label: "Заказы", icon: "receipt" },
  { href: "/dashboard/clients", label: "Клиенты", icon: "users" },
  { href: "/dashboard/catalog", label: "Каталог", icon: "book" },
  { href: "/dashboard/inventory", label: "Склад", icon: "box" },
  { href: "/dashboard/employees", label: "Сотрудники", icon: "badge" },
  { href: "/dashboard/loyalty", label: "Лояльность", icon: "star" },
  { href: "/dashboard/reviews", label: "Отзывы", icon: "message" },
  { href: "/dashboard/website", label: "Сайт", icon: "globe" },
  { href: "/dashboard/settings", label: "Настройки", icon: "settings" },
] as const;

const PACKAGING_CATEGORY = "Упаковка";

const INVENTORY_SUB_ITEMS: Array<{
  href: string;
  label: string;
  tab: string;
  category?: string;
}> = [
  { href: "/dashboard/inventory", label: "Товары", tab: "products" },
  {
    href: `/dashboard/inventory?category=${encodeURIComponent(PACKAGING_CATEGORY)}`,
    label: PACKAGING_CATEGORY,
    tab: "products",
    category: PACKAGING_CATEGORY,
  },
  { href: "/dashboard/inventory?tab=incoming", label: "Поступление", tab: "incoming" },
  { href: "/dashboard/inventory?tab=suppliers", label: "Поставщики", tab: "suppliers" },
  { href: "/dashboard/inventory?tab=writeoff", label: "Списание", tab: "writeoff" },
  { href: "/dashboard/inventory?tab=audit", label: "Инвентаризация", tab: "audit" },
  { href: "/dashboard/inventory?tab=recipes", label: "Техкарты", tab: "recipes" },
];

const SETTINGS_SUB_ITEMS = [
  { href: "/dashboard/settings/rights", label: "Права" },
  { href: "/dashboard/settings/roles", label: "Роли" },
  { href: "/dashboard/settings/kitchen-zones", label: "Кухонные зоны" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isInventoryPath = isActivePath(pathname, "/dashboard/inventory");
  const isSettingsPath = isActivePath(pathname, "/dashboard/settings");
  const [isInventoryOpen, setIsInventoryOpen] = useState(isInventoryPath);
  const [isSettingsOpen, setIsSettingsOpen] = useState(isSettingsPath);
  const activeInventoryTab = isInventoryPath ? (searchParams.get("tab") ?? "products") : "";
  const activeInventoryCategory = isInventoryPath ? (searchParams.get("category") ?? "") : "";

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-red-200 bg-white text-red-800 shadow-lg shadow-red-950/10 md:hidden"
        onClick={() => setIsMobileOpen((current) => !current)}
        aria-label="Открыть модули"
        aria-expanded={isMobileOpen}
      >
        <span className="h-4 w-5 border-y-2 border-current before:mt-[5px] before:block before:border-t-2 before:border-current" />
      </button>

      {isMobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-zinc-950/35 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Закрыть модули"
        />
      ) : null}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-red-950/10 bg-[#fffdfc]/92 shadow-2xl shadow-red-950/12 backdrop-blur-xl transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 md:shadow-none",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-20 items-center gap-3 border-b border-red-950/10 px-4">
          <Link
            href="/dashboard"
            className="relative flex h-12 w-12 shrink-0 overflow-hidden rounded-[12px]"
            aria-label="FoodLike"
          >
            <Image
              src="/foodlike-app-icon-v3.png"
              alt=""
              fill
              unoptimized
              sizes="48px"
              className="object-contain"
              style={{ objectPosition: "50% 50%" }}
            />
          </Link>
          <div className="min-w-0">
            <p className="text-base font-semibold leading-5 text-zinc-950">FoodLike</p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-red-800/60">
              CRM
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Модули
          </p>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              if (item.href === "/dashboard/inventory") {
                return (
                  <SidebarNavGroup
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={isActive}
                    isOpen={isInventoryOpen}
                    expandLabel="Показать вкладки склада"
                    collapseLabel="Скрыть вкладки склада"
                    onOpen={() => {
                      setIsInventoryOpen(true);
                      setIsMobileOpen(false);
                    }}
                    onToggle={() => setIsInventoryOpen((current) => !current)}
                    onCloseMobile={() => setIsMobileOpen(false)}
                    subItems={INVENTORY_SUB_ITEMS.map((subItem) => ({
                      href: subItem.href,
                      label: subItem.label,
                      isActive: subItem.category
                        ? activeInventoryTab === subItem.tab && activeInventoryCategory === subItem.category
                        : activeInventoryTab === subItem.tab && !activeInventoryCategory,
                    }))}
                  />
                );
              }

              if (item.href === "/dashboard/settings") {
                return (
                  <SidebarNavGroup
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={isActive}
                    isOpen={isSettingsOpen}
                    expandLabel="Показать разделы настроек"
                    collapseLabel="Скрыть разделы настроек"
                    onOpen={() => {
                      setIsSettingsOpen(true);
                      setIsMobileOpen(false);
                    }}
                    onToggle={() => setIsSettingsOpen((current) => !current)}
                    onCloseMobile={() => setIsMobileOpen(false)}
                    subItems={SETTINGS_SUB_ITEMS.map((subItem) => ({
                      href: subItem.href,
                      label: subItem.label,
                      isActive: isActivePath(pathname, subItem.href),
                    }))}
                  />
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={[
                    "flex h-10 items-center gap-2.5 rounded-[12px] px-2 text-sm font-medium transition",
                    isActive
                      ? "bg-red-800 text-white shadow-md shadow-red-950/10 hover:bg-red-800 hover:text-white"
                      : "text-zinc-600 hover:bg-red-50/80 hover:text-red-900 hover:shadow-sm hover:shadow-red-950/5",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px]",
                      isActive ? "bg-white/16 text-white" : "bg-red-50 text-red-800",
                    ].join(" ")}
                  >
                    <ModuleIcon name={item.icon} />
                  </span>
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

      </aside>
    </>
  );
}
