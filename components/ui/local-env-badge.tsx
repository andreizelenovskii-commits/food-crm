import { IS_LOCAL_APP_ENV } from "@/shared/app-env";

export function LocalEnvBadge({ clockLabel }: { clockLabel?: string | null }) {
  if (!IS_LOCAL_APP_ENV) {
    return null;
  }

  return (
    <div className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-amber-800">
      LOCAL{clockLabel ? ` · ${clockLabel}` : ""}
    </div>
  );
}
