import { describe, expect, it } from "vitest";
import {
  RESOURCE_FILE_CATEGORIES,
  validateResourceFile,
} from "./resource-files";

describe("resource files", () => {
  it("allows visitor-friendly document types", () => {
    const file = new File(["notice"], "notice-of-entry.pdf", {
      type: "application/pdf",
    });

    expect(() => validateResourceFile(file)).not.toThrow();
  });

  it("rejects unsupported executable uploads", () => {
    const file = new File(["bad"], "script.exe", {
      type: "application/x-msdownload",
    });

    expect(() => validateResourceFile(file)).toThrow(/Unsupported file type/);
  });

  it("keeps resource categories explicit for admin filters", () => {
    expect(RESOURCE_FILE_CATEGORIES).toContain("Lease");
    expect(RESOURCE_FILE_CATEGORIES).toContain("Notice");
    expect(RESOURCE_FILE_CATEGORIES).toContain("Template");
  });
});
