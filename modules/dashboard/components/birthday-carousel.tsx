"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDaysUntilBirthday } from "@/modules/clients/clients.page-model";

type BirthdayClient = {
  id: number;
  name: string;
  phone: string;
  daysUntilBirthday: number;
  formattedDate: string;
  totalSpentCents: number;
  ordersCount: number;
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function getAverageCheckCents(totalSpentCents: number, ordersCount: number) {
  return ordersCount > 0 ? Math.round(totalSpentCents / ordersCount) : 0;
}

export function BirthdayCarousel({ clients }: { clients: BirthdayClient[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (clients.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % clients.length);
    }, 4800);

    return () => window.clearInterval(timer);
  }, [clients.length]);

  const activeClient = clients[activeIndex];

  return (
    <section className="rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
            Клиенты
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-950">
            Скоро день рождения
          </h2>
        </div>
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-800">
          {clients.length ? `${clients.length} в ближайшие 7 дней` : "нет событий"}
        </span>
      </div>

      {activeClient ? (
        <>
          <Link
            key={activeClient.id}
            href={`/dashboard/clients/${activeClient.id}`}
            className="mt-3 block animate-[module-slide-in_560ms_cubic-bezier(0.22,1,0.36,1)] rounded-[18px] border border-red-950/10 bg-white/78 p-4 shadow-sm shadow-red-950/5 transition hover:-translate-y-1 hover:border-red-200 hover:bg-white"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-zinc-950">
                  {activeClient.name}
                </p>
                <p className="mt-1 text-sm text-zinc-500">{activeClient.phone}</p>
              </div>
              <span className="rounded-[14px] bg-red-800 px-3 py-2 text-xs font-semibold text-white">
                {formatDaysUntilBirthday(activeClient.daysUntilBirthday)}
              </span>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-[14px] bg-red-50/70 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-red-800/70">
                  Дата
                </p>
                <p className="mt-1 text-sm font-semibold text-zinc-950">
                  {activeClient.formattedDate}
                </p>
              </div>
              <div className="rounded-[14px] bg-red-50/70 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-red-800/70">
                  Заказы
                </p>
                <p className="mt-1 text-sm font-semibold text-zinc-950">
                  {activeClient.ordersCount}
                </p>
              </div>
              <div className="rounded-[14px] bg-red-50/70 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-red-800/70">
                  Средний чек
                </p>
                <p className="mt-1 text-sm font-semibold text-zinc-950">
                  {formatMoney(getAverageCheckCents(activeClient.totalSpentCents, activeClient.ordersCount))}
                </p>
              </div>
            </div>
          </Link>

          {clients.length > 1 ? (
            <div className="mt-3 flex gap-1.5">
              {clients.map((client, index) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Показать клиента ${client.name}`}
                  className={[
                    "h-1.5 rounded-full transition-all",
                    index === activeIndex
                      ? "w-8 bg-red-800"
                      : "w-3 bg-red-200 hover:bg-red-300",
                  ].join(" ")}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <div className="mt-3 rounded-[18px] border border-dashed border-red-200 bg-white/70 p-4 text-sm leading-6 text-zinc-500">
          В ближайшие 7 дней дней рождения у клиентов нет. Когда дата появится
          в карточке клиента, она попадет сюда автоматически.
        </div>
      )}
    </section>
  );
}
