"use client";

import type { CatalogFormState } from "@/modules/catalog/catalog.form-types";
import type { CatalogItemFormProps } from "@/modules/catalog/components/catalog-item-form.model";
import { KITCHEN_ZONE_LABELS, KITCHEN_ZONES, type KitchenZone } from "@/modules/inventory/inventory.types";

export function ComboKitchenZonePicker({
  selectedZones,
  onToggle,
}: {
  selectedZones: KitchenZone[];
  onToggle: (zone: KitchenZone) => void;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-sm font-medium text-zinc-700">Кухонные зоны</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {KITCHEN_ZONES.map((zone) => {
          const isSelected = selectedZones.includes(zone);

          return (
            <button
              key={zone}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(zone)}
              className={`flex min-h-12 items-center gap-2 rounded-[16px] border px-3 text-left text-sm font-semibold transition ${
                isSelected
                  ? "border-red-700 bg-red-50 text-red-800 shadow-sm"
                  : "border-red-950/10 bg-white text-zinc-700 hover:border-red-200 hover:text-red-800"
              }`}
            >
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                  isSelected ? "border-red-700 bg-red-700 text-white" : "border-zinc-300 text-transparent"
                }`}
              >
                ✓
              </span>
              <span>{KITCHEN_ZONE_LABELS[zone]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function parseInitialKitchenZones(
  initialItem: CatalogItemFormProps["initialItem"],
  values: CatalogFormState["values"],
): KitchenZone[] {
  const itemZones = initialItem?.kitchenZones?.filter((zone): zone is KitchenZone =>
    KITCHEN_ZONES.includes(zone as KitchenZone),
  ) ?? [];

  if (itemZones.length) {
    return itemZones;
  }

  try {
    const parsed = JSON.parse(values.kitchenZones) as unknown;

    if (Array.isArray(parsed)) {
      const zones = parsed
        .map((zone) => String(zone ?? "").trim())
        .filter((zone): zone is KitchenZone => KITCHEN_ZONES.includes(zone as KitchenZone));

      if (zones.length) {
        return [...new Set(zones)];
      }
    }
  } catch {
    // Older saved form states did not have kitchenZones.
  }

  return KITCHEN_ZONES.includes(values.kitchenZone as KitchenZone)
    ? [values.kitchenZone as KitchenZone]
    : [];
}

export function resolveKitchenZoneByCategory(category: string): KitchenZone | "" {
  if (category === "Пицца") {
    return "pizza";
  }

  if (
    category === "Роллы" ||
    category === "Холодные роллы" ||
    category === "Запеченные роллы" ||
    category === "Теплые роллы" ||
    category === "Онигири" ||
    category === "Суши-доги"
  ) {
    return "rolls";
  }

  if (category === "Фастфуд") {
    return "fastfood";
  }

  return "";
}
