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
        className="rounded-[12px] border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-800 transition hover:border-red-200 hover:bg-red-50 hover:text-red-900"
      >
        Выйти
      </button>
    </form>
  );
}
