export type OrderStatus =
  | "NEW"
  | "SENT_TO_KITCHEN"
  | "READY"
  | "PACKED"
  | "DELIVERED_PAID"
  | "CANCELLED";

export const ORDER_STATUSES = [
  "NEW",
  "SENT_TO_KITCHEN",
  "READY",
  "PACKED",
  "DELIVERED_PAID",
  "CANCELLED",
] as const;

export type OrderSource = "SITE" | "PHONE" | "ADMIN";

export const ORDER_SOURCE_LABELS: Record<OrderSource, string> = {
  SITE: "Сайт",
  PHONE: "Телефон",
  ADMIN: "Админ",
};

export type OrderDraftItem = {
  catalogItemId: number;
  catalogItemVariantId?: number;
  excludedIngredientIds?: number[];
  quantity: number;
};

export type KitchenZone = "pizza" | "rolls" | "fastfood" | "dispatch";

export type OrderPackagingUsage = {
  id: number;
  orderItemId: number;
  unitIndex: number;
  packageProductId: number;
  packageProductName: string;
  kitchenZone: KitchenZone;
  createdAt: string;
};

export type OrderItemExcludedIngredient = {
  id: number;
  productId: number;
  label: string;
};

export type OrderItemSummary = {
  id: number;
  catalogItemId: number | null;
  catalogItemVariantId: number | null;
  itemName: string;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
  catalogCategory: string | null;
  kitchenZone: KitchenZone | null;
  kitchenZones: KitchenZone[];
  excludedIngredients: OrderItemExcludedIngredient[];
  packagingUsages: OrderPackagingUsage[];
};

export type KitchenOrderItemSummary = Pick<
  OrderItemSummary,
  | "id"
  | "catalogItemId"
  | "catalogItemVariantId"
  | "itemName"
  | "quantity"
  | "catalogCategory"
  | "kitchenZone"
  | "kitchenZones"
  | "excludedIngredients"
  | "packagingUsages"
>;

export type OrderListItem = {
  id: number;
  status: OrderStatus;
  shiftId: number | null;
  source: OrderSource;
  isInternal: boolean;
  clientId: number | null;
  clientName: string;
  clientType: "CLIENT" | "ORGANIZATION";
  employeeId: number;
  employeeName: string;
  customerPhoneSnapshot: string | null;
  deliveryAddressSnapshot: string | null;
  customerComment: string | null;
  subtotalCents: number;
  discountPercent: number;
  totalCents: number;
  createdAt: string;
  items: OrderItemSummary[];
};

export type KitchenOrderListItem = Pick<
  OrderListItem,
  | "id"
  | "status"
  | "source"
  | "isInternal"
  | "employeeId"
  | "employeeName"
  | "customerComment"
  | "createdAt"
> & {
  items: KitchenOrderItemSummary[];
};

export type OrderCreateInput = {
  clientId: number;
  employeeId: number;
  isInternal: boolean;
  status: OrderStatus;
  shiftId?: number | null;
  source: OrderSource;
  deliveryFeeCents: number;
  items: OrderDraftItem[];
};

export type DispatcherShiftDto = {
  id: number;
  number: number;
  displayNumber: string;
  businessDate: string;
  status: "OPEN" | "CLOSED";
  timeZone: string;
  openedAt: string;
  closedAt: string | null;
  responsibleName: string;
  closedByName: string | null;
  openedByUserId: number;
  closedByUserId: number | null;
  checksCount: number;
  revenueCents: number;
  cancelledOrdersCount: number;
  totalOrdersCount: number;
  activeOrdersCount: number;
};

export type DispatcherWorkspace = {
  clock: {
    serverNow: string;
    businessDate: string;
    businessTimeZone: string;
  };
  shift: {
    state: "NOT_OPEN" | "OPEN" | "CLOSED" | "PREVIOUS_SHIFT_OPEN";
    id: number | null;
    number: number | null;
    displayNumber: string | null;
    businessDate: string;
    openedAt: string | null;
    closedAt: string | null;
    responsibleName: string | null;
    closedByName: string | null;
    canOpen: boolean;
    canClose: boolean;
    openAvailableAt: string;
    closeAvailableAt: string;
    activeOrdersCount: number;
    checksCount: number;
    revenueCents: number;
    cancelledOrdersCount: number;
    previousShift?: DispatcherShiftDto;
  };
  orderGroups: {
    new: OrderListItem[];
    inProgress: OrderListItem[];
    completed: OrderListItem[];
  };
  counts: {
    new: number;
    inProgress: number;
    completed: number;
  };
  capabilities: {
    canCreateOrder: boolean;
    canOpenShift: boolean;
    canCloseShift: boolean;
    canCancelOrder: boolean;
    canDeleteOrder: boolean;
  };
};

export type PublicOrderingStatus = {
  acceptingOrders: boolean;
  reason: "SHIFT_CLOSED" | "SHIFT_NOT_OPEN" | null;
  businessDate: string;
  businessTimeZone: string;
  serverNow: string;
  nextOpenNotBefore: string;
  message: string;
};
