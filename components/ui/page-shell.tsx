import Link from "next/link";
import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  align?: "center" | "top";
  action?: ReactNode;
  backHref?: string;
};

export function PageShell({
  title,
  description,
  children,
  align = "top",
  action,
  backHref,
}: PageShellProps) {
  const layoutClassName =
    align === "center"
      ? "flex min-h-screen items-center justify-center px-6 py-12"
      : "min-h-screen px-6 py-10";

  return (
    <main className={layoutClassName}>
      <div className="mx-auto w-full max-w-6xl">
        <div className="sticky top-4 z-20 mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {backHref ? (
              <Link
                href={backHref}
                aria-label="Вернуться на предыдущую страницу"
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white/90 text-zinc-700 shadow-lg shadow-zinc-950/8 backdrop-blur-sm transition hover:-translate-x-0.5 hover:border-zinc-300 hover:text-zinc-950"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M15 18l-6-6 6-6" />
                  <path d="M9 12h10" />
                </svg>
              </Link>
            ) : null}

            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-full border border-emerald-200 bg-[linear-gradient(180deg,#f6fff7_0%,#eaf7ec_100%)] px-5 py-2.5 text-base font-semibold uppercase tracking-[0.28em] text-emerald-800 shadow-lg shadow-emerald-950/8 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-950 hover:shadow-xl hover:shadow-emerald-950/10 sm:px-6 sm:py-3"
            >
              Food CRM
            </Link>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-zinc-950 sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
              {description}
            </p>
          </div>
          {action}
        </div>

        {children}
      </div>
    </main>
  );
}
