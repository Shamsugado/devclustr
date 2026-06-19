import { vi, describe, it, expect } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/items", () => ({ updateItem: vi.fn() }));

const { UpdateItemSchema, updateItem } = await import("@/actions/items");
const { auth } = await import("@/auth");
const { updateItem: updateItemInDb } = await import("@/lib/db/items");

const base = {
  title: "My Snippet",
  description: "A description",
  content: "console.log('hello')",
  url: null,
  language: "typescript",
  tags: ["react", "hooks"],
};

describe("UpdateItemSchema", () => {
  describe("title", () => {
    it("accepts a non-empty title", () => {
      expect(UpdateItemSchema.safeParse(base).success).toBe(true);
    });

    it("rejects an empty title", () => {
      const result = UpdateItemSchema.safeParse({ ...base, title: "" });
      expect(result.success).toBe(false);
    });

    it("rejects a whitespace-only title after trim", () => {
      const result = UpdateItemSchema.safeParse({ ...base, title: "   " });
      expect(result.success).toBe(false);
    });

    it("trims whitespace from a valid title", () => {
      const result = UpdateItemSchema.safeParse({ ...base, title: "  hello  " });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.title).toBe("hello");
    });
  });

  describe("url", () => {
    it("accepts null url (non-link items)", () => {
      expect(UpdateItemSchema.safeParse({ ...base, url: null }).success).toBe(true);
    });

    it("accepts a valid https url", () => {
      expect(UpdateItemSchema.safeParse({ ...base, url: "https://example.com" }).success).toBe(true);
    });

    it("rejects an invalid url string", () => {
      const result = UpdateItemSchema.safeParse({ ...base, url: "not-a-url" });
      expect(result.success).toBe(false);
    });

    it("rejects an empty string url", () => {
      const result = UpdateItemSchema.safeParse({ ...base, url: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("tags", () => {
    it("accepts an empty tags array", () => {
      expect(UpdateItemSchema.safeParse({ ...base, tags: [] }).success).toBe(true);
    });

    it("trims whitespace from tag values", () => {
      const result = UpdateItemSchema.safeParse({ ...base, tags: ["  react  "] });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.tags[0]).toBe("react");
    });

    it("rejects tags that are empty after trim", () => {
      const result = UpdateItemSchema.safeParse({ ...base, tags: ["   "] });
      expect(result.success).toBe(false);
    });
  });

  describe("nullable fields", () => {
    it("accepts null for description, content, language", () => {
      const result = UpdateItemSchema.safeParse({
        ...base,
        description: null,
        content: null,
        language: null,
      });
      expect(result.success).toBe(true);
    });

    it("trims description and language", () => {
      const result = UpdateItemSchema.safeParse({
        ...base,
        description: "  desc  ",
        language: "  ts  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe("desc");
        expect(result.data.language).toBe("ts");
      }
    });
  });
});

describe("updateItem action", () => {
  it("returns Unauthorized when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);
    const result = await updateItem("item-1", base);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns field errors when Zod validation fails", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "user-1" } } as never);
    const result = await updateItem("item-1", { ...base, title: "" });
    expect(result.success).toBe(false);
    if (!result.success && typeof result.error === "object") {
      expect(result.error).toHaveProperty("title");
    }
  });

  it("returns updated item on success", async () => {
    const fakeItem = { id: "item-1", title: "My Snippet" };
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "user-1" } } as never);
    vi.mocked(updateItemInDb).mockResolvedValueOnce(fakeItem as never);
    const result = await updateItem("item-1", base);
    expect(result).toEqual({ success: true, data: fakeItem });
  });

  it("returns error string when DB throws", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "user-1" } } as never);
    vi.mocked(updateItemInDb).mockRejectedValueOnce(new Error("DB error"));
    const result = await updateItem("item-1", base);
    expect(result).toEqual({ success: false, error: "Failed to update item" });
  });
});
