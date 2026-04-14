import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRequiredEnv } from "@/shared/config/env";
import type { SessionUser } from "@/modules/auth/auth.types";

const SESSION_COOKIE_NAME = "food_crm_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: number;
  email: string;
  role: SessionUser["role"];
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

  cookieStore.set(SESSION_COOKIE_NAME, encode({
    userId: user.id,
    email: user.email,
    role: user.role,
    expiresAt,
  }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt),
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
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
  };
}

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
