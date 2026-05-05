export type InventoryFormAction = (formData: FormData) => void;

export function AuditDialogFrame({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-70 flex items-start justify-center overflow-y-auto bg-zinc-950/30 px-4 py-6 backdrop-blur-sm sm:py-8" onClick={onClose} role="presentation">
      <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[calc(100vh-3rem)] w-full max-w-7xl overflow-y-auto rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function AuditDialogHeader({
  eyebrow,
  title,
  description,
  onClose,
}: {
  eyebrow: string;
  title: string;
  description: string;
  onClose: () => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">{eyebrow}</p>
        <h3 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-zinc-950">{title}</h3>
        <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-600">{description}</p>
      </div>
      <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
        Закрыть
      </button>
    </div>
  );
}

export function AuditMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] border border-red-200 bg-red-50/80 px-4 py-3 text-xs font-medium text-red-800">
      {children}
    </div>
  );
}

export function AuditStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[16px] border border-red-950/10 bg-white/80 px-3 py-2.5 shadow-sm shadow-red-950/5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-red-800/50">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-zinc-950">{value}</p>
    </div>
  );
}

export function AuditEmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[18px] border border-dashed border-red-200 bg-white/70 px-4 py-3 text-xs leading-5 text-zinc-500 sm:py-4">
      {children}
    </div>
  );
}
