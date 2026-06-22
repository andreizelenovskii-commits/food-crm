"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { useEmployeeSession } from "@/modules/auth/components/employee-session-provider";
import { ReportsPage } from "@/modules/reports/components/reports-page";
import type { ReportsInput } from "@/modules/reports/reports.page-model";
import { browserBackendJson } from "@/shared/api/browser-backend";

type ReportsRouteClientProps = {
  period?: string;
  date?: string;
  month?: string;
};

type ReportsData = Pick<
  ReportsInput,
  | "orders"
  | "catalogItems"
  | "products"
  | "techCards"
  | "incomingActs"
  | "writeoffActs"
  | "employees"
  | "clients"
  | "loyalty"
>;

const EMPTY_REPORTS_DATA: ReportsData = {
  orders: [],
  catalogItems: [],
  products: [],
  techCards: [],
  incomingActs: [],
  writeoffActs: [],
  employees: [],
  clients: [],
  loyalty: null,
};

export function ReportsRouteClient({ period, date, month }: ReportsRouteClientProps) {
  const { can } = useEmployeeSession();
  const [data, setData] = useState<ReportsData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const canViewOrders = can("view_orders");
  const canViewCatalog = can("view_catalog");
  const canViewInventory = can("view_inventory");
  const canViewEmployees = can("view_employees");
  const canViewClients = can("view_clients");

  useEffect(() => {
    let isActive = true;

    async function loadReports() {
      setErrorMessage(null);
      setData(null);

      try {
        const [
          orders,
          catalogItems,
          products,
          techCards,
          incomingActs,
          writeoffActs,
          employees,
          clients,
          loyalty,
        ] = await Promise.all([
          canViewOrders ? browserBackendJson<ReportsData["orders"]>("/api/v1/orders", { method: "GET" }) : Promise.resolve([]),
          canViewCatalog ? browserBackendJson<ReportsData["catalogItems"]>("/api/v1/catalog", { method: "GET" }) : Promise.resolve([]),
          canViewInventory ? browserBackendJson<ReportsData["products"]>("/api/v1/inventory/products", { method: "GET" }) : Promise.resolve([]),
          canViewInventory ? browserBackendJson<ReportsData["techCards"]>("/api/v1/tech-cards", { method: "GET" }) : Promise.resolve([]),
          canViewInventory ? browserBackendJson<ReportsData["incomingActs"]>("/api/v1/inventory/incoming-acts", { method: "GET" }) : Promise.resolve([]),
          canViewInventory ? browserBackendJson<ReportsData["writeoffActs"]>("/api/v1/inventory/writeoff-acts", { method: "GET" }) : Promise.resolve([]),
          canViewEmployees ? browserBackendJson<ReportsData["employees"]>("/api/v1/employees", { method: "GET" }) : Promise.resolve([]),
          canViewClients ? browserBackendJson<ReportsData["clients"]>("/api/v1/clients", { method: "GET" }) : Promise.resolve([]),
          browserBackendJson<ReportsData["loyalty"]>("/api/v1/loyalty", { method: "GET" }).catch(() => null),
        ]);

        if (isActive) {
          setData({
            orders,
            catalogItems,
            products,
            techCards,
            incomingActs,
            writeoffActs,
            employees,
            clients,
            loyalty,
          });
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(error instanceof Error ? error.message : "Не удалось загрузить отчеты");
          setData(EMPTY_REPORTS_DATA);
        }
      }
    }

    void loadReports();

    return () => {
      isActive = false;
    };
  }, [canViewCatalog, canViewClients, canViewEmployees, canViewInventory, canViewOrders]);

  if (!data) {
    return (
      <PageShell
        title="Отчеты"
        description="Сводка по заказам, складу, сотрудникам и клиентской активности."
      >
        <div className="foodlike-frame space-y-3 p-4 sm:p-5">
          <div className="h-32 animate-pulse rounded-[22px] border border-red-100 bg-white/75" />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-[18px] border border-red-100 bg-white/75" />
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <>
      {errorMessage ? (
        <div className="mb-3 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {errorMessage}
        </div>
      ) : null}
      <ReportsPage
        period={period}
        date={date}
        month={month}
        {...data}
      />
    </>
  );
}
