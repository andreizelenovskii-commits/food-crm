import { PageShell } from "@/components/ui/page-shell";
import { CatalogWorkspace } from "@/modules/catalog/components/catalog-workspace";
import { fetchCatalogItems } from "@/modules/catalog/catalog.api";
import { fetchTechCardOptions } from "@/modules/tech-cards/tech-cards.api";

export default async function CatalogPage(props: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const searchParams = await props.searchParams;
  const selectedCategory = searchParams?.category?.trim() ?? "";
  const [catalogItems, techCardOptions] = await Promise.all([
    fetchCatalogItems(),
    fetchTechCardOptions(),
  ]);

  return (
    <PageShell
      title="Каталог"
      description="Клиентский и внутренний прайс, категории сайта и привязка позиций к техкартам."
      backHref="/dashboard"
    >
      <CatalogWorkspace
        catalogItems={catalogItems}
        techCardOptions={techCardOptions}
        selectedCategory={selectedCategory}
        canManageCatalog={true}
      />
    </PageShell>
  );
}
