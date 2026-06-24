import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/collections", () => ({ createCollection: vi.fn() }));

const { CreateCollectionSchema } = await import("@/actions/collection-schemas");
const { createCollection } = await import("@/actions/collections");
const { auth } = await import("@/auth");
const { createCollection: createCollectionInDb } = await import("@/lib/db/collections");

const mockAuth = vi.mocked(auth);
const mockCreateInDb = vi.mocked(createCollectionInDb);

const baseForm = {
  name: "React Patterns",
  description: "Useful React patterns and techniques",
};

describe("CreateCollectionSchema", () => {
  describe("name", () => {
    it("accepts a valid name", () => {
      expect(CreateCollectionSchema.safeParse(baseForm).success).toBe(true);
    });

    it("rejects an empty name", () => {
      const result = CreateCollectionSchema.safeParse({ ...baseForm, name: "" });
      expect(result.success).toBe(false);
    });

    it("rejects a whitespace-only name after trim", () => {
      const result = CreateCollectionSchema.safeParse({ ...baseForm, name: "   " });
      expect(result.success).toBe(false);
    });

    it("trims whitespace from a valid name", () => {
      const result = CreateCollectionSchema.safeParse({ ...baseForm, name: "  hello  " });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.name).toBe("hello");
    });

    it("rejects a name longer than 100 characters", () => {
      const result = CreateCollectionSchema.safeParse({ ...baseForm, name: "a".repeat(101) });
      expect(result.success).toBe(false);
    });

    it("accepts a name of exactly 100 characters", () => {
      const result = CreateCollectionSchema.safeParse({ ...baseForm, name: "a".repeat(100) });
      expect(result.success).toBe(true);
    });
  });

  describe("description", () => {
    it("accepts a null description", () => {
      expect(CreateCollectionSchema.safeParse({ ...baseForm, description: null }).success).toBe(true);
    });

    it("accepts a string description", () => {
      expect(CreateCollectionSchema.safeParse(baseForm).success).toBe(true);
    });

    it("rejects a description longer than 500 characters", () => {
      const result = CreateCollectionSchema.safeParse({ ...baseForm, description: "a".repeat(501) });
      expect(result.success).toBe(false);
    });

    it("accepts a description of exactly 500 characters", () => {
      const result = CreateCollectionSchema.safeParse({ ...baseForm, description: "a".repeat(500) });
      expect(result.success).toBe(true);
    });
  });
});

describe("createCollection action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await createCollection(baseForm);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Unauthorized");
  });

  it("returns unauthorized when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);
    const result = await createCollection(baseForm);
    expect(result.success).toBe(false);
  });

  it("returns field errors when name is empty", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const result = await createCollection({ name: "", description: null });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toHaveProperty("name");
  });

  it("calls db helper and returns success", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const created = { id: "col-1", name: "React Patterns", description: null };
    mockCreateInDb.mockResolvedValue(created);

    const result = await createCollection(baseForm);

    expect(mockCreateInDb).toHaveBeenCalledWith("user-1", {
      name: "React Patterns",
      description: "Useful React patterns and techniques",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual(created);
  });

  it("returns error when db throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockCreateInDb.mockRejectedValue(new Error("DB error"));

    const result = await createCollection(baseForm);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Failed to create collection");
  });
});
