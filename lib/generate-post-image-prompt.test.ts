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
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain(
      "Do not literalize metaphors",
    );
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain("carrying a child");
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

  it("guards emotional-weight excerpts from becoming literal child or running scenes", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const prompt = buildPostImagePrompt(
      "Nobody warned me that the hardest part of this job wouldn't be the boilers or the work orders, it would be the people, and how much of their weight I'd end up carrying home.",
    );

    expect(prompt).toContain("weight I'd end up carrying home");
    expect(prompt).toContain("Do not literalize metaphors");
    expect(prompt).toContain("show emotional strain through posture");
    expect(prompt).toContain(
      "Do not turn those metaphors into physically carrying a person",
    );
    expect(prompt).toContain("carrying a child");
    expect(prompt).toContain("running with someone");

    vi.restoreAllMocks();
  });
});
