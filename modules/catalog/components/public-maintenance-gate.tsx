"use client";

import { useEffect, useState } from "react";
import {
  readMaintenanceModeSnapshot,
} from "@/shared/config/maintenance-mode";

export function PublicMaintenanceGate({
  phoneHref,
  phoneLabel,
}: {
  phoneHref: string;
  phoneLabel: string;
}) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [message, setMessage] = useState(
    "Проходят технические работы. Приносим свои извинения. Заказ вы можете сделать по номеру телефона.",
  );

  useEffect(() => {
    function readMode() {
      const snapshot = readMaintenanceModeSnapshot();

      setIsEnabled(snapshot.enabled);
      setMessage(snapshot.message || "Проходят технические работы. Приносим свои извинения. Заказ вы можете сделать по номеру телефона.");
    }

    readMode();
    window.addEventListener("storage", readMode);
    window.addEventListener("focus", readMode);

    return () => {
      window.removeEventListener("storage", readMode);
      window.removeEventListener("focus", readMode);
    };
  }, []);

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-[#fff9f4] px-4 py-8 text-[#211316]">
      <section className="w-full max-w-xl rounded-[28px] border border-[#f3d8dc] bg-white/92 p-5 text-center shadow-[0_24px_80px_rgba(143,0,16,0.16)] backdrop-blur-2xl sm:p-7">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#b00012]/70">
          FoodLike
        </p>
        <h1 className="mt-3 text-2xl font-black leading-tight text-[#211316] sm:text-3xl">
          Проходят технические работы
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[#6f5b60]">
          {message}
        </p>
        <a
          href={phoneHref}
          className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-[#b00012] px-6 text-base font-black text-white shadow-sm shadow-[#8f0010]/20 transition hover:bg-[#8f0010]"
        >
          {phoneLabel}
        </a>
      </section>
    </div>
  );
}
