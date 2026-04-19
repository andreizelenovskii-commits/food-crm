import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "@/modules/auth/components/logout-button";
import { USER_ROLE_LABELS } from "@/modules/auth/auth.types";
import type { SessionUser } from "@/modules/auth/auth.types";

type SessionUserActionsProps = {
  user: SessionUser;
  extraAction?: ReactNode;
};

export function SessionUserActions({
  user,
  extraAction,
}: SessionUserActionsProps) {
  const profileName = user.displayName?.trim() || USER_ROLE_LABELS[user.role];
  const profileInitial = profileName.slice(0, 1).toUpperCase();

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f2fbf4_100%)] p-2 shadow-sm shadow-emerald-950/5">
      {extraAction}
      <Link
        href="/dashboard/profile"
        className="inline-flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-2 text-left transition hover:border-emerald-300 hover:bg-emerald-50/60"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white shadow-sm shadow-emerald-700/20">
          {profileInitial}
        </span>
        <span className="block">
          <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-700/80">
            Мой профиль
          </span>
          <span className="block text-sm font-semibold text-zinc-950">
            {profileName}
          </span>
        </span>
      </Link>
      <LogoutButton />
    </div>
  );
}
