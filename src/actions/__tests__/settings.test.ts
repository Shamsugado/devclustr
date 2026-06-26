import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/users", () => ({
  saveEditorSettings: vi.fn(),
}));

const { updateEditorSettings } = await import("@/actions/settings");
const { auth } = await import("@/auth");
const { saveEditorSettings } = await import("@/lib/db/users");

const mockAuth = vi.mocked(auth);
const mockSave = vi.mocked(saveEditorSettings);

const validSettings = { fontSize: 14, tabSize: 2, theme: "vs-dark" as const };

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({ user: { id: "user_1" } } as never);
  mockSave.mockResolvedValue(undefined);
});

describe("updateEditorSettings", () => {
  describe("auth", () => {
    it("returns Unauthorized when not signed in", async () => {
      mockAuth.mockResolvedValue(null as never);
      const result = await updateEditorSettings(validSettings);
      expect(result).toEqual({ success: false, error: "Unauthorized" });
      expect(mockSave).not.toHaveBeenCalled();
    });

    it("returns Unauthorized when session has no user id", async () => {
      mockAuth.mockResolvedValue({ user: {} } as never);
      const result = await updateEditorSettings(validSettings);
      expect(result).toEqual({ success: false, error: "Unauthorized" });
    });
  });

  describe("validation — fontSize", () => {
    it("accepts the minimum font size (8)", async () => {
      const result = await updateEditorSettings({ ...validSettings, fontSize: 8 });
      expect(result.success).toBe(true);
    });

    it("accepts the maximum font size (32)", async () => {
      const result = await updateEditorSettings({ ...validSettings, fontSize: 32 });
      expect(result.success).toBe(true);
    });

    it("rejects font size below minimum (7)", async () => {
      const result = await updateEditorSettings({ ...validSettings, fontSize: 7 });
      expect(result).toEqual({ success: false, error: "Invalid settings" });
      expect(mockSave).not.toHaveBeenCalled();
    });

    it("rejects font size above maximum (33)", async () => {
      const result = await updateEditorSettings({ ...validSettings, fontSize: 33 });
      expect(result).toEqual({ success: false, error: "Invalid settings" });
    });

    it("rejects non-integer font size", async () => {
      const result = await updateEditorSettings({ ...validSettings, fontSize: 12.5 });
      expect(result).toEqual({ success: false, error: "Invalid settings" });
    });
  });

  describe("validation — tabSize", () => {
    it("accepts the minimum tab size (1)", async () => {
      const result = await updateEditorSettings({ ...validSettings, tabSize: 1 });
      expect(result.success).toBe(true);
    });

    it("accepts the maximum tab size (8)", async () => {
      const result = await updateEditorSettings({ ...validSettings, tabSize: 8 });
      expect(result.success).toBe(true);
    });

    it("rejects tab size of 0", async () => {
      const result = await updateEditorSettings({ ...validSettings, tabSize: 0 });
      expect(result).toEqual({ success: false, error: "Invalid settings" });
    });

    it("rejects tab size above maximum (9)", async () => {
      const result = await updateEditorSettings({ ...validSettings, tabSize: 9 });
      expect(result).toEqual({ success: false, error: "Invalid settings" });
    });
  });

  describe("validation — theme", () => {
    it("accepts vs-dark", async () => {
      const result = await updateEditorSettings({ ...validSettings, theme: "vs-dark" });
      expect(result.success).toBe(true);
    });

    it("accepts vs (light)", async () => {
      const result = await updateEditorSettings({ ...validSettings, theme: "vs" });
      expect(result.success).toBe(true);
    });

    it("accepts hc-black", async () => {
      const result = await updateEditorSettings({ ...validSettings, theme: "hc-black" });
      expect(result.success).toBe(true);
    });

    it("rejects an unknown theme", async () => {
      const result = await updateEditorSettings({ ...validSettings, theme: "monokai" });
      expect(result).toEqual({ success: false, error: "Invalid settings" });
      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  describe("happy path", () => {
    it("calls saveEditorSettings with validated data and returns success", async () => {
      const result = await updateEditorSettings({ fontSize: 16, tabSize: 4, theme: "vs" });
      expect(result).toEqual({ success: true });
      expect(mockSave).toHaveBeenCalledWith("user_1", {
        fontSize: 16,
        tabSize: 4,
        theme: "vs",
      });
    });
  });

  describe("DB error", () => {
    it("returns error when saveEditorSettings throws", async () => {
      mockSave.mockRejectedValue(new Error("DB down"));
      const result = await updateEditorSettings(validSettings);
      expect(result).toEqual({ success: false, error: "Failed to save settings" });
    });
  });
});
