import { describe, expect, it } from "vitest";
import { formatPostDate } from "@/lib/post-date";

describe("formatPostDate", () => {
  it("keeps UTC publication dates on the stored calendar day", () => {
    expect(formatPostDate("2026-08-08T00:00:00.000Z")).toBe("Aug 8, 2026");
  });

  it("returns an empty string for invalid dates", () => {
    expect(formatPostDate("not-a-date")).toBe("");
  });
});
