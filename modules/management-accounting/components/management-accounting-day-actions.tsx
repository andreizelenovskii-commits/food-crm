"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  closeManagementAccountingDay,
  reopenManagementAccountingDay,
  startManagementAccountingDay,
} from "@/modules/management-accounting/management-accounting.actions";
import type { ManagementAccountingDay } from "@/modules/management-accounting/management-accounting.types";

type DayAction = {
  id: "start" | "close" | "reopen";
  label: string;
  title: string;
  description: string;
  submitLabel: string;
  tone: "primary" | "dark" | "warning";
  action: (formData: FormData) => Promise<void>;
};

const ACTIONS: Record<DayAction["id"], DayAction> = {
  start: {
    id: "start",
    label: "Начать управленческий учет за смену",
    title: "Начать учет за день?",
    description: "После начала можно добавить ручные расходы и доходы за выбранную дату.",
    submitLabel: "Начать учет",
    tone: "primary",
    action: startManagementAccountingDay,
  },
  close: {
    id: "close",
    label: "Закрыть управленческий учет за смену",
    title: "Закрыть учет и зафиксировать статистику?",
    description: "Система сохранит снимок маржи, фудкоста, себестоимости, прибыли и позиций. После закрытия ручные правки будут заблокированы.",
    submitLabel: "Закрыть и сохранить",
    tone: "dark",
    action: closeManagementAccountingDay,
  },
  reopen: {
    id: "reopen",
    label: "Открыть для корректировки",
    title: "Открыть закрытый учет для корректировки?",
    description: "Старый снимок закрытия будет снят. Внесите правки и закройте день повторно, чтобы сохранить новую сводку.",
    submitLabel: "Открыть для правок",
    tone: "warning",
    action: reopenManagementAccountingDay,
  },
};

function getButtonClassName(tone: DayAction["tone"]) {
  if (tone === "dark") {
    return "inline-flex min-h-10 items-center justify-center rounded-full border border-zinc-900 bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm shadow-zinc-950/15 transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60";
  }

  if (tone === "warning") {
    return "inline-flex min-h-10 items-center justify-center rounded-full border border-amber-300 bg-amber-50 px-4 text-sm font-semibold text-amber-900 shadow-sm shadow-amber-950/10 transition hover:border-amber-500 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60";
  }

  return "inline-flex min-h-10 items-center justify-center rounded-full border border-red-800 bg-red-800 px-4 text-sm font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-60";
}

export function ManagementAccountingDayActions({
  day,
  date,
}: {
  day: ManagementAccountingDay;
  date: string;
}) {
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<DayAction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const actions = [
    day.canStart ? ACTIONS.start : null,
    day.canClose ? ACTIONS.close : null,
    day.canReopen ? ACTIONS.reopen : null,
  ].filter((action): action is DayAction => Boolean(action));

  if (!actions.length) {
    return null;
  }

  const submitAction = () => {
    if (!activeAction) {
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("date", date);
        await activeAction.action(formData);
        setActiveAction(null);
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error && error.message ? error.message : "Не удалось выполнить действие.");
      }
    });
  };

  return (
    <>
      <div className="flex w-full flex-wrap justify-start gap-2 sm:w-auto sm:justify-end">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className={getButtonClassName(action.tone)}
            onClick={() => {
              setErrorMessage(null);
              setActiveAction(action);
            }}
          >
            {action.label}
          </button>
        ))}
      </div>

      {activeAction ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4 py-5 backdrop-blur-sm"
          onClick={() => {
            if (!isPending) {
              setActiveAction(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={activeAction.title}
            className="w-full max-w-lg rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="foodlike-kicker">Подтверждение</p>
            <h2 className="mt-1 text-xl font-semibold leading-tight text-zinc-950">{activeAction.title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">{activeAction.description}</p>
            {errorMessage ? (
              <p className="mt-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                {errorMessage}
              </p>
            ) : null}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-red-100 bg-white/90 px-4 text-sm font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending}
                onClick={() => setActiveAction(null)}
              >
                Отмена
              </button>
              <button
                type="button"
                className={getButtonClassName(activeAction.tone)}
                disabled={isPending}
                onClick={submitAction}
              >
                {isPending ? "Сохраняем..." : activeAction.submitLabel}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
