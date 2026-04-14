import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const HASH_PREFIX = "scrypt";
const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

function buildScryptHash(password: string, salt: string) {
  return scryptSync(password, salt, KEY_LENGTH).toString("hex");
}

export function hashPassword(password: string) {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const hash = buildScryptHash(password, salt);

  return `${HASH_PREFIX}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedValue: string) {
  if (!storedValue.startsWith(`${HASH_PREFIX}$`)) {
    return storedValue === password;
  }

  const [, salt, storedHash] = storedValue.split("$");

  if (!salt || !storedHash) {
    return false;
  }

  const candidateHash = buildScryptHash(password, salt);
  const storedBuffer = Buffer.from(storedHash, "hex");
  const candidateBuffer = Buffer.from(candidateHash, "hex");

  if (storedBuffer.length !== candidateBuffer.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, candidateBuffer);
}
