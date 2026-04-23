import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasPermission, type AuthPermission } from "@/modules/auth/authz";
import {
  getUserRoleLabel,
  normalizeUserRole,
} from "@/modules/auth/auth.types";
import { getRequiredEnv } from "@/shared/config/env";
import { pool } from "@/shared/db/pool";
import type { SessionUser } from "@/modules/auth/auth.types";

const SESSION_COOKIE_NAME = "food_crm_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

type SessionPayload = {
  userId: number;
  email: string;
  role: string;
  expiresAt: number;
};

function sign(payload: string) {
  return createHmac("sha256", getRequiredEnv("SESSION_SECRET"))
    .update(payload)
    .digest("hex");
}

function encode(payload: SessionPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function decode(value: string): SessionPayload | null {
  const [encodedPayload, signature] = value.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (payload.expiresAt <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser) {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const cookieStore = await cookies();
  const normalizedRole = normalizeUserRole(user.role) ?? "Курьер";

  cookieStore.set(SESSION_COOKIE_NAME, encode({
    userId: user.id,
    email: user.email,
    role: normalizedRole,
    expiresAt,
  }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    expires: new Date(expiresAt),
    priority: "high",
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawCookie) {
    return null;
  }

  const payload = decode(rawCookie);

  if (!payload) {
    return null;
  }

  const userResult = await pool.query<{ email: string; role: string }>(
    `
      SELECT "email", "role"
      FROM "User"
      WHERE "id" = $1
      LIMIT 1
    `,
    [payload.userId],
  ).catch(() => ({ rows: [] as Array<{ email: string; role: string }> }));

  const persistedUser = userResult.rows[0];
  const resolvedEmail = persistedUser?.email?.trim() || payload.email;
  const role =
    normalizeUserRole(persistedUser?.role) ??
    normalizeUserRole(payload.role);

  if (!role || !resolvedEmail) {
    return null;
  }

  const employeeResult = await pool.query<{ name: string }>(
    `
      SELECT "name"
      FROM "Employee"
      WHERE LOWER("email") = LOWER($1)
      LIMIT 1
    `,
    [resolvedEmail],
  ).catch(() => ({ rows: [] as Array<{ name: string }> }));

  const displayName = employeeResult.rows[0]?.name ?? getUserRoleLabel(role);

  return {
    id: payload.userId,
    email: resolvedEmail,
    role,
    displayName,
  };
}

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requirePermission(
  permission: AuthPermission,
  redirectTo = "/",
) {
  const user = await requireSessionUser();

  if (!hasPermission(user, permission)) {
    redirect(redirectTo);
  }

  return user;
}
