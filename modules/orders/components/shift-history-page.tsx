"use client";

import { useState } from "react";
import type { DispatcherShiftDto } from "@/modules/orders/orders.types";
import { formatOrderMoney } from "@/modules/orders/components/order-display";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatTime(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "—";
}

function getDuration(start: string, end: string | null) {
  if (!end) {
    return "Ещё открыта";
  }

  const minutes = Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return `${hours} ч ${rest} мин`;
}

export function ShiftHistoryPage({ shifts }: { shifts: DispatcherShiftDto[] }) {
  const [selectedShift, setSelectedShift] = useState<DispatcherShiftDto | null>(null);

  return (
    <section className="foodlike-frame space-y-4 p-4 sm:p-5">
      {shifts.length ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {shifts.map((shift) => (
            <button
              key={shift.id}
              type="button"
              onClick={() => setSelectedShift(shift)}
              className="rounded-[22px] border border-red-950/10 bg-white/86 p-4 text-left shadow-sm shadow-red-950/5 transition hover:border-red-200 hover:shadow-red-950/12"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800/70">
                    Смена {shift.displayNumber}
                  </p>
                  <h2 className="mt-1 text-xl font-black text-zinc-950">{formatDate(shift.businessDate)}</h2>
                  <p className="mt-2 text-sm font-semibold text-zinc-500">
                    Открыта: {formatTime(shift.openedAt)} · {shift.closedAt ? `Закрыта: ${formatTime(shift.closedAt)}` : "Ещё не закрыта"}
                  </p>
                </div>
                <span className={[
                  "rounded-full px-3 py-1 text-xs font-black",
                  shift.status === "OPEN" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800",
                ].join(" ")}>
                  {shift.status === "OPEN" ? "Открыта" : "Закрыта"}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Metric label="Чеков" value={shift.checksCount} />
                <Metric label="Выручка" value={formatOrderMoney(shift.revenueCents)} />
                <Metric label="Отменено" value={shift.cancelledOrdersCount} />
              </div>
              <p className="mt-3 text-sm font-semibold text-zinc-600">Ответственный: {shift.responsibleName}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-red-200 bg-white/70 px-4 py-14 text-center">
          <p className="text-lg font-semibold text-zinc-950">Смен пока нет</p>
        </div>
      )}
      {selectedShift ? (
        <ShiftDetailsDialog shift={selectedShift} onClose={() => setSelectedShift(null)} />
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[16px] border border-red-100 bg-red-50/50 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-800/70">{label}</p>
      <p className="mt-1 text-lg font-black text-zinc-950">{value}</p>
    </div>
  );
}

function ShiftDetailsDialog({
  shift,
  onClose,
}: {
  shift: DispatcherShiftDto;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-zinc-950/40 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[26px] border border-red-100 bg-white p-5 shadow-2xl shadow-red-950/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800/70">
              Смена {shift.displayNumber}
            </p>
            <h2 className="mt-1 text-2xl font-black text-zinc-950">{formatDate(shift.businessDate)}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-red-100 px-3 py-1 text-sm font-black text-red-800">
            Закрыть
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Metric label="Открыта" value={`${formatTime(shift.openedAt)} · ${shift.responsibleName}`} />
          <Metric label="Закрыта" value={shift.closedAt ? `${formatTime(shift.closedAt)} · ${shift.closedByName ?? "—"}` : "Ещё открыта"} />
          <Metric label="Длительность" value={getDuration(shift.openedAt, shift.closedAt)} />
          <Metric label="Всего заказов" value={shift.totalOrdersCount} />
          <Metric label="Чеков" value={shift.checksCount} />
          <Metric label="Отменено" value={shift.cancelledOrdersCount} />
          <Metric label="Выручка" value={formatOrderMoney(shift.revenueCents)} />
          <Metric label="Активных" value={shift.activeOrdersCount} />
        </div>
      </div>
    </div>
  );
}
