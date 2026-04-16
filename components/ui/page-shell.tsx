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
        {backHref ? (
          <div className="mb-5">
            <Link
              href={backHref}
              aria-label="Вернуться на предыдущую страницу"
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-300 bg-white/90 text-zinc-700 shadow-sm shadow-zinc-950/5 transition hover:-translate-x-0.5 hover:border-zinc-400 hover:text-zinc-950"
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
          </div>
        ) : null}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">
              Food CRM
            </p>
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
