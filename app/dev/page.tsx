import Link from "next/link";
import { notFound } from "next/navigation";
import { LocalEnvBadge } from "@/components/ui/local-env-badge";
import { backendGetResult } from "@/shared/api/backend";
import { IS_LOCAL_APP_ENV } from "@/shared/app-env";
import { BUILD_VERSION_SHORT } from "@/shared/build-version";

type BackendHealth = {
  service: string;
  status: string;
  environment: string;
  timestamp: string;
};

type OrderingStatus = {
  acceptingOrders: boolean;
  businessDate: string;
  businessTimeZone: string;
  serverNow: string;
  message: string;
};

type DispatcherWorkspace = {
  shift: {
    state: string;
    displayNumber: string | null;
  };
  clock: {
    serverNow: string;
    businessDate: string;
    businessTimeZone: string;
  };
};

const LINKS = [
  ["Login", "/login"],
  ["Dispatcher", "/dispatcher/orders"],
  ["Kitchen", "/kitchen"],
  ["Shift history", "/dashboard/sales/shifts"],
  ["Public menu", "/menu/пицца"],
] as const;

function statusLabel(result: { ok: boolean; status?: number; message?: string }) {
  return result.ok ? "ok" : `${result.status ?? "error"} ${result.message ?? ""}`.trim();
}

export default async function DevPage() {
  if (!IS_LOCAL_APP_ENV) {
    notFound();
  }

  const [health, ordering, workspace] = await Promise.all([
    backendGetResult<BackendHealth>("/api/v1/health"),
    backendGetResult<OrderingStatus>("/api/v1/public/ordering-status"),
    backendGetResult<DispatcherWorkspace>("/api/v1/dispatcher/workspace"),
  ]);

  return (
    <main className="min-h-screen bg-[#fffaf7] px-4 py-6 text-zinc-950">
      <div className="mx-auto flex max-w-4xl flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-800/70">FoodLike</p>
            <h1 className="mt-1 text-3xl font-black">Local Development</h1>
          </div>
          <LocalEnvBadge />
        </div>

        <section className="grid gap-3 sm:grid-cols-2">
          <Info label="Frontend" value="ok" />
          <Info label="Frontend build" value={BUILD_VERSION_SHORT} />
          <Info label="Backend" value={statusLabel(health)} />
          <Info label="Backend environment" value={health.ok ? health.data.environment : "unknown"} />
          <Info label="DB reachable" value={health.ok ? "yes" : "unknown"} />
          <Info label="Ordering" value={ordering.ok ? ordering.data.message : statusLabel(ordering)} />
          <Info label="Business date" value={ordering.ok ? ordering.data.businessDate : "unknown"} />
          <Info label="Asia/Sakhalin time" value={ordering.ok ? ordering.data.serverNow : "unknown"} />
          <Info label="Accepting orders" value={ordering.ok ? String(ordering.data.acceptingOrders) : "unknown"} />
          <Info label="Shift state" value={workspace.ok ? workspace.data.shift.state : statusLabel(workspace)} />
        </section>

        <nav className="flex flex-wrap gap-2">
          {LINKS.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-800 transition hover:border-red-800 hover:bg-red-50">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-red-950/10 bg-white p-4 shadow-sm shadow-red-950/5">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="mt-2 break-words text-base font-bold">{value}</p>
    </div>
  );
}
