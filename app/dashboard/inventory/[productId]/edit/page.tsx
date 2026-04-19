import { redirect } from "next/navigation";
import { requirePermission } from "@/modules/auth/auth.session";

export default async function EditProductPage(props: {
  params?: Promise<{ productId: string }>;
}) {
  await requirePermission("manage_inventory");
  const params = await props.params;
  const productId = Number(params?.productId);

  if (!params || !params.productId || !Number.isInteger(productId) || productId <= 0) {
    redirect("/dashboard/inventory");
  }

  redirect(`/dashboard/inventory/${productId}`);
}
