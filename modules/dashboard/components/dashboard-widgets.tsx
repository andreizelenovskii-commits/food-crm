import Link from "next/link";

const MONEY_FORMATTER = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

export function formatDashboardMoney(cents: number) {
  return MONEY_FORMATTER.format(cents / 100);
}

export function GlassPanel({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`rounded-[22px] border border-white/70 bg-white/72 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl ${className}`.trim()}
    >
      {children}
    </section>
  );
}

export function KpiTile({
  href,
  label,
  value,
  hint,
}: {
  href?: string;
  label: string;
  value: string | number;
  hint: string;
}) {
  const className = [
    "group block rounded-[18px] border border-red-950/10 bg-white/78 p-4 text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition",
    href
      ? "hover:-translate-y-1 hover:border-red-900/10 hover:bg-red-800 hover:text-white hover:shadow-red-950/15 focus-visible:bg-red-800 focus-visible:text-white focus-visible:ring-2 focus-visible:ring-red-800/20"
      : "",
  ].join(" ");
  const content = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70 transition group-hover:text-red-50/80 group-focus-visible:text-red-50/80">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold leading-none">{value}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-500 transition group-hover:text-red-50/78 group-focus-visible:text-red-50/78">
        {hint}
      </p>
    </>
  );

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <article className={className}>{content}</article>
  );
}

export function InsightRows({
  title,
  eyebrow,
  items,
  action,
}: {
  title: string;
  eyebrow: string;
  items: Array<{ label: string; value: string; hint: string }>;
  action?: React.ReactNode;
}) {
  return (
    <GlassPanel className="p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="self-start">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">{eyebrow}</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-950">{title}</h2>
        </div>
        {action}
      </div>
      <div className="mt-3 divide-y divide-red-950/10">
        {items.map((item) => (
          <div key={item.label} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-sm font-medium text-zinc-900">{item.label}</p>
              <p className="mt-0.5 text-xs leading-5 text-zinc-500">{item.hint}</p>
            </div>
            <p className="text-sm font-semibold text-zinc-950">{item.value}</p>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
