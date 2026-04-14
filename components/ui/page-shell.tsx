import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  align?: "center" | "top";
  action?: ReactNode;
};

export function PageShell({
  title,
  description,
  children,
  align = "top",
  action,
}: PageShellProps) {
  const layoutClassName =
    align === "center"
      ? "flex min-h-screen items-center justify-center px-6 py-12"
      : "min-h-screen px-6 py-10";

  return (
    <main className={layoutClassName}>
      <div className="mx-auto w-full max-w-6xl">
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
