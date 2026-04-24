import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import { ProductDeleteButton } from "@/modules/inventory/components/product-delete-button";
import { ProductForm } from "@/modules/inventory/components/product-form";
import { fetchProductById } from "@/modules/inventory/inventory.service";

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
  const user = await requirePermission("view_inventory");
  const params = await props.params;
  const productId = Number(params?.productId);

  if (!params || !params.productId || !Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  const product = await fetchProductById(productId);

  if (!product) {
    notFound();
  }

  const canManageInventory = hasPermission(user, "manage_inventory");
  const stockTone =
    product.stockQuantity === 0
      ? "text-red-600"
      : product.stockQuantity <= 5
        ? "text-amber-600"
        : "text-emerald-600";

  return (
    <PageShell
      title={product.name}
      description="Внутренняя карточка товара: здесь можно посмотреть параметры позиции и при необходимости обновить их."
      backHref="/dashboard/inventory"
      action={<SessionUserActions user={user} />}
    >
      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-6">
          <article className="rounded-3xl border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#f4f7f1_100%)] p-6 shadow-sm shadow-zinc-950/5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Карточка товара
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-zinc-950">{product.name}</h2>
              </div>
              {product.category ? (
                <span className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
                  {product.category}
                </span>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/80 bg-white/90 p-4">
                <p className="text-sm font-medium text-zinc-500">Код товара</p>
                <p className="mt-3 text-xl font-semibold text-zinc-950">{product.sku ?? "Не присвоен"}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/90 p-4">
                <p className="text-sm font-medium text-zinc-500">Остаток</p>
                <p className={`mt-3 text-xl font-semibold ${stockTone}`}>
                  {formatInventoryQuantity(product.stockQuantity)} {product.unit}
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/90 p-4">
                <p className="text-sm font-medium text-zinc-500">Средняя закупочная цена</p>
                <p className="mt-3 text-xl font-semibold text-zinc-950">{formatMoney(product.priceCents)}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/90 p-4">
                <p className="text-sm font-medium text-zinc-500">Стоимость остатка по закупке</p>
                <p className="mt-3 text-xl font-semibold text-zinc-950">
                  {formatMoney(product.stockQuantity * product.priceCents)}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <h2 className="text-xl font-semibold text-zinc-950">Подробности</h2>
            <div className="mt-4 grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
              <p>Категория: <span className="font-medium text-zinc-900">{product.category ?? "Не указана"}</span></p>
              <p>Ед. измерения: <span className="font-medium text-zinc-900">{product.unit}</span></p>
              <p>Использований в заказах: <span className="font-medium text-zinc-900">{product.orderItemsCount}</span></p>
            </div>
            <div className="mt-5 rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
              <p className="text-sm font-medium text-zinc-700">Описание</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {product.description || "Описание для этого товара пока не заполнено."}
              </p>
            </div>
          </article>

          {canManageInventory ? (
            <div className="flex justify-end">
              <ProductDeleteButton
                productId={product.id}
                productName={product.name}
                disabled={product.orderItemsCount > 0}
                redirectTo="/dashboard/inventory"
              />
            </div>
          ) : null}
        </section>

        {canManageInventory ? (
          <ProductForm initialProduct={product} />
        ) : null}
      </div>
    </PageShell>
  );
}
