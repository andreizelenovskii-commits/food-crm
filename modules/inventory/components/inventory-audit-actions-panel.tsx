export function InventoryAuditActionsPanel({
  activeSessionsCount,
  onCreate,
  onOpenActive,
  onOpenHistory,
}: {
  activeSessionsCount: number;
  onCreate: () => void;
  onOpenActive: () => void;
  onOpenHistory: () => void;
}) {
  return (
    <aside className="rounded-[24px] border border-white/70 bg-white/74 p-3 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl sm:p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Инвентаризация</p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-zinc-950">
            Управление инвентаризацией
          </h2>
        </div>
        <p className="max-w-xl text-xs leading-5 text-zinc-600">
          Создавай новые листы, веди открытые инвентаризации и просматривай уже закрытые сессии.
        </p>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <AuditActionButton
          eyebrow="Новая сессия"
          title="Создать инвентаризацию"
          description="Выбери товары, назначь ответственного и зафиксируй стартовый лист инвентаризации."
          icon="plus"
          onClick={onCreate}
        />
        <AuditActionButton
          eyebrow="В работе"
          title="Действующие инвентаризации"
          description="Открывай незакрытые листы и веди фактические остатки с расчётом расхождений."
          icon="active"
          count={activeSessionsCount}
          onClick={onOpenActive}
        />
        <AuditActionButton
          eyebrow="Архив"
          title="Закрытые инвентаризации"
          description="Смотри завершённые листы и историю уже закрытых пересчётов."
          icon="history"
          onClick={onOpenHistory}
        />
      </div>
    </aside>
  );
}
function AuditActionButton({
  eyebrow,
  title,
  description,
  icon,
  count,
  onClick,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: "plus" | "active" | "history";
  count?: number;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="group rounded-[18px] border border-red-950/10 bg-white/78 p-3 text-left shadow-sm shadow-red-950/5 transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-white/90">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] bg-red-800 text-white shadow-sm shadow-red-950/15">
          <AuditActionIcon name={icon} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">{eyebrow}</span>
          <span className="mt-1 flex items-center gap-2 text-sm font-semibold tracking-[-0.01em] text-zinc-950">
            {title}
            {count === undefined ? null : (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-800 ring-1 ring-red-100">
                {count}
              </span>
            )}
          </span>
          <span className="mt-1 block text-[11px] leading-4 text-zinc-500">{description}</span>
        </span>
      </div>
    </button>
  );
}

function AuditActionIcon({ name }: { name: "plus" | "active" | "history" }) {
  if (name === "plus") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }

  if (name === "active") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 7h16M4 12h10M4 17h7" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 8v5l3 2" />
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    </svg>
  );
}
