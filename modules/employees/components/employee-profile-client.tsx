"use client";

import Link from "next/link";
import { useState } from "react";
import { EmployeeAdjustmentForm } from "@/modules/employees/components/employee-adjustment-form";
import { EMPLOYEE_ADJUSTMENT_LABELS, type EmployeeProfile, type EmployeeAdjustment, type EmployeeAdjustmentType } from "@/modules/employees/employees.types";

function formatMoney(cents: number) {
  return `${(cents / 100).toFixed(2).replace(".00", "")} ₽`;
}

type Tab = 'general' | 'advances' | 'fines' | 'debts';

export function EmployeeProfileClient({ employee }: { employee: EmployeeProfile }) {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const tabs = [
    { id: 'general' as Tab, label: 'Общая информация' },
    { id: 'advances' as Tab, label: 'Авансы' },
    { id: 'fines' as Tab, label: 'Штрафы' },
    { id: 'debts' as Tab, label: 'Долги' },
  ];

  const filteredAdjustments = employee.adjustments.filter((adj: EmployeeAdjustment) => {
    switch (activeTab) {
      case 'advances': return adj.type === 'ADVANCE';
      case 'fines': return adj.type === 'FINE';
      case 'debts': return adj.type === 'DEBT';
      default: return false;
    }
  });

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-zinc-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'border-b-2 border-zinc-950 text-zinc-950'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_0.7fr]">
          <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <h2 className="text-xl font-semibold text-zinc-950">Контакты</h2>
            <div className="mt-4 space-y-3 text-sm text-zinc-700">
              <p>
                <span className="font-medium text-zinc-900">Роль:</span> {employee.role}
              </p>
              <p>
                <span className="font-medium text-zinc-900">Телефон:</span> {employee.phone || "Не указан"}
              </p>
              <p>
                <span className="font-medium text-zinc-900">Мессенджер:</span>{" "}
                {employee.messenger ? (
                  <a
                    href={employee.messenger}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    {employee.messenger}
                  </a>
                ) : (
                  "Не указан"
                )}
              </p>
              <p>
                <span className="font-medium text-zinc-900">Дата создания:</span> {new Date(employee.createdAt).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium text-zinc-900">График работы:</span> {employee.schedule ? JSON.stringify(employee.schedule, null, 2) : "Не указан"}
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <h2 className="text-xl font-semibold text-zinc-950">Показатели</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Авансы за месяц</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(employee.advancesCents)}</p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Штрафы</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(employee.finesCents)}</p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Долги</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(employee.debtCents)}</p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Часы работы</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{employee.monthlyHours ?? "Не рассчитано"}</p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">КПД</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{employee.kpd}%</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'general' && (
        <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
          <h2 className="text-xl font-semibold text-zinc-950">Рабочие результаты</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Заказы за месяц</p>
              <p className="mt-3 text-2xl font-semibold text-zinc-950">{employee.ordersThisMonth}</p>
            </div>
            <div className="rounded-3xl bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Зарплата на сегодня</p>
              <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(employee.salaryTodayCents)}</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-zinc-600">
            Показатели пока считаются как заглушка. Логику расчёта можно подключить позже.
          </p>
        </section>
      )}

      {(activeTab === 'advances' || activeTab === 'fines' || activeTab === 'debts') && (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <h2 className="text-xl font-semibold text-zinc-950">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <div className="mt-5 space-y-4">
              {filteredAdjustments.length === 0 ? (
                <p className="text-sm text-zinc-600">Пока нет записей.</p>
              ) : (
                <div className="space-y-4">
                  {filteredAdjustments.map((adjustment: EmployeeAdjustment) => (
                    <div key={adjustment.id} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-zinc-950">{EMPLOYEE_ADJUSTMENT_LABELS[adjustment.type]}</p>
                        <p className="text-sm text-zinc-700">{new Date(adjustment.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="mt-1 text-sm text-zinc-600">{adjustment.comment || "Без комментария"}</p>
                      <p className="mt-3 text-xl font-semibold text-zinc-950">{formatMoney(adjustment.amountCents)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <div>
            <EmployeeAdjustmentForm
              employeeId={employee.id}
              defaultType={activeTab === 'advances' ? 'ADVANCE' : activeTab === 'fines' ? 'FINE' : 'DEBT'}
            />
          </div>
        </div>
      )}
    </div>
  );
}