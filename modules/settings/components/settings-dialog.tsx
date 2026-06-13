"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { Device, DeviceKind, Integration, IntegrationKind } from "@/modules/settings/components/settings-control-center";

export type SettingsEditor = DeviceKind | IntegrationKind | null;

const DEVICE_STATUSES = ["Активен", "Тест", "Отключен"] as const;

const DEVICE_DEFAULTS: Record<DeviceKind, Omit<Device, "id">> = {
  dispatcher: { kind: "dispatcher", name: "Экран диспетчера", zone: "Приём заказов", status: "Тест" },
  kitchen: { kind: "kitchen", name: "Экран повара", zone: "Кухня", status: "Тест" },
  printer: { kind: "printer", name: "Принтер чеков", zone: "Касса", status: "Отключен" },
  label: { kind: "label", name: "Принтер этикеток", zone: "Упаковка", status: "Отключен" },
};

export function SettingsDialog({
  device,
  editor,
  integration,
  onClose,
  onSaveDevice,
  onSaveIntegration,
}: {
  device: Device | null;
  editor: SettingsEditor;
  integration: Integration | null;
  onClose: () => void;
  onSaveDevice: (device: Device) => void;
  onSaveIntegration: (integration: Integration) => void;
}) {
  const isDeviceEditor = editor === "dispatcher" || editor === "kitchen" || editor === "printer" || editor === "label";
  const [deviceDraft, setDeviceDraft] = useState<Device>(
    device ?? { id: 0, ...DEVICE_DEFAULTS[(isDeviceEditor ? editor : "dispatcher") as DeviceKind] },
  );
  const [integrationDraft, setIntegrationDraft] = useState<Integration>(
    integration ?? {
      kind: "cashbox",
      title: "Активная касса",
      provider: "Онлайн-касса",
      account: "Основная точка",
      enabled: false,
    },
  );

  if (typeof document === "undefined" || !editor) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-90 overflow-y-auto bg-zinc-950/35 px-4 py-6 backdrop-blur-sm sm:py-8">
      <button type="button" onClick={onClose} className="fixed inset-0 cursor-default" aria-label="Закрыть окно" />
      <section className="relative mx-auto w-full max-w-xl rounded-[20px] border border-white/70 bg-[#fffdfc] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.16)]">
        <div className="flex items-start justify-between gap-3 border-b border-red-950/10 pb-3">
          <div>
            <p className="foodlike-kicker">Настройка</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-950">{isDeviceEditor ? "Устройство" : integrationDraft.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="foodlike-button-secondary min-h-9 px-4 text-xs">Закрыть</button>
        </div>

        {isDeviceEditor ? (
          <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); onSaveDevice(deviceDraft); }}>
            <TextField label="Название" value={deviceDraft.name} onChange={(name) => setDeviceDraft((draft) => ({ ...draft, name }))} />
            <TextField label="Зона / точка" value={deviceDraft.zone} onChange={(zone) => setDeviceDraft((draft) => ({ ...draft, zone }))} />
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-red-800/70">Статус</span>
              <select value={deviceDraft.status} onChange={(event) => setDeviceDraft((draft) => ({ ...draft, status: event.target.value as Device["status"] }))} className="mt-2 h-11 w-full rounded-[12px] border border-red-950/10 bg-white px-3 text-sm font-medium text-zinc-950 outline-none">
                {DEVICE_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <SubmitRow />
          </form>
        ) : (
          <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); onSaveIntegration(integrationDraft); }}>
            <TextField label="Провайдер" value={integrationDraft.provider} onChange={(provider) => setIntegrationDraft((draft) => ({ ...draft, provider }))} />
            <TextField label="Аккаунт / точка" value={integrationDraft.account} onChange={(account) => setIntegrationDraft((draft) => ({ ...draft, account }))} />
            <label className="flex items-center justify-between gap-3 rounded-[12px] border border-red-950/10 bg-white px-3 py-3 text-sm font-semibold text-zinc-950">
              Активно
              <input type="checkbox" checked={integrationDraft.enabled} onChange={(event) => setIntegrationDraft((draft) => ({ ...draft, enabled: event.target.checked }))} className="size-4 accent-red-800" />
            </label>
            <SubmitRow />
          </form>
        )}
      </section>
    </div>,
    document.body,
  );
}

function TextField({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-red-800/70">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-[12px] border border-red-950/10 bg-white px-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10" />
    </label>
  );
}

function SubmitRow() {
  return (
    <div className="flex justify-end pt-2">
      <button type="submit" className="foodlike-button-primary">Сохранить</button>
    </div>
  );
}
