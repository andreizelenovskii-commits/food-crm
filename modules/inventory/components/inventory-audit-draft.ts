export const INVENTORY_AUDIT_DRAFT_KEY = "food-crm.inventory-audit.draft";

export type InventoryAuditDraft = Record<string, string>;

export function readInventoryAuditDraft(): InventoryAuditDraft {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawDraft = window.localStorage.getItem(INVENTORY_AUDIT_DRAFT_KEY);

    if (!rawDraft) {
      return {};
    }

    const parsedDraft = JSON.parse(rawDraft);

    if (!parsedDraft || typeof parsedDraft !== "object" || Array.isArray(parsedDraft)) {
      return {};
    }

    return Object.entries(parsedDraft).reduce<InventoryAuditDraft>((acc, [key, value]) => {
      if (typeof value === "string") {
        acc[key] = value;
      }

      return acc;
    }, {});
  } catch {
    return {};
  }
}

export function normalizeAuditDraftValue(value: string) {
  return value.trim();
}

export function normalizeAuditDecimalDraft(value: string) {
  const normalized = value.replace(/[^\d.,]/g, "").replace(".", ",");
  const [integerPart = "", ...rest] = normalized.split(",");
  const fractionalPart = rest.join("").slice(0, 2);

  if (!rest.length) {
    return integerPart;
  }

  return `${integerPart},${fractionalPart}`;
}
