"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { EmployeeForm } from "@/modules/employees/components/employee-form";

export function EmployeeCreateDialogButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 items-center rounded-full bg-red-800 px-5 text-sm font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900"
      >
        Добавить сотрудника
      </button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-90 overflow-y-auto bg-zinc-950/35 px-4 py-6 backdrop-blur-sm sm:py-8">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 cursor-default"
                aria-label="Закрыть добавление сотрудника"
              />
              <section className="relative mx-auto max-w-2xl rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
                <div className="mb-3 flex items-start justify-between gap-3 rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
                      Новый сотрудник
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-zinc-950">
                      Добавление сотрудника
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
                  >
                    Закрыть
                  </button>
                </div>
                <EmployeeForm />
              </section>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
