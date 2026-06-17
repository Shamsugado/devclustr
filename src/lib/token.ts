import { createHash, randomBytes } from "crypto";

export function generateToken(): { raw: string; hashed: string } {
  const raw = randomBytes(32).toString("hex");
  const hashed = createHash("sha256").update(raw).digest("hex");
  return { raw, hashed };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
