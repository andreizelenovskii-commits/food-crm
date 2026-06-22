import type { ReactNode } from "react";
import Link from "next/link";

type PageShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  backHref?: string;
  compact?: boolean;
};

export function PageShell({
  title,
  description,
  children,
  action,
  backHref,
  compact = false,
}: PageShellProps) {
  return (
    <>
      <div className={`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between ${compact ? "mb-4 shrink-0" : "mb-5"}`}>
        <div className="min-w-0">
          {backHref ? (
            <Link
              href={backHref}
              prefetch={false}
              className="mb-2 inline-flex h-8 items-center rounded-full border border-red-100 bg-white/70 px-3 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
            >
              Назад
            </Link>
          ) : null}
          <h1 className="text-[24px] font-semibold leading-tight text-zinc-950 sm:text-[28px]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {compact ? (
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      ) : (
        children
      )}
    </>
  );
}
