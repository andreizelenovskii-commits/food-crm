import type { ReactNode } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { getSessionUser } from "@/modules/auth/auth.session";

type PageShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  align?: "center" | "top";
  action?: ReactNode;
  backHref?: string;
  compact?: boolean;
};

export async function PageShell({
  title,
  description,
  children,
  align = "top",
  action,
  backHref,
  compact = false,
}: PageShellProps) {
  const user = await getSessionUser();
  const showSidebar = align !== "center";
  const layoutClassName =
    align === "center"
      ? "flex min-h-screen items-center justify-center px-4 sm:px-5 py-12"
      : compact
        ? "flex min-h-dvh w-full flex-1 flex-col"
        : "min-h-screen";

  return (
    <main className={`${layoutClassName} bg-transparent`}>
      <div
        className={
          showSidebar
            ? compact
              ? "flex min-h-0 flex-1 flex-col md:flex-row"
              : "min-h-screen md:flex"
            : ""
        }
      >
        {showSidebar ? <AppSidebar user={user} /> : null}
        <div
          className={`mx-auto w-full ${
            showSidebar
              ? compact
                ? "flex min-h-0 min-w-0 flex-1 flex-col px-4 pb-4 pt-16 sm:px-5 md:pt-4 lg:px-6"
                : "min-w-0 flex-1 px-4 pb-4 pt-16 sm:px-5 md:pt-4 lg:px-6"
              : "max-w-6xl"
          }`}
        >
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
        </div>
      </div>
    </main>
  );
}
