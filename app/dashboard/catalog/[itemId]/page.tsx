import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { type CatalogFormValues } from "@/modules/catalog/catalog.form-types";
import { CatalogItemForm } from "@/modules/catalog/components/catalog-item-form";
import { fetchCatalogItemById } from "@/modules/catalog/catalog.api";
import { fetchTechCardOptions } from "@/modules/tech-cards/tech-cards.api";

function formatPriceInput(priceCents: number) {
  return (priceCents / 100).toFixed(2).replace(/\.00$/, "");
}

export default async function CatalogItemEditPage(props: {
  params: Promise<{ itemId: string }>;
}) {
  const user = await requirePermission("manage_catalog");
  const params = await props.params;
  const itemId = Number(params.itemId);

  if (!Number.isInteger(itemId) || itemId <= 0) {
    notFound();
  }

  const [catalogItem, techCardOptions] = await Promise.all([
    fetchCatalogItemById(itemId),
    fetchTechCardOptions(),
  ]);

  if (!catalogItem) {
    notFound();
  }

  const initialValues: CatalogFormValues = {
    name: catalogItem.name,
    priceListType: catalogItem.priceListType,
    category: catalogItem.category ?? "",
    kitchenZone: catalogItem.kitchenZone ?? "",
    kitchenZones: JSON.stringify(
      catalogItem.kitchenZones.length
        ? catalogItem.kitchenZones
        : catalogItem.kitchenZone
          ? [catalogItem.kitchenZone]
          : [],
    ),
    description: catalogItem.description ?? "",
    imageUrl: catalogItem.imageUrl ?? "",
    price: formatPriceInput(catalogItem.priceCents),
    technologicalCardId: String(catalogItem.technologicalCardId),
    variants: JSON.stringify(catalogItem.variants.map((variant) => ({
      technologicalCardId: variant.technologicalCardId,
      label: variant.label,
      price: variant.priceCents / 100,
      isDefault: variant.isDefault,
    }))),
    excludedIngredients: JSON.stringify(catalogItem.excludedIngredients.map((ingredient) => ({
      productId: ingredient.productId,
      label: ingredient.label,
    }))),
  };

  return (
    <PageShell
      title="Редактирование позиции"
      description="Обнови карточку каталога, не меняя логику технологической карты."
      backHref="/dashboard/catalog"
      action={<SessionUserActions user={user} />}
    >
      <div className="mx-auto max-w-3xl">
        <CatalogItemForm
          mode="edit"
          initialItem={catalogItem}
          initialValues={initialValues}
          submitLabel="Сохранить изменения"
          techCardOptions={techCardOptions}
        />
      </div>
    </PageShell>
  );
}
