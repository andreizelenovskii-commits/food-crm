import type { ReactNode } from "react";
import { AppSidebar } from "@/components/ui/app-sidebar";

type PageShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  align?: "center" | "top";
  action?: ReactNode;
  backHref?: string;
};

export function PageShell({
  title,
  children,
  align = "top",
  action,
}: PageShellProps) {
  const showSidebar = align !== "center";
  const layoutClassName =
    align === "center"
      ? "flex min-h-screen items-center justify-center px-4 sm:px-5 py-12"
      : "min-h-screen";

  return (
    <main className={`${layoutClassName} bg-transparent`}>
      <div className={showSidebar ? "min-h-screen md:flex" : ""}>
        {showSidebar ? <AppSidebar /> : null}
        <div
          className={`mx-auto w-full ${
            showSidebar
              ? "min-w-0 flex-1 px-4 pb-4 pt-16 sm:px-5 md:pt-4 lg:px-6"
              : "max-w-6xl"
          }`}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold leading-tight text-zinc-950 sm:text-[28px]">
                {title}
              </h1>
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>

          {children}
        </div>
      </div>
    </main>
  );
}
