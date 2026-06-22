import { redirect } from "next/navigation";

export default async function EditProductPage(props: {
  params?: Promise<{ productId: string }>;
}) {
  const params = await props.params;
  const productId = Number(params?.productId);

  if (!params || !params.productId || !Number.isInteger(productId) || productId <= 0) {
    redirect("/dashboard/inventory");
  }

  redirect(`/dashboard/inventory/${productId}`);
}
