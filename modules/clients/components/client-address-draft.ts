export type AddressDraft = {
  id: string;
  isCollapsed: boolean;
  residenceType: string;
  city: string;
  street: string;
  house: string;
  entrance: string;
  floor: string;
  apartment: string;
};

export type AddressFieldDefaults = {
  residenceType?: string;
  city?: string;
  street?: string;
  house?: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
};

function parseAddressPart(address: string | null | undefined, pattern: RegExp) {
  if (!address) {
    return "";
  }

  const match = address.match(pattern);
  return match?.[1]?.trim() ?? "";
}

export function createEmptyAddressDraft(): AddressDraft {
  return {
    id: crypto.randomUUID(),
    isCollapsed: false,
    residenceType: "APARTMENT",
    city: "Оха",
    street: "",
    house: "",
    entrance: "",
    floor: "",
    apartment: "",
  };
}

function createAddressDraftFromText(address: string | null | undefined): AddressDraft {
  return {
    id: crypto.randomUUID(),
    isCollapsed: Boolean(String(address ?? "").trim()),
    residenceType: address?.toLowerCase().includes("частный дом") ? "PRIVATE_HOUSE" : "APARTMENT",
    city: parseAddressPart(address, /г\.\s*([^,]+)/i) || "Оха",
    street: parseAddressPart(address, /ул\.\s*([^,]+)/i),
    house: parseAddressPart(address, /д\.\s*([^,]+)/i),
    entrance: parseAddressPart(address, /подъезд\s*([^,]+)/i),
    floor: parseAddressPart(address, /этаж\s*([^,]+)/i),
    apartment: parseAddressPart(address, /кв\.\s*([^,]+)/i),
  };
}

function createAddressDraftFromDefaults(fieldDefaults: AddressFieldDefaults): AddressDraft {
  return {
    id: crypto.randomUUID(),
    isCollapsed: false,
    residenceType: fieldDefaults.residenceType || "APARTMENT",
    city: fieldDefaults.city || "Оха",
    street: fieldDefaults.street || "",
    house: fieldDefaults.house || "",
    entrance: fieldDefaults.entrance || "",
    floor: fieldDefaults.floor || "",
    apartment: fieldDefaults.apartment || "",
  };
}

function parseStoredAddresses(value: string | null | undefined) {
  return String(value ?? "")
    .split(/\n+/)
    .map((address) => address.trim())
    .filter(Boolean);
}

export function getInitialAddressDrafts(
  defaultAddress: string | null | undefined,
  addressesJsonDefault: string | undefined,
  fieldDefaults: AddressFieldDefaults | undefined,
) {
  if (addressesJsonDefault) {
    const parsed = parseStoredAddresses(addressesJsonDefault);

    if (parsed.length > 0) {
      return parsed.map(createAddressDraftFromText);
    }
  }

  if (fieldDefaults && Object.values(fieldDefaults).some(Boolean)) {
    return [createAddressDraftFromDefaults(fieldDefaults)];
  }

  const parsedDefaultAddresses = parseStoredAddresses(defaultAddress);

  if (parsedDefaultAddresses.length > 0) {
    return parsedDefaultAddresses.map(createAddressDraftFromText);
  }

  return [createEmptyAddressDraft()];
}

export function formatAddressDraft(address: AddressDraft) {
  const parts = [
    address.city ? `г. ${address.city.trim()}` : "",
    address.street ? `ул. ${address.street.trim()}` : "",
    address.house ? `д. ${address.house.trim()}` : "",
    address.residenceType === "PRIVATE_HOUSE" ? "частный дом" : "",
    address.residenceType === "APARTMENT" && address.entrance ? `подъезд ${address.entrance.trim()}` : "",
    address.residenceType === "APARTMENT" && address.floor ? `этаж ${address.floor.trim()}` : "",
    address.residenceType === "APARTMENT" && address.apartment ? `кв. ${address.apartment.trim()}` : "",
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "";
}
