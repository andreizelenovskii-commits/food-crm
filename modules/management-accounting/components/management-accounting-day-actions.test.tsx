import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ManagementAccountingDayActions } from "@/modules/management-accounting/components/management-accounting-day-actions";
import type { ManagementAccountingDay } from "@/modules/management-accounting/management-accounting.types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("@/modules/management-accounting/management-accounting.actions", () => ({
  closeManagementAccountingDay: vi.fn(async () => undefined),
  reopenManagementAccountingDay: vi.fn(async () => undefined),
  startManagementAccountingDay: vi.fn(async () => undefined),
}));

function buildDay(overrides: Partial<ManagementAccountingDay>): ManagementAccountingDay {
  return {
    id: 1,
    date: "2026-06-28",
    status: "OPEN",
    openedAt: "2026-06-28T08:00:00.000Z",
    closedAt: null,
    canStart: false,
    canEdit: true,
    canClose: true,
    canReopen: false,
    ...overrides,
  };
}

describe("ManagementAccountingDayActions", () => {
  it("opens the close confirmation for an open accounting day", async () => {
    const user = userEvent.setup();

    render(<ManagementAccountingDayActions day={buildDay({})} date="2026-06-28" />);

    await user.click(screen.getByRole("button", { name: "Закрыть управленческий учет за смену" }));

    expect(screen.getByRole("dialog", { name: "Закрыть учет и зафиксировать статистику?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Закрыть и сохранить" })).toBeInTheDocument();
  });

  it("offers reopening only for a closed accounting day", async () => {
    const user = userEvent.setup();

    render(
      <ManagementAccountingDayActions
        day={buildDay({
          status: "CLOSED",
          closedAt: "2026-06-28T20:00:00.000Z",
          canEdit: false,
          canClose: false,
          canReopen: true,
        })}
        date="2026-06-28"
      />,
    );

    expect(screen.queryByRole("button", { name: "Закрыть управленческий учет за смену" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Открыть для корректировки" }));

    expect(screen.getByRole("dialog", { name: "Открыть закрытый учет для корректировки?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Открыть для правок" })).toBeInTheDocument();
  });
});
