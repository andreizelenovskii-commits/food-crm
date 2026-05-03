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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-950/50 px-4 py-8 backdrop-blur-sm" onClick={onClose} role="presentation">
      <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[calc(100vh-4rem)] w-full max-w-7xl overflow-y-auto rounded-[14px] border border-zinc-200 bg-[#fffdfc] p-4 shadow-2xl shadow-zinc-950/20 sm:p-6" onClick={(event) => event.stopPropagation()}>
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
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">{eyebrow}</p>
        <h3 className="text-[1.55rem] font-semibold tracking-[-0.02em] text-zinc-950">{title}</h3>
        <p className="max-w-2xl text-sm leading-6 text-zinc-600">{description}</p>
      </div>
      <button type="button" onClick={onClose} className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950">
        Закрыть
      </button>
    </div>
  );
}

export function AuditMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {children}
    </div>
  );
}

export function AuditStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-zinc-950">{value}</p>
    </div>
  );
}

export function AuditEmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] border border-dashed border-zinc-300 bg-zinc-50 px-5 py-4 text-sm leading-6 text-zinc-500 sm:py-5">
      {children}
    </div>
  );
}
