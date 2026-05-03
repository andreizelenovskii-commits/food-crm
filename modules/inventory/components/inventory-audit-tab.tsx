import { InventoryAuditDialogs } from "@/modules/inventory/components/inventory-audit-dialogs";
import type { Employee } from "@/modules/employees/employees.types";
import type {
  InventoryResponsibleOption,
  InventorySessionSummary,
  ProductItem,
} from "@/modules/inventory/inventory.types";

export function InventoryAuditTab({
  products,
  responsibleOptions,
  sessions,
  employees,
  canManageInventory,
  lowStockCount,
  zeroStockCount,
}: {
  products: ProductItem[];
  responsibleOptions: InventoryResponsibleOption[];
  sessions: InventorySessionSummary[];
  employees: Employee[];
  canManageInventory: boolean;
  lowStockCount: number;
  zeroStockCount: number;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr] xl:items-start">
      <div className="space-y-4">
        <section className="rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
            Инвентаризация
          </p>
          <h2 className="mt-1 max-w-[18rem] text-[1.35rem] font-semibold leading-tight text-zinc-950">
            Сверка факта и системы
          </h2>
          <p className="mt-2 max-w-md text-xs leading-5 text-zinc-600">
            Проводи ревизию по товарам, фиксируй реальные остатки и сразу обновляй склад по факту пересчёта.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <AuditHeroStat label="На сверку" value={products.length} hint="Всех складских позиций в системе" />
            <AuditHeroStat label="Мало остатка" value={lowStockCount} hint="Позиции, которые стоит проверить в первую очередь" />
            <AuditHeroStat label="Нулевой остаток" value={zeroStockCount} hint="Позиции, где система уже показывает ноль" />
          </div>
        </section>

        <section className="rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl sm:p-5">
          <h2 className="text-base font-semibold text-zinc-950">Как работать с ревизией</h2>
          <div className="mt-4 space-y-3">
            <AuditStep title="1. Найди нужную группу товаров">
              Отфильтруй список по категории или найди конкретный товар по названию и внутреннему коду.
            </AuditStep>
            <AuditStep title="2. Внеси фактический остаток">
              Вводи только те позиции, которые уже пересчитаны. Черновик сохраняется локально и не слетает при обновлении страницы.
            </AuditStep>
            <AuditStep title="3. Сохрани итоговый лист">
              После создания лист зафиксирует выбранные товары, ответственного и остатки системы на текущий момент.
            </AuditStep>
          </div>
        </section>

        <section className="rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl sm:p-5">
          <h2 className="text-base font-semibold text-zinc-950">Готовность команды</h2>
          <p className="mt-2 text-xs leading-5 text-zinc-600">
            Ответственный за инвентаризацию выбирается из текущего списка сотрудников.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <TeamStat label="Сотрудников доступно" value={employees.length} />
            <TeamStat label="Создано листов" value={sessions.length} />
          </div>
        </section>
      </div>

      <InventoryAuditDialogs
        products={products}
        responsibleOptions={responsibleOptions}
        sessions={sessions}
        canManageInventory={canManageInventory}
        lowStockCount={lowStockCount}
        zeroStockCount={zeroStockCount}
      />
    </div>
  );
}

function AuditHeroStat({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-[18px] border border-red-950/10 bg-white/78 p-4 shadow-sm shadow-red-950/5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">{label}</p>
      <p className="mt-3 text-2xl font-semibold leading-none text-zinc-950">{value}</p>
      <p className="mt-2 text-[11px] leading-4 text-zinc-500">{hint}</p>
    </div>
  );
}

function AuditStep({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[18px] border border-red-950/10 bg-white/78 p-4 shadow-sm shadow-red-950/5">
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-600">{children}</p>
    </div>
  );
}

function TeamStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-red-950/10 bg-white/78 p-4 shadow-sm shadow-red-950/5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">{label}</p>
      <p className="mt-3 text-2xl font-semibold leading-none text-zinc-950">{value}</p>
    </div>
  );
}
