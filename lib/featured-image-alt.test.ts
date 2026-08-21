import { describe, expect, it } from "vitest";
import { buildFeaturedImageAltText } from "@/lib/featured-image-alt";
import type { Post } from "@/lib/types";

function post(overrides: Partial<Post> = {}): Post {
  return {
    id: overrides.id ?? "post-1",
    title: overrides.title ?? "Sump Pump Down on a Friday Afternoon",
    slug: overrides.slug ?? "sump-pump-down-on-a-friday-afternoon",
    excerpt:
      overrides.excerpt ??
      "A field note about a basement pump alarm, Friday timing, and communicating clearly with residents.",
    content:
      overrides.content ??
      "## What happened\nI checked the building and followed up with staff.",
    category: overrides.category ?? "Work",
    tags: overrides.tags ?? ["sump pump", "building operations"],
    author: overrides.author ?? { name: "Lester J." },
    publishedAt: overrides.publishedAt ?? "2026-07-12T12:00:00.000Z",
    updatedAt: overrides.updatedAt,
    readTime: overrides.readTime ?? 4,
    status: overrides.status ?? "draft",
    featuredImage: overrides.featuredImage,
    featuredImageAlt: overrides.featuredImageAlt,
  };
}

describe("buildFeaturedImageAltText", () => {
  it("creates a concise descriptive alt text from post context", () => {
    expect(buildFeaturedImageAltText(post())).toBe(
      "Illustration for Sump Pump Down on a Friday Afternoon, showing a building operations scene about sump pump.",
    );
  });

  it("falls back to excerpt or category when title/tags are missing", () => {
    expect(
      buildFeaturedImageAltText(
        post({
          title: "",
          tags: [],
          category: "Life",
          excerpt: "A quiet Toronto weekend reset after a long week.",
        }),
      ),
    ).toBe(
      "Illustration for A quiet Toronto weekend reset after a long week, showing a life scene.",
    );
  });

  it("removes markdown and keeps alt text under 160 characters", () => {
    const alt = buildFeaturedImageAltText(
      post({
        title:
          "Why [I Did Not Overreact](https://example.com) During a Very Long Building Incident That Needed Calm Communication",
        tags: ["tenant communication", "vendor relations"],
      }),
    );

    expect(alt).not.toContain("[");
    expect(alt.length).toBeLessThanOrEqual(160);
  });
});
