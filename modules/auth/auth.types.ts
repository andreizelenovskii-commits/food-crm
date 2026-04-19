export const USER_ROLES = [
  "admin",
  "Управляющий",
  "Диспетчер",
  "Повар",
  "Курьер",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "Управляющий",
  "Управляющий": "Управляющий",
  "Диспетчер": "Диспетчер",
  "Повар": "Повар",
  "Курьер": "Курьер",
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: number;
  email: string;
  passwordHash: string;
  role: UserRole;
};

export type SessionUser = {
  id: number;
  email: string;
  role: UserRole;
  displayName?: string | null;
};
