import { ManagementAccountingPage } from "@/modules/management-accounting/components/management-accounting-page";
import { fetchManagementAccounting } from "@/modules/management-accounting/management-accounting.api";

export default async function ManagementAccountingRoutePage(props: {
  searchParams?: Promise<{ date?: string }>;
}) {
  const searchParams = await props.searchParams;
  const accounting = await fetchManagementAccounting({ date: searchParams?.date });

  return <ManagementAccountingPage accounting={accounting} />;
}
