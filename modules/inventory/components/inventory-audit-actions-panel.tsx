export function InventoryAuditActionsPanel({
  productsCount,
  activeSessionsCount,
  lowStockCount,
  zeroStockCount,
  onCreate,
  onOpenActive,
  onOpenHistory,
}: {
  productsCount: number;
  activeSessionsCount: number;
  lowStockCount: number;
  zeroStockCount: number;
  onCreate: () => void;
  onOpenActive: () => void;
  onOpenHistory: () => void;
}) {
  return (
    <aside className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5 xl:p-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Действия</p>
        <h2 className="text-[1.45rem] font-semibold tracking-[-0.02em] text-zinc-950">
          Управление инвентаризацией
        </h2>
        <p className="text-sm leading-6 text-zinc-600">
          Создавай новые листы, веди открытые инвентаризации и просматривай уже закрытые сессии.
        </p>
      </div>

      <div className="mt-4 grid gap-4">
        <AuditActionButton
          eyebrow="Новая сессия"
          title="Создать инвентаризацию"
          description="Выбери товары, назначь ответственного и зафиксируй стартовый лист инвентаризации."
          tone="dark"
          onClick={onCreate}
        />
        <AuditActionButton
          eyebrow="В работе"
          title="Действующие инвентаризации"
          description="Открывай незакрытые листы и веди фактические остатки с расчётом расхождений."
          tone="amber"
          onClick={onOpenActive}
        />
        <AuditActionButton
          eyebrow="Архив"
          title="Закрытые инвентаризации"
          description="Смотри завершённые листы и историю уже закрытых пересчётов."
          tone="light"
          onClick={onOpenHistory}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <AuditActionStat label="На складе" value={productsCount} />
        <AuditActionStat label="Открыто" value={activeSessionsCount} />
        <AuditActionStat label="Мало остатка" value={lowStockCount} />
        <AuditActionStat label="Ноль на складе" value={zeroStockCount} />
      </div>
    </aside>
  );
}

function AuditActionButton({
  eyebrow,
  title,
  description,
  tone,
  onClick,
}: {
  eyebrow: string;
  title: string;
  description: string;
  tone: "dark" | "amber" | "light";
  onClick: () => void;
}) {
  const toneClass = {
    dark: "border-zinc-950 bg-zinc-950 text-white hover:bg-zinc-800",
    amber: "border-amber-200 bg-amber-50 text-zinc-950 hover:border-amber-300 hover:bg-amber-100/60",
    light: "border-zinc-200 bg-zinc-50 text-zinc-950 hover:border-zinc-300 hover:bg-white",
  }[tone];
  const eyebrowClass = tone === "dark" ? "text-white/70" : tone === "amber" ? "text-amber-700" : "text-zinc-400";
  const bodyClass = tone === "dark" ? "text-white/75" : "text-zinc-600";

  return (
    <button type="button" onClick={onClick} className={`rounded-[14px] border px-5 py-5 text-left transition ${toneClass}`}>
      <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${eyebrowClass}`}>{eyebrow}</p>
      <p className={`mt-3 font-semibold tracking-[-0.02em] ${tone === "dark" ? "text-[1.35rem] text-white" : "text-[1.25rem] text-zinc-950"}`}>
        {title}
      </p>
      <p className={`mt-2 text-sm leading-6 ${bodyClass}`}>{description}</p>
    </button>
  );
}

function AuditActionStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-zinc-950">{value}</p>
    </div>
  );
}
