"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type WorkspaceNavigateEvent = CustomEvent<{ href: string }>;

export function WorkspaceNavigationListener() {
  const router = useRouter();

  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const { href } = (event as WorkspaceNavigateEvent).detail;

      router.push(href);
      router.refresh();
    };
    const handleRefresh = () => {
      router.refresh();
    };

    window.addEventListener("foodlike:workspace-navigate", handleNavigate);
    window.addEventListener("foodlike:workspace-refresh", handleRefresh);

    return () => {
      window.removeEventListener("foodlike:workspace-navigate", handleNavigate);
      window.removeEventListener("foodlike:workspace-refresh", handleRefresh);
    };
  }, [router]);

  return null;
}
