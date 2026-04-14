export type DashboardMetric = {
  label: string;
  value: number;
};

export function getDashboardMetrics(): DashboardMetric[] {
  return [
    { label: "Заказы", value: 0 },
    { label: "Клиенты", value: 0 },
    { label: "Товары", value: 0 },
  ];
}
