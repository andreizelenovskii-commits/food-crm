"use client";

import { useState } from "react";
import { ClientForm } from "@/modules/clients/components/client-form";
import type { ClientType } from "@/modules/clients/clients.types";

const CREATE_VARIANTS: Array<{
  type: ClientType;
  label: string;
}> = [
  { type: "CLIENT", label: "Добавить клиента" },
  { type: "ORGANIZATION", label: "Добавить организацию" },
];

export function ClientCreatePanel() {
  const [activeType, setActiveType] = useState<ClientType>("CLIENT");

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {CREATE_VARIANTS.map((variant) => {
          const isActive = activeType === variant.type;

          return (
            <button
              key={variant.type}
              type="button"
              onClick={() => setActiveType(variant.type)}
              className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                  : "border-zinc-300 bg-white text-zinc-950 hover:border-zinc-500 hover:bg-zinc-50"
              }`}
            >
              {variant.label}
            </button>
          );
        })}
      </div>

      <ClientForm type={activeType} />
    </div>
  );
}
