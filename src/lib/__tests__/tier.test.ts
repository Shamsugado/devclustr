import { describe, it, expect, vi, beforeEach } from "vitest";
import { canCreateItem, canCreateCollection } from "../tier";
import { FREE_TIER_ITEM_LIMIT, FREE_TIER_COLLECTION_LIMIT } from "../constants";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: {
      count: vi.fn(),
    },
    collection: {
      count: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

const mockItemCount = prisma.item.count as ReturnType<typeof vi.fn>;
const mockCollectionCount = prisma.collection.count as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("canCreateItem", () => {
  it("returns true for pro user without querying the DB", async () => {
    const result = await canCreateItem("user-1", true);
    expect(result).toBe(true);
    expect(mockItemCount).not.toHaveBeenCalled();
  });

  it("returns true for free user below the limit", async () => {
    mockItemCount.mockResolvedValue(FREE_TIER_ITEM_LIMIT - 1);
    const result = await canCreateItem("user-1", false);
    expect(result).toBe(true);
    expect(mockItemCount).toHaveBeenCalledWith({ where: { userId: "user-1" } });
  });

  it("returns false for free user at exactly the limit", async () => {
    mockItemCount.mockResolvedValue(FREE_TIER_ITEM_LIMIT);
    const result = await canCreateItem("user-1", false);
    expect(result).toBe(false);
  });

  it("returns false for free user above the limit", async () => {
    mockItemCount.mockResolvedValue(FREE_TIER_ITEM_LIMIT + 5);
    const result = await canCreateItem("user-1", false);
    expect(result).toBe(false);
  });
});

describe("canCreateCollection", () => {
  it("returns true for pro user without querying the DB", async () => {
    const result = await canCreateCollection("user-1", true);
    expect(result).toBe(true);
    expect(mockCollectionCount).not.toHaveBeenCalled();
  });

  it("returns true for free user with 0 collections", async () => {
    mockCollectionCount.mockResolvedValue(0);
    const result = await canCreateCollection("user-1", false);
    expect(result).toBe(true);
  });

  it("returns true for free user with 1 collection", async () => {
    mockCollectionCount.mockResolvedValue(1);
    const result = await canCreateCollection("user-1", false);
    expect(result).toBe(true);
  });

  it("returns true for free user with 2 collections", async () => {
    mockCollectionCount.mockResolvedValue(2);
    const result = await canCreateCollection("user-1", false);
    expect(result).toBe(true);
  });

  it("returns false for free user at the limit (3 collections)", async () => {
    mockCollectionCount.mockResolvedValue(FREE_TIER_COLLECTION_LIMIT);
    const result = await canCreateCollection("user-1", false);
    expect(result).toBe(false);
  });
});
