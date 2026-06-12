"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ReportDetail, ReportMetric, ReportRow } from "@/modules/reports/reports.page-model";

function toneClass(tone?: "good" | "warning" | "danger") {
  if (tone === "danger") {
    return "border-red-200 bg-red-50/80 text-red-950";
  }
  if (tone === "warning") {
    return "border-amber-200 bg-amber-50/80 text-amber-950";
  }
  if (tone === "good") {
    return "border-emerald-100 bg-emerald-50/70 text-emerald-950";
  }
  return "border-red-950/10 bg-white/82 text-zinc-950";
}

function MetricTile({ label, value, hint, tone }: ReportMetric) {
  return (
    <article className={`rounded-[18px] border p-4 shadow-sm shadow-red-950/5 ${toneClass(tone)}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">{label}</p>
      <p className="mt-2 text-xl font-semibold leading-none">{value}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-600">{hint}</p>
    </article>
  );
}

function ReportRowLine({ row }: { row: ReportRow }) {
  return (
    <div className="grid gap-2 border-t border-red-950/10 py-3 first:border-t-0 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-zinc-950">{row.label}</p>
        <p className="mt-0.5 text-xs leading-5 text-zinc-500">{row.hint}</p>
      </div>
      <p className={`text-sm font-semibold ${row.tone === "danger" ? "text-red-800" : row.tone === "warning" ? "text-amber-700" : "text-zinc-950"}`}>
        {row.value}
      </p>
    </div>
  );
}

function ReportDialog({ report, onClose }: { report: ReportDetail; onClose: () => void }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  function handleClose() {
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-red-950/35 p-3 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Закрыть отчет" onClick={handleClose} />
      <section className="relative flex h-[calc(100dvh-24px)] w-[calc(100vw-24px)] max-w-[1560px] flex-col overflow-hidden rounded-[28px] border border-red-950/10 bg-[linear-gradient(180deg,#fff,rgba(255,248,248,0.98))] shadow-[0_30px_90px_rgba(69,10,10,0.32)] sm:h-[calc(100dvh-40px)] sm:w-[calc(100vw-40px)]">
        <div className="shrink-0 border-b border-red-950/10 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="foodlike-kicker">{report.shortTitle}</p>
            <h2 className="mt-1 text-2xl font-semibold text-zinc-950">{report.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">{report.description}</p>
          </div>
          <button type="button" onClick={handleClose} className="inline-flex h-10 items-center rounded-full border border-red-100 bg-white/85 px-4 text-sm font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
            Закрыть
          </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-5 sm:p-6">
          <div className="mx-auto max-w-[1360px]">
          <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
            <article className="rounded-[22px] border border-red-950/10 bg-white/78 p-4 shadow-sm shadow-red-950/5">
              <p className="foodlike-kicker">Главный результат</p>
              <p className="mt-2 text-3xl font-semibold leading-none text-zinc-950">{report.result}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{report.resultHint}</p>
              <div className="mt-4 rounded-[18px] border border-red-100 bg-red-50/50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Формула</p>
                <p className="mt-2 text-sm leading-6 text-zinc-800">{report.formula}</p>
              </div>
            </article>

            <div className="grid gap-3 sm:grid-cols-2">
              {report.metrics.map((metric) => (
                <MetricTile key={`${report.id}-${metric.label}`} {...metric} />
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <article className="rounded-[22px] border border-red-950/10 bg-white/78 p-4 shadow-sm shadow-red-950/5">
              <p className="foodlike-kicker">Детализация</p>
              <div className="mt-3">
                {report.rows.length ? report.rows.map((row) => <ReportRowLine key={`${report.id}-row-${row.label}`} row={row} />) : (
                  <p className="foodlike-empty px-4 py-4">Данных за период пока нет.</p>
                )}
              </div>
            </article>

            <article className="rounded-[22px] border border-red-950/10 bg-white/78 p-4 shadow-sm shadow-red-950/5">
              <p className="foodlike-kicker">Зоны внимания</p>
              <div className="mt-3">
                {report.risks.length ? report.risks.map((row) => <ReportRowLine key={`${report.id}-risk-${row.label}`} row={row} />) : (
                  <p className="foodlike-empty px-4 py-4">Критичных зон по текущим данным нет.</p>
                )}
              </div>
            </article>
          </div>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}

export function ReportsDialogGrid({ reports }: { reports: ReportDetail[] }) {
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const activeReport = reports.find((report) => report.id === activeReportId) ?? null;

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {reports.map((report) => (
          <button
            key={report.id}
            type="button"
            onClick={() => setActiveReportId(report.id)}
            className="foodlike-card group p-4 text-left transition hover:-translate-y-1 hover:border-red-200 hover:shadow-[0_18px_38px_rgba(127,29,29,0.14)]"
          >
            <p className="foodlike-kicker">{report.shortTitle}</p>
            <h3 className="mt-2 text-base font-semibold text-zinc-950">{report.title}</h3>
            <p className="mt-2 min-h-16 text-xs leading-5 text-zinc-500">{report.description}</p>
            <div className="mt-4 flex items-end justify-between gap-3 border-t border-red-950/10 pt-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Итог</p>
                <p className="mt-1 text-lg font-semibold text-zinc-950">{report.result}</p>
              </div>
              <span className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/85 px-3 text-xs font-semibold text-red-800 transition group-hover:border-red-800 group-hover:bg-red-800 group-hover:text-white">
                Открыть
              </span>
            </div>
          </button>
        ))}
      </div>
      {activeReport ? <ReportDialog report={activeReport} onClose={() => setActiveReportId(null)} /> : null}
    </>
  );
}
