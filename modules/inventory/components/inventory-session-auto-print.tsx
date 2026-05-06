"use client";

import { useEffect } from "react";

export function InventorySessionAutoPrint({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;

    const frameId = window.requestAnimationFrame(() => window.print());
    return () => window.cancelAnimationFrame(frameId);
  }, [enabled]);

  return null;
}
