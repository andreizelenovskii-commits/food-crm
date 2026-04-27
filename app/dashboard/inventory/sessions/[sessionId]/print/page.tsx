import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePermission } from "@/modules/auth/auth.session";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import { InventorySessionPrintButton } from "@/modules/inventory/components/inventory-session-print-button";
import { fetchInventorySessionById } from "@/modules/inventory/inventory.api";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function InventorySessionPrintPage(props: {
  params: Promise<{ sessionId: string }>;
}) {
  await requirePermission("view_inventory");

  const { sessionId } = await props.params;
  const numericSessionId = Number(sessionId);
  const session = await fetchInventorySessionById(numericSessionId);

  if (!session) {
    redirect("/dashboard/inventory?tab=audit");
  }

  const countedItems = session.items.filter((item) => item.actualQuantity !== null).length;
  const totalVarianceValueCents = session.items.reduce((sum, item) => {
    return sum + (item.varianceValueCents ?? 0);
  }, 0);

  return (
    <main className="min-h-screen bg-[#f6f3ec] px-4 py-6 text-zinc-950 print:bg-white print:px-0 print:py-0">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 12mm;
        }

        @media print {
          html,
          body {
            height: auto;
            background: white;
            margin: 0;
            padding: 0;
          }

          body * {
            visibility: hidden;
          }

          .print-root,
          .print-root * {
            visibility: visible;
          }

          .print-root {
            display: block !important;
            position: static;
            inset: auto;
            width: 100%;
            min-height: auto;
            padding: 0;
            margin: 0;
            background: white !important;
          }

          .print-sheet {
            display: block !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            max-width: none !important;
            width: 100% !important;
            min-height: auto !important;
            overflow: visible !important;
            background: white !important;
          }

          .print-break-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          table {
            width: 100%;
          }

          thead {
            display: table-header-group;
          }

          tr,
          td,
          th {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="print-root">
        <div className="print-sheet mx-auto max-w-6xl rounded-[32px] border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-950/10 print:rounded-none print:p-0">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3 print:hidden">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/inventory?tab=audit"
              className="inline-flex items-center rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
            >
              Назад к инвентаризациям
            </Link>
            <InventorySessionPrintButton />
          </div>
          <p className="max-w-md text-sm leading-6 text-zinc-500">
            Этот лист можно сразу распечатать или сохранить как PDF через системное окно печати.
          </p>
        </div>

        <section className="print-break-avoid rounded-[28px] border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#f5f1e7_100%)] p-6 print:border-zinc-300">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Инвентаризационный лист
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-zinc-950">
                Инвентаризация #{session.id}
              </h1>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Ответственный: <span className="font-semibold text-zinc-950">{session.responsibleEmployeeName}</span>
                {" · "}
                {session.responsibleEmployeeRole}
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                Создана: {formatDateTime(session.createdAt)}
                {session.closedAt ? ` · Закрыта: ${formatDateTime(session.closedAt)}` : " · Статус: открыта"}
              </p>
              {session.notes ? (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
                  Комментарий: {session.notes}
                </p>
              ) : null}
            </div>

            <div className="grid min-w-[280px] gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Позиций</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-zinc-950">{session.itemsCount}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Категорий</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-zinc-950">{session.categories.length}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">С фактом</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-zinc-950">{countedItems}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Отклонение</p>
                <p className={`mt-2 text-xl font-semibold ${totalVarianceValueCents < 0 ? "text-red-600" : totalVarianceValueCents > 0 ? "text-emerald-700" : "text-zinc-950"}`}>
                  {totalVarianceValueCents > 0 ? "+" : ""}
                  {formatMoney(totalVarianceValueCents)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-zinc-200 bg-white print:border-zinc-300">
          <div className="border-b border-zinc-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-zinc-950">Лист пересчёта для печати</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              В столбце “Факт” можно вручную заполнять значения на бумаге, а затем переносить их в CRM.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 text-left text-zinc-500">
                  <th className="border-b border-zinc-200 px-3 py-3 font-medium">#</th>
                  <th className="border-b border-zinc-200 px-3 py-3 font-medium">Товар</th>
                  <th className="border-b border-zinc-200 px-3 py-3 font-medium">Категория</th>
                  <th className="border-b border-zinc-200 px-3 py-3 font-medium">Ед.</th>
                  <th className="border-b border-zinc-200 px-3 py-3 font-medium">Остаток в системе</th>
                  <th className="border-b border-zinc-200 px-3 py-3 font-medium">Факт</th>
                  <th className="border-b border-zinc-200 px-3 py-3 font-medium">Разница</th>
                  <th className="border-b border-zinc-200 px-3 py-3 font-medium">Сумма откл.</th>
                </tr>
              </thead>
              <tbody>
                {session.items.map((item, index) => {
                  const factCell =
                    item.actualQuantity === null
                      ? "________________"
                      : formatInventoryQuantity(item.actualQuantity);
                  const varianceText =
                    item.varianceQuantity === null
                      ? "____________"
                      : `${item.varianceQuantity > 0 ? "+" : ""}${formatInventoryQuantity(item.varianceQuantity)} ${item.productUnit}`;
                  const varianceValueText =
                    item.varianceValueCents === null
                      ? "____________"
                      : `${item.varianceValueCents > 0 ? "+" : ""}${formatMoney(item.varianceValueCents)}`;

                  return (
                    <tr key={item.id} className="align-top">
                      <td className="border-b border-zinc-200 px-3 py-3 font-medium text-zinc-500">
                        {index + 1}
                      </td>
                      <td className="border-b border-zinc-200 px-3 py-3">
                        <p className="font-semibold text-zinc-950">{item.productName}</p>
                      </td>
                      <td className="border-b border-zinc-200 px-3 py-3 text-zinc-600">
                        {item.productCategory ?? "Без категории"}
                      </td>
                      <td className="border-b border-zinc-200 px-3 py-3 font-medium text-zinc-600">
                        {item.productUnit}
                      </td>
                      <td className="border-b border-zinc-200 px-3 py-3 font-medium text-zinc-950">
                        {formatInventoryQuantity(item.currentStockQuantity)}
                      </td>
                      <td className="border-b border-zinc-200 px-3 py-3 font-medium text-zinc-950">
                        {factCell}
                      </td>
                      <td className="border-b border-zinc-200 px-3 py-3 font-medium text-zinc-700">
                        {varianceText}
                      </td>
                      <td className="border-b border-zinc-200 px-3 py-3 font-medium text-zinc-700">
                        {varianceValueText}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="print-break-avoid rounded-[24px] border border-zinc-200 bg-zinc-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Примечания</p>
            <div className="mt-4 min-h-32 rounded-2xl border border-dashed border-zinc-300 bg-white" />
          </div>
          <div className="print-break-avoid rounded-[24px] border border-zinc-200 bg-zinc-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Подпись ответственного</p>
            <div className="mt-10 border-b border-zinc-400" />
            <p className="mt-3 text-sm text-zinc-500">
              {session.responsibleEmployeeName}
            </p>
          </div>
        </section>
        </div>
      </div>
    </main>
  );
}
