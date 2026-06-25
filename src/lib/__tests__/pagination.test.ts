import { describe, it, expect } from "vitest";
import { pageNumbers } from "../pagination";

describe("pageNumbers", () => {
  describe("small totals (≤7) — all pages shown, no ellipsis", () => {
    it("returns [1] for 1 page", () => {
      expect(pageNumbers(1, 1)).toEqual([1]);
    });

    it("returns all pages for 7 pages", () => {
      expect(pageNumbers(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it("returns all pages for 3 pages", () => {
      expect(pageNumbers(2, 3)).toEqual([1, 2, 3]);
    });
  });

  describe("large totals (>7) — ellipsis as null", () => {
    it("page 1: no leading ellipsis, trailing ellipsis before last", () => {
      // [1, 2, null, 10]
      expect(pageNumbers(1, 10)).toEqual([1, 2, null, 10]);
    });

    it("page 2: no leading ellipsis, trailing ellipsis", () => {
      // [1, 2, 3, null, 10]
      expect(pageNumbers(2, 10)).toEqual([1, 2, 3, null, 10]);
    });

    it("page 3: no leading ellipsis, trailing ellipsis", () => {
      // current=3, start=max(2,2)=2, end=min(9,4)=4 → [1, 2, 3, 4, null, 10]
      expect(pageNumbers(3, 10)).toEqual([1, 2, 3, 4, null, 10]);
    });

    it("page 4: leading ellipsis appears, trailing ellipsis", () => {
      // current=4 > 3 → push null after 1; start=3, end=5 → [1, null, 3, 4, 5, null, 10]
      expect(pageNumbers(4, 10)).toEqual([1, null, 3, 4, 5, null, 10]);
    });

    it("middle page: both ellipses present", () => {
      // current=5, total=10 → [1, null, 4, 5, 6, null, 10]
      expect(pageNumbers(5, 10)).toEqual([1, null, 4, 5, 6, null, 10]);
    });

    it("second-to-last page: leading ellipsis, no trailing ellipsis", () => {
      // current=9, total=10; current < 10-2=8 is false → no trailing null
      // start=max(2,8)=8, end=min(9,10)=9 → [1, null, 8, 9, 10]
      expect(pageNumbers(9, 10)).toEqual([1, null, 8, 9, 10]);
    });

    it("last page: leading ellipsis, no trailing ellipsis", () => {
      // current=10, total=10; start=9, end=9 → [1, null, 9, 10]
      expect(pageNumbers(10, 10)).toEqual([1, null, 9, 10]);
    });

    it("always includes page 1 and last page", () => {
      const result = pageNumbers(50, 100);
      expect(result[0]).toBe(1);
      expect(result[result.length - 1]).toBe(100);
    });

    it("always includes the current page", () => {
      const current = 42;
      const result = pageNumbers(current, 100);
      expect(result).toContain(current);
    });

    it("never has two consecutive nulls", () => {
      for (let page = 1; page <= 20; page++) {
        const result = pageNumbers(page, 20);
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i] === null && result[i + 1] === null).toBe(false);
        }
      }
    });

    it("pages are in ascending order (ignoring nulls)", () => {
      const result = pageNumbers(5, 20);
      const nums = result.filter((p): p is number => p !== null);
      for (let i = 1; i < nums.length; i++) {
        expect(nums[i]).toBeGreaterThan(nums[i - 1]);
      }
    });
  });
});
