"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ModuleIcon, type ModuleIconName } from "@/components/ui/module-icon";

type DashboardModuleCard = {
  href: string;
  label: string;
  description: string;
  value: string | number;
  icon: ModuleIconName;
};

function chunkCards(cards: DashboardModuleCard[], size: number) {
  const chunks: DashboardModuleCard[][] = [];

  for (let index = 0; index < cards.length; index += size) {
    chunks.push(cards.slice(index, index + size));
  }

  return chunks;
}

function ModuleLink({
  href,
  label,
  description,
  icon,
  index,
}: DashboardModuleCard & {
  index: number;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[18px] border border-red-950/10 bg-white/74 p-3.5 shadow-sm shadow-red-950/5 transition hover:-translate-y-1 hover:border-red-200 hover:bg-white"
      style={{ transitionDelay: `${index * 55}ms` }}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-50 text-red-800 transition group-hover:bg-red-800 group-hover:text-white">
          <ModuleIcon name={icon} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-950">{label}</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-red-50">
        <div
          className="h-full rounded-full bg-red-800/80 transition-all duration-700"
          style={{ width: `${34 + ((index * 13) % 58)}%` }}
        />
      </div>
    </Link>
  );
}

export function ModuleCarousel({ cards }: { cards: DashboardModuleCard[] }) {
  const pages = useMemo(() => chunkCards(cards, 4), [cards]);
  const [activePage, setActivePage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (pages.length <= 1 || isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActivePage((current) => (current + 1) % pages.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [isPaused, pages.length]);

  const currentCards = pages[activePage] ?? [];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="relative overflow-hidden">
        <div
          key={activePage}
          className="grid animate-[module-slide-in_560ms_cubic-bezier(0.22,1,0.36,1)] gap-3 md:grid-cols-2"
        >
          {currentCards.map((card, index) => (
            <ModuleLink key={card.href} {...card} index={index + activePage} />
          ))}
        </div>
      </div>

      {pages.length > 1 ? (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {pages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActivePage(index)}
                aria-label={`Показать набор модулей ${index + 1}`}
                className={[
                  "h-1.5 rounded-full transition-all",
                  index === activePage
                    ? "w-8 bg-red-800"
                    : "w-3 bg-red-200 hover:bg-red-300",
                ].join(" ")}
              />
            ))}
          </div>
          <p className="text-xs font-medium text-zinc-500">
            {activePage + 1}/{pages.length}
          </p>
        </div>
      ) : null}
    </div>
  );
}
