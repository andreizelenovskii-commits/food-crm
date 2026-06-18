import { redirect } from "next/navigation";
import { StaffShell } from "@/modules/auth/components/staff-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { getUserHomePath } from "@/modules/auth/auth.redirect";
import { canAccessKitchenWorkspace } from "@/modules/auth/authz";
import { KitchenWorkspace } from "@/modules/orders/components/kitchen-workspace";
import { fetchKitchenOrders } from "@/modules/orders/orders.api";
import type { KitchenOrderListItem } from "@/modules/orders/orders.types";

export default async function KitchenPage(props: {
  searchParams?: Promise<{ returnTo?: string }>;
}) {
  const user = await requirePermission("view_orders");

  if (!canAccessKitchenWorkspace(user)) {
    redirect(getUserHomePath(user));
  }

  const searchParams = await props.searchParams;
  let orders: KitchenOrderListItem[] = [];
  let errorMessage: string | null = null;

  try {
    orders = await fetchKitchenOrders();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка API";
  }

  return (
    <StaffShell
      user={user}
      title="Кухня"
      subtitle="Очередь заказов для приготовления"
      navItems={[]}
      activeHref="/kitchen"
      returnTo={searchParams?.returnTo}
    >
      <KitchenWorkspace user={user} orders={orders} errorMessage={errorMessage} />
    </StaffShell>
  );
}
