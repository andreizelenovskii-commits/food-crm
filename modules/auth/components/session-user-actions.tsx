import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/modules/auth/auth.actions";
import type { SessionUser } from "@/modules/auth/auth.types";

type SessionUserActionsProps = {
  user: SessionUser;
  extraAction?: ReactNode;
};

export function SessionUserActions({
  user,
  extraAction,
}: SessionUserActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {extraAction}
      <Link
        href="/dashboard/profile"
        className="inline-flex items-center gap-3 rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-left transition hover:border-zinc-400 hover:bg-zinc-50"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white">
          {user.email.slice(0, 1).toUpperCase()}
        </span>
        <span className="block">
          <span className="block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            Профиль
          </span>
          <span className="block text-sm font-semibold text-zinc-950">
            {user.email}
          </span>
        </span>
      </Link>

      <form action={logoutAction}>
        <button
          type="submit"
          className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
        >
          Выйти
        </button>
      </form>
    </div>
  );
}
