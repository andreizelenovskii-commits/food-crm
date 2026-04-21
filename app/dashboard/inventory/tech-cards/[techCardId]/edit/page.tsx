import { redirect } from "next/navigation";
import { requirePermission } from "@/modules/auth/auth.session";

export default async function EditTechCardPage(props: {
  params?: Promise<{ techCardId: string }>;
}) {
  await requirePermission("manage_inventory");
  const params = await props.params;
  const techCardId = Number(params?.techCardId);

  if (!params?.techCardId || !Number.isInteger(techCardId) || techCardId <= 0) {
    redirect("/dashboard/inventory?tab=recipes");
  }

  redirect(`/dashboard/inventory/tech-cards/${techCardId}`);
}
