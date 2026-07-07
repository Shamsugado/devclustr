import { vi, describe, it, expect } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ isAiRateLimited: vi.fn().mockResolvedValue(false) }));

const responsesCreate = vi.fn();
vi.mock("@/lib/openai", () => ({ getOpenAI: () => ({ responses: { create: responsesCreate } }) }));

const {
  GenerateAutoTagsSchema,
  AutoTagResultSchema,
  GenerateAutoSummarySchema,
  AutoSummaryResultSchema,
  ExplainCodeSchema,
  ExplainCodeResultSchema,
} = await import("@/actions/ai-schemas");
const { generateAutoTags, generateAutoSummary, explainCode } = await import("@/actions/ai");
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

const summaryInput = {
  title: "My Snippet",
  content: "console.log('hello')",
  url: null,
  language: "typescript",
  fileName: null,
};

describe("GenerateAutoSummarySchema", () => {
  it("accepts a valid request", () => {
    expect(GenerateAutoSummarySchema.safeParse(summaryInput).success).toBe(true);
  });

  it("accepts null content, url, language, and fileName", () => {
    const result = GenerateAutoSummarySchema.safeParse({
      title: "Title",
      content: null,
      url: null,
      language: null,
      fileName: null,
    });
    expect(result.success).toBe(true);
  });

  it("trims the title", () => {
    const result = GenerateAutoSummarySchema.safeParse({ ...summaryInput, title: "  hi  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.title).toBe("hi");
  });
});

describe("AutoSummaryResultSchema", () => {
  it("accepts a non-empty string", () => {
    expect(AutoSummaryResultSchema.safeParse("A short summary.").success).toBe(true);
  });

  it("rejects an empty string", () => {
    expect(AutoSummaryResultSchema.safeParse("").success).toBe(false);
  });

  it("rejects a non-string value", () => {
    expect(AutoSummaryResultSchema.safeParse(["not", "a", "string"]).success).toBe(false);
  });

  it("rejects a string over 500 characters", () => {
    expect(AutoSummaryResultSchema.safeParse("a".repeat(501)).success).toBe(false);
  });
});

describe("generateAutoSummary", () => {
  it("returns an error when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);
    const result = await generateAutoSummary(summaryInput);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Unauthorized");
  });

  it("returns an error for a free-tier user", async () => {
    vi.mocked(auth).mockResolvedValueOnce(freeSession as never);
    const result = await generateAutoSummary(summaryInput);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/Pro subscription/);
  });

  it("returns an error when title, content, url, and fileName are all empty", async () => {
    vi.mocked(auth).mockResolvedValueOnce(proSession as never);
    const result = await generateAutoSummary({
      title: "  ",
      content: "  ",
      url: null,
      language: null,
      fileName: null,
    });
    expect(result.success).toBe(false);
  });

  it("returns an error when rate limited", async () => {
    vi.mocked(auth).mockResolvedValueOnce(proSession as never);
    vi.mocked(isAiRateLimited).mockResolvedValueOnce(true);
    const result = await generateAutoSummary(summaryInput);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/Too many/);
  });

  it("parses a {summary: ...} response", async () => {
    vi.mocked(auth).mockResolvedValueOnce(proSession as never);
    responsesCreate.mockResolvedValueOnce({ output_text: '{"summary": "A helper snippet."}' });
    const result = await generateAutoSummary(summaryInput);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("A helper snippet.");
  });

  it("parses a bare string response", async () => {
    vi.mocked(auth).mockResolvedValueOnce(proSession as never);
    responsesCreate.mockResolvedValueOnce({ output_text: '"A helper snippet."' });
    const result = await generateAutoSummary(summaryInput);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("A helper snippet.");
  });

  it("returns an error when the AI response fails schema validation", async () => {
    vi.mocked(auth).mockResolvedValueOnce(proSession as never);
    responsesCreate.mockResolvedValueOnce({ output_text: '{"summary": ""}' });
    const result = await generateAutoSummary(summaryInput);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/unexpected format/);
  });

  it("returns an error when the OpenAI call throws", async () => {
    vi.mocked(auth).mockResolvedValueOnce(proSession as never);
    responsesCreate.mockRejectedValueOnce(new Error("network error"));
    const result = await generateAutoSummary(summaryInput);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/Failed to generate/);
  });
});

const explainInput = {
  content: "console.log('hello')",
  language: "typescript",
};

describe("ExplainCodeSchema", () => {
  it("accepts a valid request", () => {
    expect(ExplainCodeSchema.safeParse(explainInput).success).toBe(true);
  });

  it("accepts a null language", () => {
    const result = ExplainCodeSchema.safeParse({ content: "echo hi", language: null });
    expect(result.success).toBe(true);
  });
});

describe("ExplainCodeResultSchema", () => {
  it("accepts a non-empty string", () => {
    expect(ExplainCodeResultSchema.safeParse("This code logs hello.").success).toBe(true);
  });

  it("rejects an empty string", () => {
    expect(ExplainCodeResultSchema.safeParse("").success).toBe(false);
  });

  it("rejects a non-string value", () => {
    expect(ExplainCodeResultSchema.safeParse(["not", "a", "string"]).success).toBe(false);
  });

  it("rejects a string over 3000 characters", () => {
    expect(ExplainCodeResultSchema.safeParse("a".repeat(3001)).success).toBe(false);
  });
});

describe("explainCode", () => {
  it("returns an error when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);
    const result = await explainCode(explainInput);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Unauthorized");
  });

  it("returns an error for a free-tier user", async () => {
    vi.mocked(auth).mockResolvedValueOnce(freeSession as never);
    const result = await explainCode(explainInput);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/Pro subscription/);
  });

  it("returns an error when content is empty", async () => {
    vi.mocked(auth).mockResolvedValueOnce(proSession as never);
    const result = await explainCode({ content: "   ", language: null });
    expect(result.success).toBe(false);
  });

  it("returns an error when rate limited", async () => {
    vi.mocked(auth).mockResolvedValueOnce(proSession as never);
    vi.mocked(isAiRateLimited).mockResolvedValueOnce(true);
    const result = await explainCode(explainInput);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/Too many/);
  });

  it("parses a {explanation: ...} response", async () => {
    vi.mocked(auth).mockResolvedValueOnce(proSession as never);
    responsesCreate.mockResolvedValueOnce({ output_text: '{"explanation": "This logs hello to the console."}' });
    const result = await explainCode(explainInput);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("This logs hello to the console.");
  });

  it("parses a bare string response", async () => {
    vi.mocked(auth).mockResolvedValueOnce(proSession as never);
    responsesCreate.mockResolvedValueOnce({ output_text: '"This logs hello to the console."' });
    const result = await explainCode(explainInput);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("This logs hello to the console.");
  });

  it("returns an error when the AI response fails schema validation", async () => {
    vi.mocked(auth).mockResolvedValueOnce(proSession as never);
    responsesCreate.mockResolvedValueOnce({ output_text: '{"explanation": ""}' });
    const result = await explainCode(explainInput);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/unexpected format/);
  });

  it("returns an error when the OpenAI call throws", async () => {
    vi.mocked(auth).mockResolvedValueOnce(proSession as never);
    responsesCreate.mockRejectedValueOnce(new Error("network error"));
    const result = await explainCode(explainInput);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/Failed to generate/);
  });
});
