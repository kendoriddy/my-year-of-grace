import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function generatePublicId(): string {
  return nanoid(10);
}

export function generateManageToken(): string {
  return randomBytes(32).toString("hex");
}

export async function hashManageToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

export async function verifyManageToken(
  token: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(token, hash);
}

export function hashContent(content: string): string {
  return createHash("sha256")
    .update(content.trim().toLowerCase())
    .digest("hex");
}

export function hashIp(ip: string): string {
  return hashValue(`${ip}:myyearofgrace`);
}
