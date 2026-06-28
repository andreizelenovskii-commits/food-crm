import { ManagementAccountingPage } from "@/modules/management-accounting/components/management-accounting-page";
import { requirePermission } from "@/modules/auth/auth.session";
import { fetchManagementAccounting } from "@/modules/management-accounting/management-accounting.api";

export default async function ManagementAccountingRoutePage(props: {
  searchParams?: Promise<{ date?: string }>;
}) {
  await requirePermission("view_dashboard");
  const searchParams = await props.searchParams;
  const accounting = await fetchManagementAccounting({ date: searchParams?.date });

  return <ManagementAccountingPage accounting={accounting} />;
}
