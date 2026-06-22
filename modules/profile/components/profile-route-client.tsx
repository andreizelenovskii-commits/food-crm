"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { useEmployeeSession } from "@/modules/auth/components/employee-session-provider";
import { EmployeeSelfProfilePage } from "@/modules/profile/components/profile-page";
import type { Employee, EmployeeProfile } from "@/modules/employees/employees.types";
import { formatRuMobileLoginDigits, isValidRuMobileDigits, normalizeRuPhoneDigits } from "@/shared/phone";
import { browserBackendJson } from "@/shared/api/browser-backend";

function employeeMatchesLoginPhone(
  employeePhone: string | null | undefined,
  loginDigits: string,
) {
  if (!isValidRuMobileDigits(loginDigits)) {
    return false;
  }

  const employeeDigits = normalizeRuPhoneDigits(String(employeePhone ?? ""));

  return isValidRuMobileDigits(employeeDigits) && employeeDigits === loginDigits;
}

export function ProfileRouteClient({ month }: { month: string }) {
  const { user } = useEmployeeSession();
  const loginPhone = useMemo(() => user?.phone ?? "", [user?.phone]);
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [isMissingCard, setIsMissingCard] = useState(() => !loginPhone);
  const [isLoading, setIsLoading] = useState(() => Boolean(loginPhone));

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      setIsLoading(true);
      setIsMissingCard(false);

      try {
        const employees = await browserBackendJson<Employee[]>("/api/v1/employees", { method: "GET" });
        const currentEmployee = employees.find((item) => employeeMatchesLoginPhone(item.phone, loginPhone));

        if (!currentEmployee) {
          if (isActive) {
            setEmployee(null);
            setIsMissingCard(true);
          }
          return;
        }

        const nextEmployee = await browserBackendJson<EmployeeProfile | null>(`/api/v1/employees/${currentEmployee.id}`, {
          method: "GET",
        });

        if (isActive) {
          setEmployee(nextEmployee);
          setIsMissingCard(!nextEmployee);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    if (!loginPhone) {
      return () => {
        isActive = false;
      };
    }

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, [loginPhone]);

  if (isLoading) {
    return (
      <PageShell title="Мой профиль">
        <section className="rounded-[16px] border border-red-950/10 bg-white/90 p-4 shadow-sm shadow-red-950/5">
          <div className="h-24 animate-pulse rounded-[14px] bg-red-50/70" />
        </section>
      </PageShell>
    );
  }

  if (!loginPhone || isMissingCard || !employee) {
    return (
      <PageShell title="Мой профиль">
        <section className="rounded-[16px] border border-red-950/10 bg-white/90 p-4 shadow-sm shadow-red-950/5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-red-800/75">
            Профиль сотрудника
          </p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-950">
            Карточка сотрудника не найдена
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Для этого аккаунта в разделе «Сотрудники» должна быть карточка с тем же мобильным номером, что
            и для входа. После связки здесь появятся имя и фамилия, график, зарплата, авансы, штрафы,
            долги и показатели за месяц.
          </p>
          <div className="mt-4 rounded-[14px] border border-red-950/10 bg-[#fffafa] p-3.5 text-sm text-zinc-700">
            Текущий телефон для входа:{" "}
            <span className="font-semibold text-zinc-950">
              {formatRuMobileLoginDigits(loginPhone)}
            </span>
          </div>
        </section>
      </PageShell>
    );
  }

  return <EmployeeSelfProfilePage employee={employee} month={month} />;
}
