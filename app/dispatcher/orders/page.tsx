import { fetchDispatcherWorkspace, fetchOrderCreateOptions } from "@/modules/orders/orders.api";
import { SimpleDispatcherOrders } from "@/modules/orders/components/simple-dispatcher-orders";

export default async function DispatcherOrdersPage() {
  const [workspace, orderOptions] = await Promise.all([
    fetchDispatcherWorkspace(),
    fetchOrderCreateOptions(),
  ]);

  return <SimpleDispatcherOrders initialWorkspace={workspace} orderOptions={orderOptions} />;
}
