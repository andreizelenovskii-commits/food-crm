import { backendGet } from "@/shared/api/backend";
import type { SalesAnalyticsViewModel } from "@/modules/sales/sales.page-model";

export async function fetchSalesAnalytics({
  period,
  date,
}: {
  period?: string | null;
  date?: string | null;
}) {
  const searchParams = new URLSearchParams();

  if (period) {
    searchParams.set("period", period);
  }

  if (date) {
    searchParams.set("date", date);
  }

  const query = searchParams.toString();
  return backendGet<SalesAnalyticsViewModel>(`/api/v1/analytics/sales${query ? `?${query}` : ""}`);
}
