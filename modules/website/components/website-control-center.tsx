"use client";

import { useEffect, useMemo, useState } from "react";
import { ControlRow, EditableCard, Metric, Switch } from "@/modules/website/components/website-control-parts";
import { WebsiteDialog, type WebsiteEditor } from "@/modules/website/components/website-dialog";
import {
  persistMaintenanceModeSnapshot,
  readMaintenanceModeSnapshot,
} from "@/shared/config/maintenance-mode";

export type GiveawayStatus = "Активен" | "Запланирован" | "Черновик";

export type Giveaway = {
  id: number;
  title: string;
  prize: string;
  channel: string;
  endsAt: string;
  status: GiveawayStatus;
};

export type PromoSettings = {
  bannerTitle: string;
  bannerText: string;
  pushTitle: string;
  pushText: string;
  appVersion: string;
  appStatus: string;
};

const DEFAULT_MESSAGE =
  "Проходят технические работы. Приносим свои извинения. Заказ вы можете сделать по номеру телефона.";

const INITIAL_GIVEAWAYS: Giveaway[] = [
  {
    id: 1,
    title: "Пицца недели",
    prize: "Сертификат на 2 000 ₽",
    channel: "Сайт и приложение",
    endsAt: "18 июня",
    status: "Активен",
  },
  {
    id: 2,
    title: "Запуск приложения",
    prize: "Промокод первым клиентам",
    channel: "Приложение",
    endsAt: "После релиза",
    status: "Черновик",
  },
];

const INITIAL_PROMO: PromoSettings = {
  bannerTitle: "Пицца недели",
  bannerText: "Сертификат на 2 000 ₽ среди заказов с сайта.",
  pushTitle: "Ваш заказ уже рядом",
  pushText: "Push для будущего приложения: статус заказа и промокоды.",
  appVersion: "MVP 0.1",
  appStatus: "Меню, кабинет, push, розыгрыши",
};

