"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ModuleIcon } from "@/components/ui/module-icon";
import { formatMoney } from "@/modules/inventory/components/inventory-panel-utils";
import {
  loadInventorySuppliers,
  saveInventorySupplier,
  subscribeInventorySuppliers,
  SUPPLIER_CATEGORIES,
  type InventorySupplierCategory,
  type InventorySupplierRecord,
} from "@/modules/inventory/components/inventory-supplier-storage";
import type { IncomingActSummary } from "@/modules/inventory/inventory.types";

type SupplierSummary = {
  name: string;
  category: string | null;
  actsCount: number;
  totalCents: number;
  lastIncomingAt: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function buildSupplierSummaries(
  acts: IncomingActSummary[],
  savedSuppliers: InventorySupplierRecord[],
) {
  const suppliers = new Map<string, SupplierSummary>();

  savedSuppliers.forEach((supplier) => {
    suppliers.set(supplier.name, {
      name: supplier.name,
      category: supplier.category,
      actsCount: 0,
      totalCents: 0,
      lastIncomingAt: supplier.createdAt,
    });
  });

  acts.forEach((act) => {
    const name = act.supplierName?.trim();

    if (!name) {
      return;
    }

    const current = suppliers.get(name);

    if (!current) {
      suppliers.set(name, {
        name,
        category: null,
        actsCount: 1,
        totalCents: act.totalCents,
        lastIncomingAt: act.createdAt,
      });
      return;
    }

    suppliers.set(name, {
      ...current,
      actsCount: current.actsCount + 1,
      totalCents: current.totalCents + act.totalCents,
      lastIncomingAt:
        new Date(act.createdAt) > new Date(current.lastIncomingAt)
          ? act.createdAt
          : current.lastIncomingAt,
    });
  });

  return Array.from(suppliers.values()).sort((left, right) =>
    left.name.localeCompare(right.name, "ru"),
  );
}

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function SuppliersDialog({
  title,
  eyebrow,
  children,
  onClose,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-70 overflow-y-auto bg-zinc-950/30 px-4 py-6 backdrop-blur-sm sm:py-8">
      <button type="button" onClick={onClose} className="fixed inset-0 cursor-default" aria-label="Закрыть окно поставщиков" />
      <section className="relative mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
        <div className="relative space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
                <ModuleIcon name="users" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">{eyebrow}</p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-950">{title}</h2>
              </div>
            </div>
            <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
              Закрыть
            </button>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}

function SupplierActionCard({
  eyebrow,
  title,
  description,
  buttonLabel,
  count,
  onClick,
}: {
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <section className="group rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-white/82">
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
            <ModuleIcon name="users" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">{eyebrow}</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-950">{title}</h2>
            <p className="mt-2 text-xs leading-5 text-zinc-500">{description}</p>
          </div>
        </div>
        <button type="button" onClick={onClick} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-red-800 px-5 text-[13px] font-medium tracking-[-0.01em] text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900">
          {buttonLabel}{count === undefined ? "" : ` · ${count}`}
          <ArrowIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}

function SupplierCreateForm({
  onSave,
}: {
  onSave: (name: string, category: InventorySupplierCategory) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<InventorySupplierCategory | "">("");

  return (
    <form
      action={() => {
        if (!name.trim() || !category) {
          return;
        }

        onSave(name, category);
        setName("");
        setCategory("");
      }}
      className="grid gap-3 rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl"
    >
      <label className="space-y-1.5">
        <span className="text-[11px] font-semibold text-zinc-700">Название поставщика</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Например: Фермерский двор"
          className="h-10 w-full rounded-full border border-red-950/10 bg-white/85 px-4 text-sm font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
        />
      </label>
      <label className="space-y-1.5">
        <span className="text-[11px] font-semibold text-zinc-700">Категория поставщика</span>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as InventorySupplierCategory)}
          className="h-10 w-full rounded-full border border-red-950/10 bg-white/85 px-4 text-sm font-medium text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
        >
          <option value="" disabled>Выбери категорию</option>
          {SUPPLIER_CATEGORIES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={!name.trim() || !category} className="mt-1 inline-flex h-10 items-center justify-center rounded-full bg-red-800 px-5 text-sm font-medium text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-100 disabled:text-red-300">
        Сохранить поставщика
      </button>
    </form>
  );
}

export function InventorySuppliersTab({ acts }: { acts: IncomingActSummary[] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [savedSuppliers, setSavedSuppliers] = useState<InventorySupplierRecord[]>(
    loadInventorySuppliers,
  );
  const suppliers = useMemo(
    () => buildSupplierSummaries(acts, savedSuppliers),
    [acts, savedSuppliers],
  );

  useEffect(() => {
    return subscribeInventorySuppliers(() => {
      setSavedSuppliers(loadInventorySuppliers());
    });
  }, []);

  const handleSupplierSave = (name: string, category: InventorySupplierCategory) => {
    setSavedSuppliers(saveInventorySupplier({ name, category }));
    setIsCreateOpen(false);
  };

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-2">
        <SupplierActionCard eyebrow="Новый поставщик" title="Добавить поставщика" description="Карточка поставщика с категорией: городская закупка или внешняя поставка." buttonLabel="Добавить поставщика" onClick={() => setIsCreateOpen(true)} />
        <SupplierActionCard eyebrow="База поставщиков" title="Действующие поставщики" description="Поставщики, которые уже встречались в актах поступления." buttonLabel="Действующие поставщики" count={suppliers.length} onClick={() => setIsListOpen(true)} />
      </div>

      {isCreateOpen && typeof document !== "undefined"
        ? createPortal(
            <SuppliersDialog title="Добавить поставщика" eyebrow="Новый поставщик" onClose={() => setIsCreateOpen(false)}>
              <SupplierCreateForm onSave={handleSupplierSave} />
            </SuppliersDialog>,
            document.body,
          )
        : null}

      {isListOpen && typeof document !== "undefined"
        ? createPortal(
            <SuppliersDialog title="Действующие поставщики" eyebrow="База поставщиков" onClose={() => setIsListOpen(false)}>
              <div className="space-y-2 rounded-[22px] border border-white/70 bg-white/74 p-3 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
                {suppliers.length > 0 ? suppliers.map((supplier) => (
                  <article key={supplier.name} className="rounded-[16px] border border-red-950/10 bg-white/78 px-3 py-3 shadow-sm shadow-red-950/5">
                    <p className="text-sm font-semibold text-zinc-950">{supplier.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {supplier.category ?? "Категория не указана"} • Актов: {supplier.actsCount}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-red-800">
                      Закуплено на {formatMoney(supplier.totalCents)} • Последнее: {formatDate(supplier.lastIncomingAt)}
                    </p>
                  </article>
                )) : (
                  <div className="rounded-[16px] border border-dashed border-red-200 bg-white/55 px-4 py-5 text-sm text-zinc-500">
                    Действующих поставщиков пока нет.
                  </div>
                )}
              </div>
            </SuppliersDialog>,
            document.body,
          )
        : null}
    </>
  );
}
