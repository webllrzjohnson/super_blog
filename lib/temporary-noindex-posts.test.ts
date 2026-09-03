import { describe, expect, it } from "vitest";
import {
  isTemporarilyNoindexedPost,
  TEMPORARILY_NOINDEXED_POST_SLUGS,
} from "@/lib/temporary-noindex-posts";

describe("temporary AdSense noindex posts", () => {
  it("contains the approved eight-post remediation set", () => {
    expect(TEMPORARILY_NOINDEXED_POST_SLUGS).toHaveLength(8);
    expect(TEMPORARILY_NOINDEXED_POST_SLUGS).toEqual(
      new Set([
        "psychology-behind-garbage-chaos-subsidized-housing",
        "why-harassing-building-staff-has-to-stop",
        "what-is-a-notice-of-entry-noe-and-what-it-isnt",
        "first-acupuncture-treatment-running-injury-knee-recovery",
        "the-mould-problem-dangers-resolution-and-prevention",
        "how-pest-problems-start-and-spread-in-your-home",
        "dealing-with-difficult-tenants-disputes-evictions-high-maintenance",
        "the-audit-nobody-wants-to-run",
      ]),
    );
  });

  it("normalizes slugs before applying noindex", () => {
    expect(
      isTemporarilyNoindexedPost(
        "  FIRST-ACUPUNCTURE-TREATMENT-RUNNING-INJURY-KNEE-RECOVERY  ",
      ),
    ).toBe(true);
    expect(isTemporarilyNoindexedPost("sump-pump-down-friday-afternoon")).toBe(
      false,
    );
  });
});
