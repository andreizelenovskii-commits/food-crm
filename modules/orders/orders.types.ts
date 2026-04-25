export type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";

export const ORDER_STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"] as const;

export type OrderDraftItem = {
  catalogItemId: number;
  quantity: number;
};

export type OrderListItem = {
  id: number;
  status: OrderStatus;
  isInternal: boolean;
  clientId: number;
  clientName: string;
  clientType: "CLIENT" | "ORGANIZATION";
  employeeId: number;
  employeeName: string;
  subtotalCents: number;
  discountPercent: number;
  totalCents: number;
  createdAt: string;
};

export type OrderCreateInput = {
  clientId: number;
  employeeId: number;
  isInternal: boolean;
  status: OrderStatus;
  items: OrderDraftItem[];
};
