"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { createPortal } from "react-dom";
import type { Giveaway, PromoSettings } from "@/modules/website/components/website-control-center";

export type WebsiteEditor = "site" | "maintenance" | "giveaway" | "banner" | "push" | "app" | null;

const STATUS_OPTIONS = ["Активен", "Запланирован", "Черновик"] as const;

export function WebsiteDialog({
  editor,
  giveaway,
  maintenanceEnabled,
  maintenanceMessage,
  orderPhoneLabel,
  promo,
  siteEnabled,
  siteName,
  onClose,
  onSaveGiveaway,
  onSaveMaintenance,
  onSavePromo,
  onSaveSite,
}: {
  editor: WebsiteEditor;
  giveaway: Giveaway | null;
  maintenanceEnabled: boolean;
  maintenanceMessage: string;
  orderPhoneLabel: string;
  promo: PromoSettings;
  siteEnabled: boolean;
  siteName: string;
  onClose: () => void;
  onSaveGiveaway: (giveaway: Giveaway) => void;
  onSaveMaintenance: (next: { enabled: boolean; message: string }) => void;
  onSavePromo: (next: PromoSettings) => void;
  onSaveSite: (next: { enabled: boolean; name: string }) => void;
}) {
  const [siteDraft, setSiteDraft] = useState({ enabled: siteEnabled, name: siteName });
  const [maintenanceDraft, setMaintenanceDraft] = useState({
    enabled: maintenanceEnabled,
    message: maintenanceMessage,
  });
  const [promoDraft, setPromoDraft] = useState(promo);
  const [giveawayDraft, setGiveawayDraft] = useState<Giveaway>(
    giveaway ?? {
      id: 0,
      title: "",
      prize: "",
      channel: "Сайт",
      endsAt: "",
      status: "Черновик",
    },
  );

  if (typeof document === "undefined" || !editor) {
    return null;
  }

  const title = dialogTitle(editor, giveaway);

  return createPortal(
    <div className="fixed inset-0 z-90 overflow-y-auto bg-zinc-950/35 px-4 py-6 backdrop-blur-sm sm:py-8">
      <button type="button" onClick={onClose} className="fixed inset-0 cursor-default" aria-label="Закрыть окно" />
      <section className="relative mx-auto w-full max-w-xl rounded-[20px] border border-white/70 bg-[#fffdfc] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.16)]">
        <div className="flex items-start justify-between gap-3 border-b border-red-950/10 pb-3">
          <div>
            <p className="foodlike-kicker">Редактирование</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-950">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="foodlike-button-secondary min-h-9 px-4 text-xs">
            Закрыть
          </button>
        </div>

        <div className="mt-4">
          {editor === "site" ? (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                onSaveSite(siteDraft);
              }}
            >
              <TextField label="Название сайта" value={siteDraft.name} onChange={(name) => setSiteDraft((draft) => ({ ...draft, name }))} />
              <CheckField label="Публичный сайт включён" checked={siteDraft.enabled} onChange={(enabled) => setSiteDraft((draft) => ({ ...draft, enabled }))} />
              <SubmitRow />
            </form>
          ) : null}

          {editor === "maintenance" ? (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                onSaveMaintenance(maintenanceDraft);
              }}
            >
              <CheckField label="Включить технические работы" checked={maintenanceDraft.enabled} onChange={(enabled) => setMaintenanceDraft((draft) => ({ ...draft, enabled }))} />
              <TextAreaField label="Сообщение на сайте и в приложении" value={maintenanceDraft.message} onChange={(message) => setMaintenanceDraft((draft) => ({ ...draft, message }))} />
              <p className="rounded-[12px] border border-red-950/10 bg-red-50/50 px-3 py-2 text-xs leading-5 text-red-900">
                Телефон для заказа: {orderPhoneLabel}
              </p>
              <SubmitRow />
            </form>
          ) : null}

          {editor === "giveaway" ? (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                onSaveGiveaway(giveawayDraft);
              }}
            >
              <TextField label="Название" value={giveawayDraft.title} onChange={(title) => setGiveawayDraft((draft) => ({ ...draft, title }))} />
              <TextField label="Приз" value={giveawayDraft.prize} onChange={(prize) => setGiveawayDraft((draft) => ({ ...draft, prize }))} />
              <TextField label="Канал" value={giveawayDraft.channel} onChange={(channel) => setGiveawayDraft((draft) => ({ ...draft, channel }))} />
              <TextField label="Дата окончания" value={giveawayDraft.endsAt} onChange={(endsAt) => setGiveawayDraft((draft) => ({ ...draft, endsAt }))} />
              <SelectField value={giveawayDraft.status} onChange={(status) => setGiveawayDraft((draft) => ({ ...draft, status }))} />
              <SubmitRow />
            </form>
          ) : null}

          {editor === "banner" || editor === "push" || editor === "app" ? (
            <PromoForm editor={editor} promoDraft={promoDraft} setPromoDraft={setPromoDraft} onSubmit={() => onSavePromo(promoDraft)} />
          ) : null}
        </div>
      </section>
    </div>,
    document.body,
  );
}

function PromoForm({
  editor,
  onSubmit,
  promoDraft,
  setPromoDraft,
}: {
  editor: Exclude<WebsiteEditor, "site" | "maintenance" | "giveaway" | null>;
  onSubmit: () => void;
  promoDraft: PromoSettings;
  setPromoDraft: Dispatch<SetStateAction<PromoSettings>>;
}) {
  const fields =
    editor === "banner"
      ? ([
          ["bannerTitle", "Заголовок баннера"],
          ["bannerText", "Текст баннера"],
        ] as const)
      : editor === "push"
        ? ([
            ["pushTitle", "Заголовок push"],
            ["pushText", "Текст push"],
          ] as const)
        : ([
            ["appVersion", "Версия"],
            ["appStatus", "Что входит"],
          ] as const);

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {fields.map(([key, label]) => (
        <TextField
          key={key}
          label={label}
          value={promoDraft[key]}
          onChange={(value) => setPromoDraft((draft) => ({ ...draft, [key]: value }))}
        />
      ))}
      <SubmitRow />
    </form>
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

function TextAreaField({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-red-800/70">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="mt-2 w-full rounded-[12px] border border-red-950/10 bg-white px-3 py-3 text-sm font-medium leading-6 text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10" />
    </label>
  );
}

function CheckField({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-[12px] border border-red-950/10 bg-white px-3 py-3 text-sm font-semibold text-zinc-950">
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-red-800" />
    </label>
  );
}

function SelectField({ onChange, value }: { onChange: (value: Giveaway["status"]) => void; value: Giveaway["status"] }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-red-800/70">Статус</span>
      <select value={value} onChange={(event) => onChange(event.target.value as Giveaway["status"])} className="mt-2 h-11 w-full rounded-[12px] border border-red-950/10 bg-white px-3 text-sm font-medium text-zinc-950 outline-none">
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>
    </label>
  );
}

function SubmitRow() {
  return (
    <div className="flex justify-end pt-2">
      <button type="submit" className="foodlike-button-primary">
        Сохранить
      </button>
    </div>
  );
}

function dialogTitle(editor: WebsiteEditor, giveaway: Giveaway | null) {
  if (editor === "site") return "Публичный сайт";
  if (editor === "maintenance") return "Технические работы";
  if (editor === "giveaway") return giveaway ? "Розыгрыш" : "Новый розыгрыш";
  if (editor === "banner") return "Баннер на сайте";
  if (editor === "push") return "Push-кампания";
  return "Мобильное приложение";
}
