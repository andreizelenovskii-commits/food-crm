import { backendGet } from "@/shared/api/backend";
import type { ManagementAccountingViewModel } from "@/modules/management-accounting/management-accounting.types";

export async function fetchManagementAccounting({ date }: { date?: string | null }) {
  const searchParams = new URLSearchParams();

  if (date) {
    searchParams.set("date", date);
  }

  const query = searchParams.toString();
  return backendGet<ManagementAccountingViewModel>(`/api/v1/analytics/management${query ? `?${query}` : ""}`);
}
