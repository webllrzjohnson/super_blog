import { describe, expect, it } from "vitest";
import {
  auditContentQuality,
  getContentQualityStats,
  getPostsNeedingAttention,
} from "@/lib/content-quality-audit";
import type { Post } from "@/lib/types";

function post(overrides: Partial<Post> = {}): Post {
  return {
    id: overrides.id ?? "post-1",
    title: overrides.title ?? "Tenant communication during an outage",
    slug: overrides.slug ?? "tenant-communication-during-an-outage",
    excerpt:
      overrides.excerpt ??
      "A practical field note about explaining timelines clearly during an outage.",
    content:
      overrides.content ??
      `${"A detailed field note about communication, timing, follow-up, and practical building operations. ".repeat(90)}\n\nRead [a related post](/blog/related-post).`,
    category: overrides.category ?? "Work",
    tags: overrides.tags ?? ["building operations", "communication"],
    author: overrides.author ?? { name: "Lester J." },
    publishedAt: overrides.publishedAt ?? "2026-07-01T12:00:00.000Z",
    updatedAt: overrides.updatedAt,
    readTime: overrides.readTime ?? 3,
    status: overrides.status ?? "published",
    featuredImage: overrides.featuredImage,
    featuredImageAlt: overrides.featuredImageAlt,
  };
}

describe("content quality audit", () => {
  it("marks a complete post as healthy", () => {
    const result = auditContentQuality(
      post({
        featuredImage: "/uploads/outage.jpg",
        featuredImageAlt: "Building hallway during outage response",
      }),
    );

    expect(result.score).toBe(100);
    expect(result.blockers).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.suggestions).toEqual([]);
  });

  it("flags missing SEO and discovery basics", () => {
    const result = auditContentQuality(
      post({
        excerpt: "Too short.",
        tags: [],
        featuredImage: "/uploads/photo.jpg",
        featuredImageAlt: "",
        content: "Short body with no links.",
        readTime: 1,
      }),
    );

    expect(result.blockers).toContain("Featured image is missing alt text.");
    expect(result.warnings).toContain(
      "Excerpt is short; expand it for search and social previews.",
    );
    expect(result.warnings).toContain("No tags are set.");
    expect(result.suggestions).toContain(
      "Add at least one internal link to a related post.",
    );
    expect(result.suggestions).toContain(
      "Post is thin; expand it with more detail before promoting it.",
    );
    expect(result.score).toBeLessThan(80);
  });

  it("treats placeholder featured image alt text as unfinished", () => {
    const result = auditContentQuality(
      post({
        featuredImage: "/uploads/photo.jpg",
        featuredImageAlt: "temporary image",
      }),
    );

    expect(result.blockers).toContain("Featured image is missing alt text.");
  });

  it("flags AdSense-readiness content risks without blocking drafts", () => {
    const result = auditContentQuality(
      post({
        content:
          "# Duplicate title\n\nAs an AI-generated article, I cannot provide personal experience.\n\n![Describe this image](/uploads/photo.jpg)",
        readTime: 1,
        status: "published",
      }),
    );

    expect(result.blockers).toEqual([]);
    expect(result.warnings).toContain(
      "One or more inline markdown images use placeholder alt text.",
    );
    expect(result.warnings).toContain(
      "Body contains an in-post H1; remove it so the page has one clear title.",
    );
    expect(result.warnings).toContain(
      "Body contains AI-placeholder or formulaic language; revise before promotion.",
    );
    expect(result.suggestions).toContain(
      "Published post is short for AdSense review; add concrete detail when practical.",
    );
  });

  it("flags stale published posts that have not been updated recently", () => {
    const result = auditContentQuality(
      post({ publishedAt: "2025-01-01T12:00:00.000Z", updatedAt: undefined }),
      new Date("2026-07-12T12:00:00.000Z"),
    );

    expect(result.suggestions).toContain(
      "Published post is over 180 days old; review for freshness.",
    );
  });

  it("summarizes quality stats and top attention items", () => {
    const posts = [
      post({
        id: "healthy",
        featuredImage: "/img.jpg",
        featuredImageAlt: "Alt text",
      }),
      post({
        id: "bad",
        title: "Bad",
        excerpt: "",
        tags: [],
        content: "Thin.",
        readTime: 1,
        featuredImage: "/img.jpg",
        featuredImageAlt: "",
      }),
    ];

    const audits = posts.map((item) => auditContentQuality(item));
    expect(getContentQualityStats(audits)).toEqual({
      total: 2,
      healthy: 1,
      needsWork: 1,
      blockers: 1,
      averageScore: 63,
    });
    expect(
      getPostsNeedingAttention(audits, 1).map((item) => item.post.id),
    ).toEqual(["bad"]);
  });
});
