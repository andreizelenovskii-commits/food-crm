import { describe, expect, it } from "vitest";
import {
  canAdvanceOrder,
  canCancelOrder,
  canViewKitchenQueue,
  getOrderAdvanceAction,
} from "@/modules/orders/orders.workflow";

describe("order role workflow", () => {
  it("lets cooks finish kitchen orders only", () => {
    expect(canViewKitchenQueue("Повар")).toBe(true);
    expect(canAdvanceOrder("SENT_TO_KITCHEN", "Повар")).toBe(true);
    expect(getOrderAdvanceAction("SENT_TO_KITCHEN", "Повар")).toEqual({
      status: "READY",
      label: "Заказ готов",
    });
    expect(canCancelOrder("SENT_TO_KITCHEN", "Повар")).toBe(false);
    expect(canAdvanceOrder("READY", "Повар")).toBe(false);
  });

  it("keeps dispatcher out of kitchen-only transitions", () => {
    expect(canViewKitchenQueue("Диспетчер")).toBe(false);
    expect(canAdvanceOrder("SENT_TO_KITCHEN", "Диспетчер")).toBe(false);
    expect(canCancelOrder("SENT_TO_KITCHEN", "Диспетчер")).toBe(true);
  });
});
