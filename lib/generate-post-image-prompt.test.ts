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
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain(
      "For waste-related stories",
    );
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain(
      "green organic on the left",
    );
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain(
      "black garbage in the middle",
    );
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain(
      "blue recycling on the right",
    );
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain("townhouse bins");
    expect(DEFAULT_IMAGE_PROMPT_TEMPLATE).toContain(
      "stainless-steel chute door",
    );
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

  it("describes Louie's actual compactor room when waste excerpts mention compactors", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const prompt = buildPostImagePrompt(
      "The compactor room backed up again and I had to check the garbage, recycling, and organic compactors before calling staff.",
    );

    expect(prompt).toContain(
      "three chute-fed compactors lined up side by side",
    );
    expect(prompt).toContain("green organic on the left");
    expect(prompt).toContain("black garbage in the middle");
    expect(prompt).toContain("blue recycling on the right");
    expect(prompt).toContain("industrial steel chute feeds above");
    expect(prompt).toContain("Avoid generic curbside bins");

    vi.restoreAllMocks();
  });

  it("distinguishes outdoor townhouse dumpsters from indoor compactor equipment", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const prompt = buildPostImagePrompt(
      "A townhouse resident left garbage beside the external bins near the rear service area.",
    );

    expect(prompt).toContain("large scuffed metal rolling dumpsters outdoors");
    expect(prompt).toContain("black hinged lids");
    expect(prompt).toContain("small caster wheels");
    expect(prompt).toContain("chute-fed compactors outdoors");

    vi.restoreAllMocks();
  });

  it("describes dirty garbage chute alcoves when tenants leave bags on the floor", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const prompt = buildPostImagePrompt(
      "Tenant garbage bags and cardboard were left on the floor beside the chute instead of being taken downstairs.",
    );

    expect(prompt).toContain("small apartment chute alcove");
    expect(prompt).toContain("wall-mounted stainless-steel chute door");
    expect(prompt).toContain("white plastic bags with orange drawstrings");
    expect(prompt).toContain(
      "cardboard packaging, cans, small loose recyclables",
    );
    expect(prompt).toContain("exaggerated landfill piles");

    vi.restoreAllMocks();
  });
});
