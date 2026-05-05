export const SUPPLIER_CATEGORIES = [
  "Городская закупка",
  "Внешняя поставка",
] as const;

export type InventorySupplierCategory = (typeof SUPPLIER_CATEGORIES)[number];

export type InventorySupplierRecord = {
  id: string;
  name: string;
  category: InventorySupplierCategory;
  createdAt: string;
};

const STORAGE_KEY = "foodlike.inventory.suppliers";
const UPDATE_EVENT = "foodlike:inventory-suppliers-updated";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function loadInventorySuppliers(): InventorySupplierRecord[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

export function saveInventorySupplier({
  name,
  category,
}: {
  name: string;
  category: InventorySupplierCategory;
}) {
  const normalizedName = name.trim();
  const suppliers = loadInventorySuppliers();
  const existingIndex = suppliers.findIndex(
    (supplier) => supplier.name.toLowerCase() === normalizedName.toLowerCase(),
  );
  const nextSupplier: InventorySupplierRecord = {
    id: existingIndex >= 0 ? suppliers[existingIndex].id : String(Date.now()),
    name: normalizedName,
    category,
    createdAt: existingIndex >= 0 ? suppliers[existingIndex].createdAt : new Date().toISOString(),
  };
  const nextSuppliers =
    existingIndex >= 0
      ? suppliers.map((supplier, index) => (index === existingIndex ? nextSupplier : supplier))
      : [...suppliers, nextSupplier];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSuppliers));
  window.dispatchEvent(new Event(UPDATE_EVENT));

  return nextSuppliers;
}

export function subscribeInventorySuppliers(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener(UPDATE_EVENT, listener);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(UPDATE_EVENT, listener);
    window.removeEventListener("storage", handleStorage);
  };
}
