import { ModuleIcon } from "@/components/ui/module-icon";
import { GlassPanel } from "@/modules/dashboard/components/dashboard-widgets";

export function InventorySuppliersTab() {
  return (
    <GlassPanel className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
            <ModuleIcon name="users" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
              Поставщики
            </p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-950">
              База поставщиков
            </h2>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-500">
              Здесь будет список поставщиков склада: контакты, категории товаров и история поступлений.
            </p>
          </div>
        </div>
        <span className="inline-flex h-8 items-center rounded-full bg-red-50 px-3 text-xs font-semibold text-red-800 ring-1 ring-red-100">
          Скоро
        </span>
      </div>

      <div className="mt-5 rounded-[18px] border border-dashed border-red-200 bg-white/55 px-4 py-5 text-sm text-zinc-500">
        Поставщики пока не добавлены. Вкладка уже готова в меню склада, дальше можно будет подключить создание и карточки поставщиков.
      </div>
    </GlassPanel>
  );
}
