import { fetchOrders } from "@/modules/orders/orders.api";
import { SimpleDispatcherOrders } from "@/modules/orders/components/simple-dispatcher-orders";

export default async function DispatcherOrdersPage() {
  const orders = await fetchOrders();

  return <SimpleDispatcherOrders orders={orders} />;
}
