export function getDeliveryAddressFromFormData(formData: FormData) {
  const deliveryAddress = String(formData.get("deliveryAddress") ?? "").trim();

  if (deliveryAddress) {
    return deliveryAddress;
  }

  const addressesJson = String(formData.get("addressesJson") ?? "").trim();

  if (!addressesJson) {
    return "";
  }

  try {
    const parsed = JSON.parse(addressesJson) as unknown;

    if (!Array.isArray(parsed)) {
      return "";
    }

    return parsed
      .map((address) => String(address ?? "").trim())
      .filter(Boolean)[0] ?? "";
  } catch {
    return "";
  }
}
