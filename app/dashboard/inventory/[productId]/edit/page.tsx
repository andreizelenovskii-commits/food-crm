import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { ProductForm } from "@/modules/inventory/components/product-form";
import { fetchProductById } from "@/modules/inventory/inventory.service";

export default async function EditProductPage(props: {
  params?: Promise<{ productId: string }>;
}) {
  const user = await requirePermission("manage_inventory");
  const params = await props.params;
  const productId = Number(params?.productId);

  if (!params || !params.productId || !Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  const product = await fetchProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <PageShell
      title={`Редактировать: ${product.name}`}
      description="Обнови остаток, цену и параметры складской позиции."
      backHref="/dashboard/inventory"
      action={
        <SessionUserActions
          user={user}
          extraAction={
            <Link
              href="/dashboard/inventory"
              className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
            >
              Назад к складу
            </Link>
          }
        />
      }
    >
      <ProductForm initialProduct={product} />
    </PageShell>
  );
}
