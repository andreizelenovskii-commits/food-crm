"use client";

import { useMemo, useState } from "react";
import { SettingsDialog, type SettingsEditor } from "@/modules/settings/components/settings-dialog";
import { DeviceCard, IntegrationRow, Metric, Switch } from "@/modules/settings/components/settings-parts";

export type DeviceKind = "dispatcher" | "kitchen" | "printer" | "label";
export type IntegrationKind = "cashbox" | "ofd" | "onlinePayment" | "acquiring";

export type Device = {
  id: number;
  kind: DeviceKind;
  name: string;
  zone: string;
  status: "Активен" | "Тест" | "Отключен";
};

export type Integration = {
  kind: IntegrationKind;
  title: string;
  provider: string;
  account: string;
  enabled: boolean;
};

const INITIAL_DEVICES: Device[] = [
  { id: 1, kind: "dispatcher", name: "Экран диспетчера", zone: "Приём заказов", status: "Активен" },
  { id: 2, kind: "kitchen", name: "Экран повара", zone: "Горячий цех", status: "Тест" },
  { id: 3, kind: "printer", name: "Принтер чеков", zone: "Касса", status: "Отключен" },
  { id: 4, kind: "label", name: "Принтер этикеток", zone: "Упаковка", status: "Отключен" },
];

const INITIAL_INTEGRATIONS: Integration[] = [
  { kind: "cashbox", title: "Активная касса", provider: "Онлайн-касса", account: "Основная точка", enabled: false },
  { kind: "ofd", title: "ОФД", provider: "Оператор ФД", account: "Не подключено", enabled: false },
  { kind: "onlinePayment", title: "Онлайн-оплата", provider: "Платёжная форма", account: "Сайт и приложение", enabled: false },
  { kind: "acquiring", title: "Эквайринг", provider: "Терминал", account: "Зал и доставка", enabled: false },
];

export function SettingsControlCenter() {
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);
  const [editor, setEditor] = useState<SettingsEditor>(null);
  const [activeDeviceId, setActiveDeviceId] = useState<number | null>(null);
  const [activeIntegrationKind, setActiveIntegrationKind] = useState<IntegrationKind | null>(null);

  const activeDevices = devices.filter((device) => device.status === "Активен").length;
  const enabledIntegrations = integrations.filter((item) => item.enabled).length;
  const activeDevice = devices.find((device) => device.id === activeDeviceId) ?? null;
  const activeIntegration = integrations.find((item) => item.kind === activeIntegrationKind) ?? null;

  const readiness = useMemo(() => {
    const total = devices.length + integrations.length;
    return Math.round(((activeDevices + enabledIntegrations) / total) * 100);
  }, [activeDevices, devices.length, enabledIntegrations, integrations.length]);

  function openDevice(id: number | null, kind: DeviceKind = "dispatcher") {
    setActiveDeviceId(id);
    setEditor(kind);
  }

  function saveDevice(device: Device) {
    setDevices((items) => {
      const prepared = device.id === 0 ? { ...device, id: Math.max(0, ...items.map((item) => item.id)) + 1 } : device;
      return items.some((item) => item.id === prepared.id)
        ? items.map((item) => (item.id === prepared.id ? prepared : item))
        : [prepared, ...items];
    });
    setEditor(null);
  }

  function openIntegration(kind: IntegrationKind) {
    setActiveIntegrationKind(kind);
    setEditor(kind);
  }

  function saveIntegration(next: Integration) {
    setIntegrations((items) => items.map((item) => (item.kind === next.kind ? next : item)));
    setEditor(null);
  }

  return (
    <>
      <div className="foodlike-frame grid gap-4 p-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(390px,0.92fr)]">
        <section className="space-y-4">
          <section className="rounded-[18px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_54px_rgba(127,29,29,0.09)] backdrop-blur-2xl">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="foodlike-kicker">Системный контур</p>
                <h2 className="mt-1 text-xl font-semibold text-zinc-950">Оборудование и оплаты</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                  Управление экранами, кассой, ОФД, оплатой, эквайрингом и принтерами.
                </p>
              </div>
              <span className="rounded-[12px] border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
                Готовность {readiness}%
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Metric label="Устройств" value={devices.length} />
              <Metric label="Активно" value={activeDevices} />
              <Metric label="Интеграций" value={`${enabledIntegrations}/${integrations.length}`} />
            </div>
          </section>

          <section className="rounded-[18px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_54px_rgba(127,29,29,0.09)] backdrop-blur-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="foodlike-kicker">Экраны и печать</p>
                <h3 className="mt-1 text-lg font-semibold text-zinc-950">Подключения</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => openDevice(null, "dispatcher")} className="foodlike-button-secondary">Экран</button>
                <button type="button" onClick={() => openDevice(null, "printer")} className="foodlike-button-primary">Принтер</button>
              </div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {devices.map((device) => (
                <DeviceCard key={device.id} device={device} onEdit={() => openDevice(device.id, device.kind)} />
              ))}
            </div>
          </section>
        </section>

        <aside className="space-y-4">
          <section className="rounded-[18px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_54px_rgba(127,29,29,0.09)] backdrop-blur-2xl">
            <p className="foodlike-kicker">Финансы</p>
            <div className="mt-3 divide-y divide-red-950/10">
              {integrations.map((item) => (
                <IntegrationRow
                  key={item.kind}
                  integration={item}
                  onEdit={() => openIntegration(item.kind)}
                  toggle={
                    <Switch
                      checked={item.enabled}
                      onChange={(enabled) => saveIntegration({ ...item, enabled })}
                    />
                  }
                />
              ))}
            </div>
          </section>

          <section className="rounded-[18px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_54px_rgba(127,29,29,0.09)] backdrop-blur-2xl">
            <p className="foodlike-kicker">Быстрые действия</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => openIntegration("cashbox")} className="foodlike-button-secondary justify-center">Касса</button>
              <button type="button" onClick={() => openIntegration("ofd")} className="foodlike-button-secondary justify-center">ОФД</button>
              <button type="button" onClick={() => openIntegration("onlinePayment")} className="foodlike-button-secondary justify-center">Онлайн-оплата</button>
              <button type="button" onClick={() => openDevice(null, "label")} className="foodlike-button-secondary justify-center">Этикетки</button>
            </div>
          </section>
        </aside>
      </div>

      {editor ? (
        <SettingsDialog
          device={activeDevice}
          editor={editor}
          integration={activeIntegration}
          onClose={() => setEditor(null)}
          onSaveDevice={saveDevice}
          onSaveIntegration={saveIntegration}
        />
      ) : null}
    </>
  );
}
