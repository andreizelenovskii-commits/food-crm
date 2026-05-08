type ProfilePanelKind = "schedule" | "metrics" | "access" | "adjustments";

export function ProfileSummaryTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[16px] border border-red-950/10 bg-white/84 px-3 py-3 shadow-sm shadow-red-950/5">
      <p className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-red-800/55">{label}</p>
      <p className="mt-1 text-lg font-semibold leading-none text-zinc-950">{value}</p>
    </div>
  );
}

export function ProfileMoneyRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[14px] border border-red-950/10 bg-white/78 px-3 py-2.5 shadow-sm shadow-red-950/5">
      <span className="text-xs font-semibold text-zinc-500">{label}</span>
      <span className="text-sm font-semibold text-zinc-950">{formatProfileMoney(value)}</span>
    </div>
  );
}

export function formatProfileMoney(cents: number) {
  return `${(cents / 100).toFixed(0)} ₽`;
}

export function ProfilePanelButton({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ProfilePanelKind;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-3 rounded-[16px] border border-red-950/10 bg-white/84 px-3.5 py-3 text-left shadow-sm shadow-red-950/5 transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-white"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-red-800 text-white shadow-sm shadow-red-950/15">
          <ProfilePanelIcon kind={icon} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold tracking-[-0.01em] text-zinc-950">{title}</span>
          <span className="mt-0.5 block truncate text-xs leading-5 text-zinc-500">{description}</span>
        </span>
      </span>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-red-100 bg-white/84 text-sm font-semibold text-red-800 transition group-hover:border-red-800 group-hover:bg-red-800 group-hover:text-white">
        →
      </span>
    </button>
  );
}

function ProfilePanelIcon({ kind }: { kind: ProfilePanelKind }) {
  if (kind === "schedule") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </svg>
    );
  }
  if (kind === "access") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <path d="M7 11V8a5 5 0 0 1 10 0v3" />
      </svg>
    );
  }
  if (kind === "adjustments") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
        <path d="M12 3v18M3 12h18" />
        <path d="M7 7h10v10H7z" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M4 19V9M10 19V5M16 19v-7M22 19v-3" />
    </svg>
  );
}
