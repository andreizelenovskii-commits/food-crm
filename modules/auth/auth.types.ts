export const USER_ROLES = ["admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

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
};
