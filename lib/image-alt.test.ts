import { describe, expect, it } from "vitest";
import {
  getSafeImageAltText,
  isPlaceholderImageAltText,
} from "@/lib/image-alt";

describe("getSafeImageAltText", () => {
  it("uses explicit descriptive alt text", () => {
    expect(
      getSafeImageAltText(
        "A sump pump alarm panel in a building hallway",
        "Sump pump post",
      ),
    ).toBe("A sump pump alarm panel in a building hallway");
  });

  it("falls back to the title when alt text is missing", () => {
    expect(getSafeImageAltText("   ", "Failed Your G Test Twice?")).toBe(
      "Failed Your G Test Twice?",
    );
    expect(getSafeImageAltText(null, "Failed Your G Test Twice?")).toBe(
      "Failed Your G Test Twice?",
    );
  });

  it("falls back to the title for unfinished placeholder alt text", () => {
    expect(
      getSafeImageAltText("temporary image", "Failed Your G Test Twice?"),
    ).toBe("Failed Your G Test Twice?");
    expect(
      getSafeImageAltText("Describe this image", "Failed Your G Test Twice?"),
    ).toBe("Failed Your G Test Twice?");
  });

  it("identifies only unfinished placeholder alt text", () => {
    expect(isPlaceholderImageAltText("temporary image")).toBe(true);
    expect(isPlaceholderImageAltText("placeholder image")).toBe(true);
    expect(isPlaceholderImageAltText("Describe this image")).toBe(true);
    expect(isPlaceholderImageAltText("A hallway after cleanup")).toBe(false);
    expect(isPlaceholderImageAltText("")).toBe(false);
  });
});
