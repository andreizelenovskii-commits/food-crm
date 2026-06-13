"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { CATALOG_SITE_CATEGORIES } from "@/modules/catalog/catalog.types";
import { KITCHEN_ZONE_LABELS, type KitchenZone } from "@/modules/inventory/inventory.types";

type ZoneConfig = {
  id: KitchenZone;
  description: string;
  screen: string;
  labelPrinter: string;
  categories: string[];
};

const SCREENS = ["Экран пиццы", "Экран роллов", "Экран горячего цеха", "Экран диспетчера"];
const LABEL_PRINTERS = ["Этикетки кухня", "Этикетки суши", "Этикетки упаковка", "Без печати"];

const INITIAL_ZONES: ZoneConfig[] = [
  {
    id: "pizza",
    description: "Пиццы и пиццерийная упаковка.",
    screen: "Экран пиццы",
    labelPrinter: "Этикетки кухня",
    categories: ["Пицца"],
  },
  {
    id: "rolls",
    description: "Роллы, онигири, суши-доги и упаковка суши-зоны.",
    screen: "Экран роллов",
    labelPrinter: "Этикетки суши",
    categories: ["Роллы", "Холодные роллы", "Запеченные роллы", "Теплые роллы", "Суши-доги", "Сеты"],
  },
  {
    id: "fastfood",
    description: "Фастфуд и горячие блюда с отдельной упаковкой.",
    screen: "Экран горячего цеха",
    labelPrinter: "Этикетки кухня",
    categories: ["Фастфуд", "Паназиатская кухня", "Пасты", "Супы"],
  },
  {
    id: "dispatch",
    description: "Позиции и упаковка, которые обрабатывает диспетчерская.",
    screen: "Экран диспетчера",
    labelPrinter: "Этикетки упаковка",
    categories: ["Салаты", "Комбо", "Детское меню", "Десерты", "Напитки", "Баббл-напитки"],
  },
];

export function KitchenZonesEditor() {
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [activeZoneId, setActiveZoneId] = useState<KitchenZone | null>(null);
  const activeZone = zones.find((zone) => zone.id === activeZoneId) ?? null;

  function saveZone(nextZone: ZoneConfig) {
    setZones((items) => items.map((item) => (item.id === nextZone.id ? nextZone : item)));
    setActiveZoneId(null);
  }

  return (
    <>
      <div className="foodlike-frame grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-[18px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_54px_rgba(127,29,29,0.09)] backdrop-blur-2xl">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="foodlike-kicker">Кухня</p>
              <h2 className="mt-1 text-xl font-semibold text-zinc-950">Зоны приготовления</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Нажми на зону, чтобы выбрать экран, принтер этикеток и категории сайта.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {zones.map((zone) => (
              <button
                key={zone.id}
                type="button"
                onClick={() => setActiveZoneId(zone.id)}
                className="rounded-[14px] border border-red-950/10 bg-white/76 p-4 text-left transition hover:border-red-200 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-950">{KITCHEN_ZONE_LABELS[zone.id]}</h3>
                    <p className="mt-1 text-sm leading-6 text-zinc-600">{zone.description}</p>
                  </div>
                  <span className="rounded-[10px] bg-red-50 px-3 py-1 text-xs font-semibold text-red-800">
                    {zone.categories.length}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-xs font-semibold text-zinc-500 sm:grid-cols-2">
                  <span>{zone.screen}</span>
                  <span>{zone.labelPrinter}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside className="rounded-[18px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_54px_rgba(127,29,29,0.09)] backdrop-blur-2xl">
          <p className="foodlike-kicker">Маршруты</p>
          <div className="mt-3 divide-y divide-red-950/10">
            {zones.map((zone) => (
              <button
                key={zone.id}
                type="button"
                onClick={() => setActiveZoneId(zone.id)}
                className="grid w-full gap-1 py-3 text-left"
              >
                <span className="text-sm font-semibold text-zinc-950">{KITCHEN_ZONE_LABELS[zone.id]}</span>
                <span className="text-xs leading-5 text-zinc-500">{zone.categories.join(", ")}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>

      {activeZone ? (
        <ZoneDialog zone={activeZone} onClose={() => setActiveZoneId(null)} onSave={saveZone} />
      ) : null}
    </>
  );
}

function ZoneDialog({
  onClose,
  onSave,
  zone,
}: {
  onClose: () => void;
  onSave: (zone: ZoneConfig) => void;
  zone: ZoneConfig;
}) {
  const [draft, setDraft] = useState(zone);

  if (typeof document === "undefined") {
    return null;
  }

  function toggleCategory(category: string) {
    setDraft((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category],
    }));
  }

  return createPortal(
    <div className="fixed inset-0 z-90 overflow-y-auto bg-zinc-950/35 px-4 py-6 backdrop-blur-sm sm:py-8">
      <button type="button" onClick={onClose} className="fixed inset-0 cursor-default" aria-label="Закрыть окно" />
      <section className="relative mx-auto w-full max-w-3xl rounded-[20px] border border-white/70 bg-[#fffdfc] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.16)]">
        <div className="flex items-start justify-between gap-3 border-b border-red-950/10 pb-3">
          <div>
            <p className="foodlike-kicker">Зона</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-950">{KITCHEN_ZONE_LABELS[draft.id]}</h2>
          </div>
          <button type="button" onClick={onClose} className="foodlike-button-secondary min-h-9 px-4 text-xs">Закрыть</button>
        </div>

        <form className="mt-4 space-y-4" onSubmit={(event) => { event.preventDefault(); onSave(draft); }}>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-red-800/70">Описание</span>
            <textarea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} rows={3} className="mt-2 w-full rounded-[12px] border border-red-950/10 bg-white px-3 py-3 text-sm font-medium leading-6 text-zinc-950 outline-none" />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField label="Экран" value={draft.screen} options={SCREENS} onChange={(screen) => setDraft((current) => ({ ...current, screen }))} />
            <SelectField label="Принтер этикеток" value={draft.labelPrinter} options={LABEL_PRINTERS} onChange={(labelPrinter) => setDraft((current) => ({ ...current, labelPrinter }))} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-800/70">Категории сайта</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {CATALOG_SITE_CATEGORIES.map((category) => {
                const checked = draft.categories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={[
                      "rounded-[12px] border px-3 py-2 text-left text-sm font-semibold transition",
                      checked ? "border-red-200 bg-red-50 text-red-900" : "border-red-950/10 bg-white text-zinc-700 hover:border-red-200",
                    ].join(" ")}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="foodlike-button-primary">Сохранить зону</button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-red-800/70">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-[12px] border border-red-950/10 bg-white px-3 text-sm font-medium text-zinc-950 outline-none">
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
