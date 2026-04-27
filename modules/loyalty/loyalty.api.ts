import type { LoyaltySnapshot } from "@/modules/loyalty/loyalty.types";
import { backendGet } from "@/shared/api/backend";

export async function fetchLoyaltySnapshot(): Promise<LoyaltySnapshot> {
  return backendGet<LoyaltySnapshot>("/api/v1/loyalty");
}
