import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/collections", () => ({
  createCollection: vi.fn(),
  updateCollection: vi.fn(),
  deleteCollection: vi.fn(),
  toggleCollectionFavorite: vi.fn(),
}));

const { CreateCollectionSchema, UpdateCollectionSchema } = await import("@/actions/collection-schemas");
const { createCollection, updateCollection, deleteCollection, toggleCollectionFavorite } = await import("@/actions/collections");
const { auth } = await import("@/auth");
const {
  createCollection: createCollectionInDb,
  updateCollection: updateCollectionInDb,
  deleteCollection: deleteCollectionInDb,
  toggleCollectionFavorite: toggleCollectionFavoriteInDb,
} = await import("@/lib/db/collections");

const mockAuth = vi.mocked(auth);
const mockCreateInDb = vi.mocked(createCollectionInDb);
const mockUpdateInDb = vi.mocked(updateCollectionInDb);
const mockDeleteInDb = vi.mocked(deleteCollectionInDb);
const mockToggleFavInDb = vi.mocked(toggleCollectionFavoriteInDb);

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

describe("UpdateCollectionSchema", () => {
  const base = { id: "col-1", name: "React Patterns", description: null };

  it("accepts valid input", () => {
    expect(UpdateCollectionSchema.safeParse(base).success).toBe(true);
  });

  it("rejects missing id", () => {
    const result = UpdateCollectionSchema.safeParse({ name: "x", description: null });
    expect(result.success).toBe(false);
  });

  it("rejects empty id", () => {
    const result = UpdateCollectionSchema.safeParse({ ...base, id: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = UpdateCollectionSchema.safeParse({ ...base, name: "" });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from name", () => {
    const result = UpdateCollectionSchema.safeParse({ ...base, name: "  trimmed  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("trimmed");
  });

  it("rejects description longer than 500 characters", () => {
    const result = UpdateCollectionSchema.safeParse({ ...base, description: "a".repeat(501) });
    expect(result.success).toBe(false);
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

describe("updateCollection action", () => {
  const updateForm = { id: "col-1", name: "Updated Name", description: null };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await updateCollection(updateForm);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Unauthorized");
  });

  it("returns field errors when name is empty", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const result = await updateCollection({ ...updateForm, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toHaveProperty("name");
  });

  it("calls db helper with correct args and returns success", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const updated = { id: "col-1", name: "Updated Name", description: null };
    mockUpdateInDb.mockResolvedValue(updated);

    const result = await updateCollection(updateForm);

    expect(mockUpdateInDb).toHaveBeenCalledWith("user-1", "col-1", {
      id: "col-1",
      name: "Updated Name",
      description: null,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual(updated);
  });

  it("returns error when db throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUpdateInDb.mockRejectedValue(new Error("Not found"));

    const result = await updateCollection(updateForm);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Failed to update collection");
  });
});

describe("deleteCollection action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await deleteCollection({ id: "col-1" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Unauthorized");
  });

  it("returns error when id is empty", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const result = await deleteCollection({ id: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Invalid ID");
  });

  it("calls db helper and returns success", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDeleteInDb.mockResolvedValue(undefined);

    const result = await deleteCollection({ id: "col-1" });

    expect(mockDeleteInDb).toHaveBeenCalledWith("user-1", "col-1");
    expect(result.success).toBe(true);
  });

  it("returns error when db throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDeleteInDb.mockRejectedValue(new Error("Not found"));

    const result = await deleteCollection({ id: "col-1" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Failed to delete collection");
  });
});

describe("toggleCollectionFavorite action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await toggleCollectionFavorite("col-1");
    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns error when id is empty", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const result = await toggleCollectionFavorite("");
    expect(result).toEqual({ success: false, error: "Invalid ID" });
  });

  it("returns new isFavorite value on success", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockToggleFavInDb.mockResolvedValue({ isFavorite: true });

    const result = await toggleCollectionFavorite("col-1");
    expect(result).toEqual({ success: true, isFavorite: true });
    expect(mockToggleFavInDb).toHaveBeenCalledWith("col-1", "user-1");
  });

  it("returns error when db throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockToggleFavInDb.mockRejectedValue(new Error("Not found"));

    const result = await toggleCollectionFavorite("col-1");
    expect(result).toEqual({ success: false, error: "Failed to update favorite" });
  });
});
