import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_IMAGE_PROMPT_TEMPLATE,
  buildPostImagePrompt,
} from "@/lib/generate-post-image-prompt";

describe("generate post image prompt", () => {
  it("keeps the default featured-image style aligned to excerpt-driven personal story illustrations", () => {
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain(
      "Cinematic cel-shaded editorial illustration",
    );
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain("source of truth");
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain("thick clean ink outlines");
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain("subtle film grain");
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain(
      "light-brown-skinned adult man",
    );
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain("clean-shaven head");
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain("Garmin Epix Pro");
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain("Do not force a building");
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain("no glossy 3D render");
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).not.toContain("Studio Ghibli");
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).not.toContain("Makoto Shinkai");
  });

  it("builds prompts with the story source and soft setting guidance", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const prompt = buildPostImagePrompt(
      "We packed the car for a quiet weekend outside the city and watched my son set up a tent for the first time.",
    );

    expect(prompt).toContain("quiet weekend outside the city");
    expect(prompt).toContain(
      "use the excerpt to choose the most accurate setting",
    );
    expect(prompt).toContain("camping");
    expect(prompt).toContain("No speech bubbles");

    vi.restoreAllMocks();
  });
});
