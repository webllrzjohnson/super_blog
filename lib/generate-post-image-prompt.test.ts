import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_IMAGE_PROMPT_TEMPLATE,
  buildPostImagePrompt,
} from "@/lib/generate-post-image-prompt";

describe("generate post image prompt", () => {
  it("keeps the default featured-image style aligned to cinematic building-operation illustrations", () => {
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain(
      "Cinematic cel-shaded editorial illustration",
    );
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain(
      "strong architectural perspective",
    );
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain("thick clean ink outlines");
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain("subtle film grain");
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain("garbage bags");
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain("no glossy 3D render");
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).not.toContain("Studio Ghibli");
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).not.toContain("Makoto Shinkai");
  });

  it("builds prompts with the topic and a rotating Toronto setting", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const prompt = buildPostImagePrompt("Garbage bags blocking a stairwell");

    expect(prompt).toContain("Garbage bags blocking a stairwell");
    expect(prompt).toContain(
      "a residential side street with older apartment buildings",
    );
    expect(prompt).toContain("No speech bubbles");

    vi.restoreAllMocks();
  });
});
