import { describe, it, expect } from "vitest";
import { generateToken, hashToken } from "@/lib/token";

describe("generateToken", () => {
  it("returns a raw token and its sha256 hash", () => {
    const { raw, hashed } = generateToken();
    expect(raw).toHaveLength(64); // 32 bytes as hex
    expect(hashed).toHaveLength(64); // sha256 as hex
    expect(raw).not.toBe(hashed);
  });

  it("generates unique tokens on each call", () => {
    const a = generateToken();
    const b = generateToken();
    expect(a.raw).not.toBe(b.raw);
  });
});

describe("hashToken", () => {
  it("produces the same hash as generateToken for the same raw value", () => {
    const { raw, hashed } = generateToken();
    expect(hashToken(raw)).toBe(hashed);
  });

  it("is deterministic", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
  });

  it("produces different hashes for different inputs", () => {
    expect(hashToken("abc")).not.toBe(hashToken("xyz"));
  });
});
