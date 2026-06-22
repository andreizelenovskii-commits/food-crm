import { PageShell } from "@/components/ui/page-shell";
import { fetchDispatcherShifts } from "@/modules/orders/orders.api";
import { ShiftHistoryPage } from "@/modules/orders/components/shift-history-page";

export default async function SalesShiftsPage() {
  const shifts = await fetchDispatcherShifts();

  return (
    <PageShell
      title="Смены"
      description="История диспетчерских смен, чеков и выручки."
      backHref="/dashboard/sales"
    >
      <ShiftHistoryPage shifts={shifts} />
    </PageShell>
  );
}
