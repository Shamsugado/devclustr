import { vi, describe, it, expect } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ isAiRateLimited: vi.fn().mockResolvedValue(false) }));

const responsesCreate = vi.fn();
vi.mock("@/lib/openai", () => ({ getOpenAI: () => ({ responses: { create: responsesCreate } }) }));

const { GenerateAutoTagsSchema, AutoTagResultSchema } = await import("@/actions/ai-schemas");
const { generateAutoTags } = await import("@/actions/ai");
const { auth } = await import("@/auth");
const { isAiRateLimited } = await import("@/lib/rate-limit");

const proSession = { user: { id: "user-1", isPro: true } };
const freeSession = { user: { id: "user-1", isPro: false } };

const input = {
  title: "My Snippet",
  description: "A description",
  content: "console.log('hello')",
};

describe("GenerateAutoTagsSchema", () => {
  it("accepts a valid request", () => {
    expect(GenerateAutoTagsSchema.safeParse(input).success).toBe(true);
  });

  it("accepts null description and content", () => {
    const result = GenerateAutoTagsSchema.safeParse({ title: "Title", description: null, content: null });
    expect(result.success).toBe(true);
  });

  it("trims the title", () => {
    const result = GenerateAutoTagsSchema.safeParse({ ...input, title: "  hi  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.title).toBe("hi");
  });
});

describe("AutoTagResultSchema", () => {
  it("accepts an array of non-empty strings", () => {
    expect(AutoTagResultSchema.safeParse(["react", "typescript"]).success).toBe(true);
  });

  it("rejects a non-array value", () => {
    expect(AutoTagResultSchema.safeParse({ tags: ["react"] }).success).toBe(false);
  });

  it("rejects empty string entries", () => {
    expect(AutoTagResultSchema.safeParse(["react", ""]).success).toBe(false);
  });

  it("rejects more than 10 tags", () => {
    const tooMany = Array.from({ length: 11 }, (_, i) => `tag${i}`);
    expect(AutoTagResultSchema.safeParse(tooMany).success).toBe(false);
  });
});

describe("generateAutoTags", () => {
  it("returns an error when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);
    const result = await generateAutoTags(input);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Unauthorized");
  });

  it("returns an error for a free-tier user", async () => {
    vi.mocked(auth).mockResolvedValueOnce(freeSession as never);
    const result = await generateAutoTags(input);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/Pro subscription/);
  });

  it("returns an error when title, description, and content are all empty", async () => {
    vi.mocked(auth).mockResolvedValueOnce(proSession as never);
    const result = await generateAutoTags({ title: "  ", description: null, content: "  " });
    expect(result.success).toBe(false);
  });

  it("returns an error when rate limited", async () => {
    vi.mocked(auth).mockResolvedValueOnce(proSession as never);
    vi.mocked(isAiRateLimited).mockResolvedValueOnce(true);
    const result = await generateAutoTags(input);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/Too many/);
  });

  it("parses a {tags: [...]} response and lowercases tags", async () => {
    vi.mocked(auth).mockResolvedValueOnce(proSession as never);
    responsesCreate.mockResolvedValueOnce({ output_text: '{"tags": ["React", "TypeScript"]}' });
    const result = await generateAutoTags(input);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual(["react", "typescript"]);
  });

  it("parses a bare array response", async () => {
    vi.mocked(auth).mockResolvedValueOnce(proSession as never);
    responsesCreate.mockResolvedValueOnce({ output_text: '["node", "cli"]' });
    const result = await generateAutoTags(input);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual(["node", "cli"]);
  });

  it("dedupes tags after lowercasing", async () => {
    vi.mocked(auth).mockResolvedValueOnce(proSession as never);
    responsesCreate.mockResolvedValueOnce({ output_text: '["React", "react"]' });
    const result = await generateAutoTags(input);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual(["react"]);
  });

  it("returns an error when the AI response fails schema validation", async () => {
    vi.mocked(auth).mockResolvedValueOnce(proSession as never);
    responsesCreate.mockResolvedValueOnce({ output_text: '{"tags": [123]}' });
    const result = await generateAutoTags(input);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/unexpected format/);
  });

  it("returns an error when the OpenAI call throws", async () => {
    vi.mocked(auth).mockResolvedValueOnce(proSession as never);
    responsesCreate.mockRejectedValueOnce(new Error("network error"));
    const result = await generateAutoTags(input);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/Failed to generate/);
  });
});
