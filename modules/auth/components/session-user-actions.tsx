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
    <div className="flex flex-wrap items-center justify-end gap-2 rounded-[14px] border border-red-950/10 bg-white/85 p-1.5 shadow-sm shadow-red-950/5">
      {extraAction}
      <Link
        href="/dashboard/profile"
        className="inline-flex items-center gap-2.5 rounded-[12px] border border-red-100 bg-white px-3 py-1.5 text-left transition hover:border-red-200 hover:bg-red-50/60"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-red-800 text-xs font-semibold text-white shadow-sm shadow-red-950/20">
          {profileInitial}
        </span>
        <span className="block">
          <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-red-800/75">
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
