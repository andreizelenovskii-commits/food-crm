"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PaginatedList } from "@/components/ui/paginated-list";
import { ModuleIcon } from "@/components/ui/module-icon";
import { InventoryWriteoffActCard } from "@/modules/inventory/components/inventory-writeoff-act-card";
import { InventoryWriteoffCreateForm } from "@/modules/inventory/components/inventory-writeoff-create-form";
import { WriteoffOpenActsSection } from "@/modules/inventory/components/inventory-writeoff-sections";
import type { WriteoffDraftProduct } from "@/modules/inventory/components/inventory-writeoff-create-form-parts";
import type {
  InventoryResponsibleOption,
  WriteoffActSummary,
  WriteoffReason,
} from "@/modules/inventory/inventory.types";

type FormAction = (formData: FormData) => void;
type WriteoffActsTab = "open" | "history";

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function WriteoffDialogShell({
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

function WriteoffActionCard({
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
        <button type="button" onClick={onClick} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-red-800 px-5 text-[13px] font-medium tracking-[-0.01em] text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900">
          {buttonLabel}{count === undefined ? "" : ` · ${count}`}
          <ArrowIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}

function WriteoffActsTabs({
  activeTab,
  openCount,
  completedCount,
  onChange,
}: {
  activeTab: WriteoffActsTab;
  openCount: number;
  completedCount: number;
  onChange: (tab: WriteoffActsTab) => void;
}) {
  const tabs: Array<{ key: WriteoffActsTab; label: string; count: number }> = [
    { key: "open", label: "В работе", count: openCount },
    { key: "history", label: "История", count: completedCount },
  ];

  return (
    <div className="grid gap-2 rounded-[22px] border border-white/70 bg-white/74 p-2 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:grid-cols-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button key={tab.key} type="button" onClick={() => onChange(tab.key)} className={["inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[13px] font-semibold tracking-[-0.01em] transition", isActive ? "bg-red-800 text-white shadow-sm shadow-red-950/20" : "bg-white/80 text-red-800 ring-1 ring-red-100 hover:bg-red-50"].join(" ")}>
            {tab.label}
            <span className={isActive ? "text-red-50/75" : "text-red-800/55"}>{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}

export function InventoryWriteoffDialogActions({
  openActs,
  completedActs,
  responsibleOptions,
  selectedResponsibleId,
  reason,
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
  onReasonChange,
  onOpenSearch,
  onQuantityChange,
  onRemoveProduct,
  onClearDraft,
  onDelete,
}: {
  openActs: WriteoffActSummary[];
  completedActs: WriteoffActSummary[];
  responsibleOptions: InventoryResponsibleOption[];
  selectedResponsibleId: string;
  reason: WriteoffReason;
  selectedProducts: WriteoffDraftProduct[];
  draftEntries: Array<{ productId: string; quantity: string }>;
  draftTotalCents: number;
  canManageInventory: boolean;
  isCreatePending: boolean;
  isCompletePending: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  createFormAction: FormAction;
  completeFormAction: FormAction;
  onResponsibleChange: (value: string) => void;
  onReasonChange: (value: WriteoffReason) => void;
  onOpenSearch: () => void;
  onQuantityChange: (productId: number, value: string) => void;
  onRemoveProduct: (productId: number) => void;
  onClearDraft: () => void;
  onDelete: (act: WriteoffActSummary) => void;
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isActsOpen, setIsActsOpen] = useState(false);
  const [activeActsTab, setActiveActsTab] = useState<WriteoffActsTab>("open");

  useEffect(() => {
    if (!successMessage) return;
    const frameId = window.requestAnimationFrame(() => setIsCreateOpen(false));
    return () => window.cancelAnimationFrame(frameId);
  }, [successMessage]);

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-2">
        <WriteoffActionCard icon="receipt" eyebrow="Новый акт" title="Новое списание" description="Открой форму, выбери причину и добавь товары к списанию." buttonLabel="Новый акт" onClick={() => setIsCreateOpen(true)} />
        <WriteoffActionCard icon="report" eyebrow="Акты" title="Все акты" description="Открытые и завершённые списания в одном окне." buttonLabel="Все акты" count={openActs.length + completedActs.length} onClick={() => setIsActsOpen(true)} />
      </div>

      {isCreateOpen && typeof document !== "undefined"
        ? createPortal(
            <WriteoffDialogShell title="Новое списание" eyebrow="Новый акт" description="Создай акт, выбери ответственного, причину и товары." onClose={() => setIsCreateOpen(false)}>
              <InventoryWriteoffCreateForm responsibleOptions={responsibleOptions} selectedResponsibleId={selectedResponsibleId} reason={reason} selectedProducts={selectedProducts} draftEntries={draftEntries} draftTotalCents={draftTotalCents} canManageInventory={canManageInventory} isCreatePending={isCreatePending} errorMessage={errorMessage} successMessage={successMessage} createFormAction={createFormAction} onResponsibleChange={onResponsibleChange} onReasonChange={onReasonChange} onOpenSearch={onOpenSearch} onQuantityChange={onQuantityChange} onRemoveProduct={onRemoveProduct} onClearDraft={onClearDraft} variant="dialog" />
            </WriteoffDialogShell>,
            document.body,
          )
        : null}

      {isActsOpen && typeof document !== "undefined"
        ? createPortal(
            <WriteoffDialogShell title="Все акты списания" eyebrow="Акты" description="Открытые и завершённые списания склада." onClose={() => setIsActsOpen(false)}>
              <div className="space-y-4">
                <WriteoffActsTabs activeTab={activeActsTab} openCount={openActs.length} completedCount={completedActs.length} onChange={setActiveActsTab} />
                {activeActsTab === "open" ? (
                  <WriteoffOpenActsSection acts={openActs} canManageInventory={canManageInventory} isCompletePending={isCompletePending} completeFormAction={completeFormAction} onDelete={onDelete} />
                ) : (
                  <PaginatedList itemLabel="актов" pageSize={10} className="space-y-2">
                    {completedActs.map((act) => (
                      <InventoryWriteoffActCard key={act.id} act={act} canComplete={false} canManageInventory={canManageInventory} isCompletePending={isCompletePending} completeFormAction={completeFormAction} onDelete={onDelete} />
                    ))}
                  </PaginatedList>
                )}
              </div>
            </WriteoffDialogShell>,
            document.body,
          )
        : null}
    </>
  );
}