export function WebsiteControlCenter({
  orderPhoneHref,
  orderPhoneLabel,
  publicSiteUrl,
}: {
  orderPhoneHref: string;
  orderPhoneLabel: string;
  publicSiteUrl: string;
}) {
  const [editor, setEditor] = useState<WebsiteEditor>(null);
  const [editingGiveawayId, setEditingGiveawayId] = useState<number | null>(null);
  const [giveaways, setGiveaways] = useState(INITIAL_GIVEAWAYS);
  const [promo, setPromo] = useState(INITIAL_PROMO);
  const [siteName, setSiteName] = useState("FoodLike");
  const [siteEnabled, setSiteEnabled] = useState(true);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(
    () =>
      typeof window !== "undefined" &&
      readMaintenanceModeSnapshot().enabled,
  );
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    () => (typeof window !== "undefined" && readMaintenanceModeSnapshot().message) || DEFAULT_MESSAGE,
  );

  const activeGiveaways = giveaways.filter((item) => item.status === "Активен").length;
  const siteStatus = siteEnabled ? (maintenanceEnabled ? "Техработы" : "Online") : "Выключен";
  const editingGiveaway = giveaways.find((item) => item.id === editingGiveawayId) ?? null;

  const statusClass = useMemo(() => {
    if (!siteEnabled) {
      return "border-zinc-200 bg-zinc-50 text-zinc-700";
    }

    return maintenanceEnabled
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";
  }, [maintenanceEnabled, siteEnabled]);

  useEffect(() => {
    persistMaintenanceModeSnapshot({
      enabled: maintenanceEnabled,
      message: maintenanceMessage,
    });
  }, [maintenanceEnabled, maintenanceMessage]);

  function openGiveawayEditor(id: number | null) {
    setEditingGiveawayId(id);
    setEditor("giveaway");
  }

  function saveGiveaway(nextGiveaway: Giveaway) {
    setGiveaways((items) => {
      const preparedGiveaway =
        nextGiveaway.id === 0
          ? { ...nextGiveaway, id: Math.max(0, ...items.map((item) => item.id)) + 1 }
          : nextGiveaway;

      if (items.some((item) => item.id === nextGiveaway.id)) {
        return items.map((item) => (item.id === preparedGiveaway.id ? preparedGiveaway : item));
      }

      return [preparedGiveaway, ...items];
    });
    setEditor(null);
  }

  return (
    <>
      <div className="foodlike-frame grid gap-4 p-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)]">
        <section className="space-y-4">
          <section className="rounded-[18px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_54px_rgba(127,29,29,0.09)] backdrop-blur-2xl">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="foodlike-kicker">Управление</p>
                <h2 className="mt-1 text-xl font-semibold text-zinc-950">Сайт и приложение</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                  Все основные действия собраны в редактируемых блоках.
                </p>
              </div>
              <span className={`inline-flex min-h-9 items-center rounded-[12px] border px-3 text-sm font-semibold ${statusClass}`}>
                {siteStatus}
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Metric label="Сайт" value={siteStatus} />
              <Metric label="Розыгрыши" value={activeGiveaways} />
              <Metric label="Приложение" value={promo.appVersion} />
            </div>
          </section>

          <section className="rounded-[18px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_54px_rgba(127,29,29,0.09)] backdrop-blur-2xl">
            <div className="grid gap-3">
              <ControlRow
                label="Публичный сайт"
                value={siteName}
                hint={siteEnabled ? "Витрина доступна клиентам" : "Витрина скрыта"}
                actionLabel="Изменить"
                onAction={() => setEditor("site")}
              >
                <Switch checked={siteEnabled} onChange={setSiteEnabled} />
              </ControlRow>
              <ControlRow
                label="Технические работы"
                value={maintenanceEnabled ? "Включены" : "Выключены"}
                hint={maintenanceMessage}
                actionLabel="Текст"
                onAction={() => setEditor("maintenance")}
              >
                <Switch checked={maintenanceEnabled} onChange={setMaintenanceEnabled} />
              </ControlRow>
            </div>
          </section>

          <section className="rounded-[18px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_54px_rgba(127,29,29,0.09)] backdrop-blur-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="foodlike-kicker">Розыгрыши</p>
                <h3 className="mt-1 text-lg font-semibold text-zinc-950">Акции</h3>
              </div>
              <button type="button" onClick={() => openGiveawayEditor(null)} className="foodlike-button-primary">
                Создать
              </button>
            </div>
            <div className="mt-3 divide-y divide-red-950/10">
              {giveaways.map((giveaway) => (
                <button
                  key={giveaway.id}
                  type="button"
                  onClick={() => openGiveawayEditor(giveaway.id)}
                  className="grid w-full gap-2 py-3 text-left transition hover:bg-red-50/35 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <span>
                    <span className="block text-sm font-semibold text-zinc-950">{giveaway.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-zinc-500">
                      {giveaway.prize} · {giveaway.channel} · до {giveaway.endsAt}
                    </span>
                  </span>
                  <span className="rounded-[10px] bg-red-50 px-3 py-1 text-xs font-semibold text-red-800">
                    {giveaway.status}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </section>

        <aside className="space-y-4">
          <section className="rounded-[18px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_54px_rgba(127,29,29,0.09)] backdrop-blur-2xl">
            <p className="foodlike-kicker">Промо</p>
            <div className="mt-3 grid gap-3">
              <EditableCard title="Баннер на сайте" value={promo.bannerTitle} hint={promo.bannerText} onEdit={() => setEditor("banner")} />
              <EditableCard title="Push-кампания" value={promo.pushTitle} hint={promo.pushText} onEdit={() => setEditor("push")} />
              <EditableCard title="Мобильное приложение" value={promo.appVersion} hint={promo.appStatus} onEdit={() => setEditor("app")} />
            </div>
          </section>

          <section className="rounded-[18px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_54px_rgba(127,29,29,0.09)] backdrop-blur-2xl">
            <p className="foodlike-kicker">Быстрые действия</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <a href={publicSiteUrl} target="_blank" rel="noopener noreferrer" className="foodlike-button-secondary justify-center">
                Открыть сайт
              </a>
              <a href={orderPhoneHref} className="foodlike-button-secondary justify-center">
                Позвонить
              </a>
              <button type="button" onClick={() => setMaintenanceEnabled((value) => !value)} className="foodlike-button-secondary justify-center">
                {maintenanceEnabled ? "Выключить техработы" : "Включить техработы"}
              </button>
              <button type="button" onClick={() => setEditor("site")} className="foodlike-button-secondary justify-center">
                Настроить сайт
              </button>
            </div>
          </section>
        </aside>
      </div>

      {editor ? (
        <WebsiteDialog
          editor={editor}
          giveaway={editingGiveaway}
          maintenanceEnabled={maintenanceEnabled}
          maintenanceMessage={maintenanceMessage}
          orderPhoneLabel={orderPhoneLabel}
          promo={promo}
          siteEnabled={siteEnabled}
          siteName={siteName}
          onClose={() => setEditor(null)}
          onSaveGiveaway={saveGiveaway}
          onSaveMaintenance={(next) => {
            setMaintenanceEnabled(next.enabled);
            setMaintenanceMessage(next.message);
            setEditor(null);
          }}
          onSavePromo={(next) => {
            setPromo(next);
            setEditor(null);
          }}
          onSaveSite={(next) => {
            setSiteName(next.name);
            setSiteEnabled(next.enabled);
            setEditor(null);
          }}
        />
      ) : null}
    </>
  );
}
