import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PermissionGate } from "@/modules/auth/components/permission-gate";
import { GlassPanel, KpiTile } from "@/modules/dashboard/components/dashboard-widgets";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import { ProductDeleteButton } from "@/modules/inventory/components/product-delete-button";
import { ProductForm } from "@/modules/inventory/components/product-form";
import { fetchProductById } from "@/modules/inventory/inventory.api";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function ProductDetailsPage(props: {
  params?: Promise<{ productId: string }>;
}) {
  const params = await props.params;
  const productId = Number(params?.productId);

  if (!params || !params.productId || !Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  const product = await fetchProductById(productId);

  if (!product) {
    notFound();
  }

  const stockTone =
    product.stockQuantity === 0
      ? "text-red-700"
      : product.stockQuantity <= 5
        ? "text-amber-600"
        : "text-red-700";

  return (
    <PageShell
      title={product.name}
      description="Внутренняя карточка товара: здесь можно посмотреть параметры позиции и при необходимости обновить их."
      backHref="/dashboard/inventory"
    >
      <div className="foodlike-frame grid gap-5 p-4 sm:p-5 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-5">
          <GlassPanel className="p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="foodlike-kicker">
                  Карточка товара
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-zinc-950">{product.name}</h2>
              </div>
              {product.category ? (
                <span className="foodlike-pill">
                  {product.category}
                </span>
              ) : null}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <KpiTile label="Код товара" value={product.sku ?? "Не присвоен"} hint="SKU" />
              <KpiTile label="Остаток" value={`${formatInventoryQuantity(product.stockQuantity)} ${product.unit}`} hint={stockTone === "text-red-700" ? "Требует внимания" : "В норме"} />
              <KpiTile label="Средняя закупочная цена" value={formatMoney(product.priceCents)} hint="За единицу" />
              <KpiTile label="Стоимость остатка по закупке" value={formatMoney(product.stockQuantity * product.priceCents)} hint="По текущему остатку" />
            </div>
          </GlassPanel>

          <GlassPanel className="p-4 sm:p-5">
            <h2 className="foodlike-title-sm">Подробности</h2>
            <div className="mt-4 grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
              <p>Категория: <span className="font-medium text-zinc-900">{product.category ?? "Не указана"}</span></p>
              <p>Ед. измерения: <span className="font-medium text-zinc-900">{product.unit}</span></p>
              <p>Использований в заказах: <span className="font-medium text-zinc-900">{product.orderItemsCount}</span></p>
            </div>
            <div className="foodlike-card mt-5 p-4">
              <p className="text-sm font-medium text-zinc-700">Описание</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {product.description || "Описание для этого товара пока не заполнено."}
              </p>
            </div>
          </GlassPanel>

          <PermissionGate permission="manage_inventory">
            <div className="flex justify-end">
              <ProductDeleteButton
                productId={product.id}
                productName={product.name}
                disabled={product.orderItemsCount > 0}
                redirectTo="/dashboard/inventory"
              />
            </div>
          </PermissionGate>
        </section>

        <PermissionGate permission="manage_inventory">
          <ProductForm initialProduct={product} />
        </PermissionGate>
      </div>
    </PageShell>
  );
}
