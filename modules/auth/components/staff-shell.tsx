"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/modules/auth/components/logout-button";
import { LocalEnvBadge } from "@/components/ui/local-env-badge";
import type { SessionUser } from "@/modules/auth/auth.types";
import { getSafeReturnTo } from "@/modules/auth/auth.redirect";
import { shouldShowBackToCrm } from "@/modules/auth/authz";

type StaffNavItem = {
  href: string;
  label: string;
};

export function StaffShell({
  user,
  title,
  subtitle,
  navItems,
  activeHref,
  children,
  returnTo,
}: {
  user: SessionUser;
  title: string;
  subtitle: string;
  navItems: StaffNavItem[];
  activeHref?: string;
  children: ReactNode;
  returnTo?: string | null;
}) {
  const pathname = usePathname();
  const currentHref = activeHref ?? pathname;
  const displayName = user.displayName?.trim() || user.role;
  const showBackToCrm = shouldShowBackToCrm(user, currentHref);
  const backToCrmHref = getSafeReturnTo(returnTo);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff4f4_0%,#fffafa_38%,#f6f1f1_100%)] px-3 py-4 sm:px-5">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header className="rounded-[24px] border border-red-950/10 bg-white/88 p-4 shadow-sm shadow-red-950/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-800/70">FoodLike CRM</p>
              <h1 className="mt-1 text-2xl font-semibold text-zinc-950 sm:text-3xl">{title}</h1>
              <p className="mt-1 text-sm leading-6 text-zinc-500">{subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LocalEnvBadge />
              {showBackToCrm ? (
                <Link
                  href={backToCrmHref}
                  prefetch={false}
                  className="inline-flex h-10 items-center rounded-full border border-red-200 bg-red-800 px-4 text-sm font-semibold text-white transition hover:bg-red-900"
                >
                  ← Вернуться в CRM
                </Link>
              ) : null}
              <Link
                href="/dashboard/profile"
                prefetch={false}
                className="inline-flex h-10 items-center rounded-full border border-red-100 bg-white px-4 text-sm font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
              >
                {displayName}
              </Link>
              <LogoutButton />
            </div>
          </div>

          {navItems.length > 0 ? (
            <nav className="mt-4 flex flex-wrap gap-2">
              {navItems.map((item) => {
                const isActive = currentHref === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    className={[
                      "inline-flex h-12 items-center rounded-full border px-5 text-base font-semibold transition",
                      isActive
                        ? "border-red-800 bg-red-800 text-white shadow-sm shadow-red-950/15"
                        : "border-red-100 bg-white text-red-800 hover:border-red-800 hover:bg-red-50",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </header>

        {children}
      </div>
    </main>
  );
}
