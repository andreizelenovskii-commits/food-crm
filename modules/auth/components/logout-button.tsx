"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { logoutAction } from "@/modules/auth/auth.actions";

export function LogoutButton() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  return (
    <form action={logoutAction}>
      <input type="hidden" name="returnTo" value={currentUrl} />
      <button
        type="submit"
        className="rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900"
      >
        Выйти
      </button>
    </form>
  );
}
