import { OrdersPage } from "@/modules/orders/components/orders-page";
import { fetchOrders, fetchPackagingOptions } from "@/modules/orders/orders.api";

function padDatePart(value: string | undefined, fallback: string) {
  const normalized = Number(value);
  return Number.isFinite(normalized) && normalized > 0
    ? String(normalized).padStart(2, "0")
    : fallback;
}

function resolveDateParam(searchParams?: { date?: string; day?: string; month?: string; year?: string }) {
  if (searchParams?.year || searchParams?.month || searchParams?.day) {
    const now = new Date();
    const year = String(Number(searchParams.year) || now.getFullYear());
    const month = padDatePart(searchParams.month, "01");
    const day = padDatePart(searchParams.day, "01");

    return `${year}-${month}-${day}`;
  }

  return searchParams?.date;
}

export default async function OrdersRoutePage(props: {
  searchParams?: Promise<{ period?: string; date?: string; day?: string; month?: string; year?: string }>;
}) {
  const searchParams = await props.searchParams;
  const [orders, packagingOptions] = await Promise.all([
    fetchOrders(),
    fetchPackagingOptions(),
  ]);

  return (
    <OrdersPage
      period={searchParams?.period}
      date={resolveDateParam(searchParams)}
      orders={orders}
      packagingOptions={packagingOptions}
    />
  );
}
