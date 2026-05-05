"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ModuleIcon } from "@/components/ui/module-icon";
import { InventoryIncomingCreateForm } from "@/modules/inventory/components/inventory-incoming-create-form";
import {
  IncomingCompletedActsSection,
  IncomingOpenActsSection,
} from "@/modules/inventory/components/inventory-incoming-sections";
import type { IncomingDraftProduct } from "@/modules/inventory/components/inventory-incoming-create-form-parts";
import type {
  IncomingActSummary,
  InventoryResponsibleOption,
  ProductItem,
} from "@/modules/inventory/inventory.types";

type FormAction = (formData: FormData) => void;
type IncomingActsTab = "open" | "history";

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function IncomingDialogShell({
  title,
  eyebrow,
  description,
  children,
  onClose,
}: {
  title: string;
  eyebrow: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-70 overflow-y-auto bg-zinc-950/30 px-4 py-6 backdrop-blur-sm sm:py-8">
      <button type="button" onClick={onClose} className="fixed inset-0 cursor-default" aria-label="Закрыть окно" />
      <section className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/80 blur-3xl" />
        <div className="relative space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
                <ModuleIcon name="receipt" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">{eyebrow}</p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-950">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
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

function IncomingActionCard({
  icon,
  eyebrow,
  title,
  description,
  buttonLabel,
  count,
  onClick,
}: {
  icon: "receipt" | "report";
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
            <ModuleIcon name={icon} className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">{eyebrow}</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-950">{title}</h2>
            <p className="mt-2 text-xs leading-5 text-zinc-500">{description}</p>
          </div>
        </div>
        <button type="button" onClick={onClick} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-red-800 px-5 text-[13px] font-medium tracking-[-0.01em] text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 hover:shadow-red-950/25">
          {buttonLabel}{count === undefined ? "" : ` · ${count}`}
          <ArrowIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}

function IncomingActsTabs({
  activeTab,
  openCount,
  completedCount,
  onChange,
}: {
  activeTab: IncomingActsTab;
  openCount: number;
  completedCount: number;
  onChange: (tab: IncomingActsTab) => void;
}) {
  const tabs: Array<{ key: IncomingActsTab; label: string; count: number }> = [
    { key: "open", label: "В работе", count: openCount },
    { key: "history", label: "История", count: completedCount },
  ];

  return (
    <div className="grid gap-2 rounded-[22px] border border-white/70 bg-white/74 p-2 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:grid-cols-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={[
              "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[13px] font-semibold tracking-[-0.01em] transition",
              isActive
                ? "bg-red-800 text-white shadow-sm shadow-red-950/20"
                : "bg-white/80 text-red-800 ring-1 ring-red-100 hover:bg-red-50",
            ].join(" ")}
          >
            {tab.label}
            <span className={isActive ? "text-red-50/75" : "text-red-800/55"}>
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function InventoryIncomingDialogActions({
  openActs,
  completedActs,
  products,
  responsibleOptions,
  supplierOptions,
  selectedResponsibleId,
  supplierName,
  selectedProducts,
  draftEntries,
  draftTotalCents,
  canManageInventory,
  isCreatePending,
  isCompletePending,
  errorMessage,
  successMessage,
  createFormAction,
  completeFormAction,
  onResponsibleChange,
  onSupplierNameChange,
  onOpenSearch,
  onQuantityChange,
  onPriceChange,
}: {
  openActs: IncomingActSummary[];
  completedActs: IncomingActSummary[];
  products: ProductItem[];
  responsibleOptions: InventoryResponsibleOption[];
  supplierOptions: string[];
  selectedResponsibleId: string;
  supplierName: string;
  selectedProducts: IncomingDraftProduct[];
  draftEntries: Array<{ productId: string; quantity: string; price: string }>;
  draftTotalCents: number;
  canManageInventory: boolean;
  isCreatePending: boolean;
  isCompletePending: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  createFormAction: FormAction;
  completeFormAction: FormAction;
  onResponsibleChange: (value: string) => void;
  onSupplierNameChange: (value: string) => void;
  onOpenSearch: () => void;
  onQuantityChange: (productId: number, value: string) => void;
  onPriceChange: (productId: number, value: string) => void;
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isActsOpen, setIsActsOpen] = useState(false);
  const [activeActsTab, setActiveActsTab] = useState<IncomingActsTab>("open");

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsCreateOpen(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [successMessage]);

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-2">
        <IncomingActionCard icon="receipt" eyebrow="Новый акт" title="Новое поступление" description="Открой форму создания акта и добавь товары в поставку." buttonLabel="Новый акт" onClick={() => setIsCreateOpen(true)} />
        <IncomingActionCard icon="report" eyebrow="Акты" title="Все акты" description="Открытые и закрытые поступления в одном списке." buttonLabel="Все акты" count={openActs.length + completedActs.length} onClick={() => setIsActsOpen(true)} />
      </div>

      {isCreateOpen && typeof document !== "undefined"
        ? createPortal(
            <IncomingDialogShell title="Новое поступление" eyebrow="Новый акт" description="Создай акт, выбери ответственного и добавь товары." onClose={() => setIsCreateOpen(false)}>
              <InventoryIncomingCreateForm
                responsibleOptions={responsibleOptions}
                supplierOptions={supplierOptions}
                selectedResponsibleId={selectedResponsibleId}
                supplierName={supplierName}
                selectedProducts={selectedProducts}
                draftEntries={draftEntries}
                draftTotalCents={draftTotalCents}
                canManageInventory={canManageInventory}
                isCreatePending={isCreatePending}
                errorMessage={errorMessage}
                successMessage={successMessage}
                createFormAction={createFormAction}
                onResponsibleChange={onResponsibleChange}
                onSupplierNameChange={onSupplierNameChange}
                onOpenSearch={onOpenSearch}
                onQuantityChange={onQuantityChange}
                onPriceChange={onPriceChange}
                variant="dialog"
              />
            </IncomingDialogShell>,
            document.body,
          )
        : null}

      {isActsOpen && typeof document !== "undefined"
        ? createPortal(
            <IncomingDialogShell title="Все акты поступления" eyebrow="Акты" description="Открытые и завершённые поступления склада." onClose={() => setIsActsOpen(false)}>
              <div className="space-y-4">
                <IncomingActsTabs
                  activeTab={activeActsTab}
                  openCount={openActs.length}
                  completedCount={completedActs.length}
                  onChange={setActiveActsTab}
                />
                {activeActsTab === "open" ? (
                  <IncomingOpenActsSection
                    acts={openActs}
                    canManageInventory={canManageInventory}
                    isCompletePending={isCompletePending}
                    completeFormAction={completeFormAction}
                    products={products}
                    responsibleOptions={responsibleOptions}
                  />
                ) : (
                  <IncomingCompletedActsSection
                    acts={completedActs}
                    canManageInventory={canManageInventory}
                    isCompletePending={isCompletePending}
                    completeFormAction={completeFormAction}
                    products={products}
                    responsibleOptions={responsibleOptions}
                  />
                )}
              </div>
            </IncomingDialogShell>,
            document.body,
          )
        : null}
    </>
  );
}
