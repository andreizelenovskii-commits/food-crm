import { PageShell } from "@/components/ui/page-shell";
import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { CatalogWorkspace } from "@/modules/catalog/components/catalog-workspace";
import { fetchCatalogItems } from "@/modules/catalog/catalog.api";
import { fetchTechCardOptions } from "@/modules/tech-cards/tech-cards.api";

export default async function CatalogPage(props: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const user = await requirePermission("view_catalog");
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
      action={<SessionUserActions user={user} />}
    >
      <CatalogWorkspace
        catalogItems={catalogItems}
        techCardOptions={techCardOptions}
        selectedCategory={selectedCategory}
        canManageCatalog={hasPermission(user, "manage_catalog")}
      />
    </PageShell>
  );
}
