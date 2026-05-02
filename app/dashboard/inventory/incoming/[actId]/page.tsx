import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { IncomingActEditForm } from "@/modules/inventory/components/incoming-act-edit-form";
import {
  fetchIncomingActById,
  fetchInventoryResponsibleOptions,
  fetchProducts,
} from "@/modules/inventory/inventory.api";

export default async function IncomingActDetailsPage(props: {
  params?: Promise<{ actId: string }>;
}) {
  const user = await requirePermission("view_inventory");
  const params = await props.params;
  const actId = Number(params?.actId);

  if (!params?.actId || !Number.isInteger(actId) || actId <= 0) {
    notFound();
  }

  const [act, products, responsibleOptions] = await Promise.all([
    fetchIncomingActById(actId),
    fetchProducts(),
    fetchInventoryResponsibleOptions(),
  ]);

  if (!act) {
    notFound();
  }

  if (act.isCompleted) {
    redirect("/dashboard/inventory?tab=incoming");
  }

  const canManageInventory = hasPermission(user, "manage_inventory");

  return (
    <PageShell
      title={`Акт поступления #${act.id}`}
      description="Отдельная карточка открытого акта: здесь можно обновить поставщика, состав поставки и закупочные цены."
      backHref="/dashboard/inventory?tab=incoming"
      action={<SessionUserActions user={user} />}
    >
      {canManageInventory ? (
        <IncomingActEditForm
          act={act}
          products={products}
          responsibleOptions={responsibleOptions}
        />
      ) : (
        <div className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 text-sm text-zinc-600 shadow-sm shadow-zinc-950/5">
          У твоей роли нет прав на редактирование актов поступления.
        </div>
      )}
    </PageShell>
  );
}
