export type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";

export type OrderListItem = {
  id: number;
  status: OrderStatus;
  clientId: number;
  clientName: string;
  clientType: "CLIENT" | "ORGANIZATION";
  employeeId: number;
  employeeName: string;
  totalCents: number;
  createdAt: string;
};
