"use client";

import type { Device, Integration } from "@/modules/settings/components/settings-control-center";

export function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[14px] border border-red-950/10 bg-white/76 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/65">{label}</p>
      <p className="mt-1 text-xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

export function DeviceCard({ device, onEdit }: { device: Device; onEdit: () => void }) {
  return (
    <button type="button" onClick={onEdit} className="rounded-[14px] border border-red-950/10 bg-white/76 p-3 text-left transition hover:border-red-200 hover:bg-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-950">{device.name}</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">{kindLabel(device.kind)} · {device.zone}</p>
        </div>
        <span className="rounded-[10px] bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800">{device.status}</span>
      </div>
    </button>
  );
}

export function IntegrationRow({
  integration,
  onEdit,
  toggle,
}: {
  integration: Integration;
  onEdit: () => void;
  toggle: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 py-3 md:grid-cols-[1fr_auto_auto] md:items-center">
      <button type="button" onClick={onEdit} className="text-left">
        <p className="text-sm font-semibold text-zinc-950">{integration.title}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{integration.provider} · {integration.account}</p>
      </button>
      <p className="text-sm font-semibold text-red-800">{integration.enabled ? "Активно" : "Отключено"}</p>
      <div className="flex items-center justify-end gap-2">
        {toggle}
        <button type="button" onClick={onEdit} className="foodlike-button-secondary min-h-9 px-4 text-xs">Изменить</button>
      </div>
    </div>
  );
}

export function Switch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 rounded-[12px] transition ${checked ? "bg-red-800" : "bg-zinc-200"}`}
    >
      <span className={`absolute top-1 size-6 rounded-[9px] bg-white shadow-sm transition ${checked ? "left-7" : "left-1"}`} />
    </button>
  );
}

function kindLabel(kind: Device["kind"]) {
  if (kind === "dispatcher") return "Диспетчер";
  if (kind === "kitchen") return "Повар";
  if (kind === "label") return "Этикетки";
  return "Печать";
}
