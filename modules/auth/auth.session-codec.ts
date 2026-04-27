import { createHmac, timingSafeEqual } from "node:crypto";
import { getRequiredEnv } from "@/shared/config/env";

export const SESSION_COOKIE_NAME = "food_crm_session";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

export type SessionPayload = {
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

export function encodeSessionPayload(payload: SessionPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function decodeSessionCookie(value: string): SessionPayload | null {
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
