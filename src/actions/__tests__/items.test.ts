import { vi, describe, it, expect } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/items", () => ({ createItem: vi.fn(), updateItem: vi.fn(), deleteItem: vi.fn(), toggleItemFavorite: vi.fn() }));

const { CreateItemSchema, UpdateItemSchema } = await import("@/actions/item-schemas");
const { createItem, updateItem, deleteItem, toggleItemFavorite } = await import("@/actions/items");
const { auth } = await import("@/auth");
const {
  createItem: createItemInDb,
  updateItem: updateItemInDb,
  deleteItem: deleteItemInDb,
  toggleItemFavorite: toggleItemFavoriteInDb,
} = await import("@/lib/db/items");

const base = {
  title: "My Snippet",
  description: "A description",
  content: "console.log('hello')",
  url: null,
  language: "typescript",
  tags: ["react", "hooks"],
  collectionIds: [] as string[],
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
    vi.mocked(auth).mockResolvedValueOnce(null as never);
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

const createBase = {
  typeId: "type-snippet",
  typeName: "snippet",
  title: "My Snippet",
  description: null as string | null,
  content: "console.log('hello')",
  url: null as string | null,
  language: "typescript",
  tags: ["react"],
  collectionIds: [] as string[],
  fileKey: null as string | null,
  fileName: null as string | null,
  fileSize: null as number | null,
};

describe("CreateItemSchema", () => {
  const schemaBase = {
    typeId: "type-snippet",
    title: "My Snippet",
    description: null,
    content: "console.log('hello')",
    url: null,
    language: "typescript",
    tags: ["react"],
  };

  it("accepts valid snippet data", () => {
    expect(CreateItemSchema.safeParse(schemaBase).success).toBe(true);
  });

  it("rejects missing typeId", () => {
    const result = CreateItemSchema.safeParse({ ...schemaBase, typeId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = CreateItemSchema.safeParse({ ...schemaBase, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects whitespace-only title after trim", () => {
    const result = CreateItemSchema.safeParse({ ...schemaBase, title: "   " });
    expect(result.success).toBe(false);
  });

  it("accepts null url for non-link types", () => {
    expect(CreateItemSchema.safeParse({ ...schemaBase, url: null }).success).toBe(true);
  });

  it("accepts a valid url", () => {
    expect(CreateItemSchema.safeParse({ ...schemaBase, url: "https://example.com" }).success).toBe(true);
  });

  it("rejects an invalid url string", () => {
    expect(CreateItemSchema.safeParse({ ...schemaBase, url: "not-a-url" }).success).toBe(false);
  });
});

describe("createItem action", () => {
  it("returns Unauthorized when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);
    const result = await createItem(createBase);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns field errors when Zod validation fails", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "user-1" } } as never);
    const result = await createItem({ ...createBase, title: "" });
    expect(result.success).toBe(false);
    if (!result.success && typeof result.error === "object") {
      expect(result.error).toHaveProperty("title");
    }
  });

  it("returns error when link type has no URL", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "user-1" } } as never);
    const result = await createItem({ ...createBase, typeName: "link", url: null });
    expect(result).toEqual({ success: false, error: "URL is required for links" });
  });

  it("returns created item on success", async () => {
    const fakeItem = { id: "item-new", title: "My Snippet" };
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "user-1" } } as never);
    vi.mocked(createItemInDb).mockResolvedValueOnce(fakeItem as never);
    const result = await createItem(createBase);
    expect(result).toEqual({ success: true, data: fakeItem });
  });

  it("returns error string when DB throws", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "user-1" } } as never);
    vi.mocked(createItemInDb).mockRejectedValueOnce(new Error("DB error"));
    const result = await createItem(createBase);
    expect(result).toEqual({ success: false, error: "Failed to create item" });
  });
});

describe("deleteItem action", () => {
  it("returns Unauthorized when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);
    const result = await deleteItem("item-1");
    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns Invalid item ID when itemId is empty string", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "user-1" } } as never);
    const result = await deleteItem("");
    expect(result).toEqual({ success: false, error: "Invalid item ID" });
  });

  it("returns success on successful deletion", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "user-1" } } as never);
    vi.mocked(deleteItemInDb).mockResolvedValueOnce(undefined as never);
    const result = await deleteItem("item_abc");
    expect(result).toEqual({ success: true });
  });

  it("returns error string when DB throws", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "user-1" } } as never);
    vi.mocked(deleteItemInDb).mockRejectedValueOnce(new Error("DB error"));
    const result = await deleteItem("item_abc");
    expect(result).toEqual({ success: false, error: "Failed to delete item" });
  });
});

describe("toggleItemFavorite action", () => {
  it("returns Unauthorized when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);
    const result = await toggleItemFavorite("item-1");
    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns Invalid item ID when itemId is empty", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "user-1" } } as never);
    const result = await toggleItemFavorite("");
    expect(result).toEqual({ success: false, error: "Invalid item ID" });
  });

  it("returns new isFavorite value on success", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "user-1" } } as never);
    vi.mocked(toggleItemFavoriteInDb).mockResolvedValueOnce({ isFavorite: true });
    const result = await toggleItemFavorite("item-1");
    expect(result).toEqual({ success: true, isFavorite: true });
  });

  it("returns error string when DB throws", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "user-1" } } as never);
    vi.mocked(toggleItemFavoriteInDb).mockRejectedValueOnce(new Error("DB error"));
    const result = await toggleItemFavorite("item-1");
    expect(result).toEqual({ success: false, error: "Failed to update favorite" });
  });
});
