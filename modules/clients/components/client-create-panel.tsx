"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ClientForm } from "@/modules/clients/components/client-form";
import type { ClientType } from "@/modules/clients/clients.types";

const CREATE_VARIANTS: Array<{
  type: ClientType;
  label: string;
}> = [
  { type: "CLIENT", label: "Клиент" },
  { type: "ORGANIZATION", label: "Организация" },
];

export function ClientCreatePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeType, setActiveType] = useState<ClientType>("CLIENT");

  const dialog = (
    <div className="fixed inset-0 z-70 overflow-y-auto bg-zinc-950/30 px-4 py-6 backdrop-blur-sm sm:py-8">
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 cursor-default"
        aria-label="Закрыть добавление клиента"
      />

      <section className="relative mx-auto max-w-2xl overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/80 blur-3xl" />

        <div className="relative space-y-3 rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
                Добавление
              </p>
              <h2 className="mt-1 text-base font-semibold text-zinc-950">
                Новая запись клиента
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-8 items-center rounded-full border border-red-100 bg-white/90 px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
            >
              Закрыть
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 rounded-full border border-white/70 bg-white/55 p-1 shadow-sm shadow-red-950/5">
            {CREATE_VARIANTS.map((variant) => {
              const isActive = activeType === variant.type;

              return (
                <button
                  key={variant.type}
                  type="button"
                  onClick={() => setActiveType(variant.type)}
                  className={`h-8 rounded-full border px-3 text-[11px] font-semibold transition ${
                    isActive
                      ? "border-red-800 bg-red-800 text-white shadow-sm shadow-red-950/20"
                      : "border-transparent bg-transparent text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"
                  }`}
                >
                  <span className="whitespace-nowrap">{variant.label}</span>
                </button>
              );
            })}
          </div>

          <ClientForm type={activeType} />
        </div>
      </section>
    </div>
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-9 w-full items-center justify-center rounded-full border border-red-100 bg-white/85 px-4 text-center text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white hover:shadow-red-950/20 lg:w-44"
      >
        <span className="whitespace-nowrap">Добавить клиента</span>
      </button>

      {isOpen && typeof document !== "undefined" ? createPortal(dialog, document.body) : null}
    </div>
  );
}
