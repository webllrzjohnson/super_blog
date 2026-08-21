import { describe, expect, it } from "vitest";
import {
  buildDraftAssistantPrompt,
  buildInternalLinkSuggestions,
  parseDraftAssistantResponse,
} from "@/lib/editor-assistant";
import type { Post } from "@/lib/types";

function post(overrides: Partial<Post>): Post {
  return {
    id: overrides.id ?? "post-1",
    title: overrides.title ?? "Elevator outage communication lessons",
    slug: overrides.slug ?? "elevator-outage-communication-lessons",
    excerpt:
      overrides.excerpt ?? "What an outage taught me about tenant updates.",
    content: overrides.content ?? "A draft body about communication.",
    category: overrides.category ?? "Work",
    tags: overrides.tags ?? ["communication", "building management"],
    author: overrides.author ?? { name: "Admin" },
    publishedAt: overrides.publishedAt ?? "2026-07-01T12:00:00.000Z",
    updatedAt: overrides.updatedAt,
    readTime: overrides.readTime ?? 3,
    status: overrides.status ?? "published",
  };
}

describe("editor assistant helpers", () => {
  it("suggests related published posts not already linked in the draft", () => {
    const current = post({
      id: "current",
      slug: "current-draft",
      status: "draft",
      title: "Elevator outage communication notes",
      content: "This draft already links to [old post](/blog/already-linked).",
    });
    const suggestions = buildInternalLinkSuggestions(current, [
      current,
      post({
        id: "related",
        slug: "tenant-communication-during-outages",
        title: "Tenant Communication During Outages",
        tags: ["communication", "building management"],
      }),
      post({
        id: "linked",
        slug: "already-linked",
        title: "Already Linked",
        tags: ["communication"],
      }),
      post({
        id: "draft",
        slug: "draft-post",
        title: "Draft Post",
        status: "draft",
        tags: ["communication"],
      }),
    ]);

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]).toMatchObject({
      title: "Tenant Communication During Outages",
      href: "/blog/tenant-communication-during-outages",
      reason: "Same category, 2 shared tags",
    });
    expect(suggestions[0].markdown).toBe(
      "[Tenant Communication During Outages](/blog/tenant-communication-during-outages)",
    );
  });

  it("builds a compact prompt for improving the selected post field", () => {
    const prompt = buildDraftAssistantPrompt(
      "excerpt",
      post({
        title: "Scooters in the hallway",
        excerpt: "Scooters are creating problems.",
        content:
          "People keep leaving scooters in the hallway and it creates a trip hazard.",
        tags: ["scooters", "building safety"],
      }),
    );

    expect(prompt).toContain("Task: Improve the excerpt");
    expect(prompt).toContain("Title: Scooters in the hallway");
    expect(prompt).toContain("no em dash characters");
    expect(prompt).toContain("Return only JSON");
  });

  it("builds a grammar prompt that preserves voice and meaning", () => {
    const prompt = buildDraftAssistantPrompt(
      "grammar",
      post({
        title: "Friday pump alarm",
        content: "I was checking the alarm and it dont looked right.",
      }),
    );

    expect(prompt).toContain(
      "Task: Fix grammar and spelling without changing the author voice",
    );
    expect(prompt).toContain(
      "Preserve meaning, markdown structure, and first-person details",
    );
    expect(prompt).toContain("contentPatch");
  });

  it("builds a humanize prompt that strips AI-sounding patterns", () => {
    const prompt = buildDraftAssistantPrompt(
      "humanize",
      post({
        title: "Elevator communication lesson",
        content:
          "This situation underscores the importance of communication in today's world.",
      }),
    );

    expect(prompt).toContain(
      "Task: Humanize the draft and remove AI-sounding phrasing",
    );
    expect(prompt).toContain("Remove em dash characters");
    expect(prompt).toContain("Avoid AI phrases");
    expect(prompt).toContain(
      "keep the author sounding like a real superintendent",
    );
  });

  it("builds a promotion prompt with a canonical post URL", () => {
    const prompt = buildDraftAssistantPrompt(
      "promotion",
      post({
        title: "Sump Pump Down on a Friday Afternoon",
        slug: "sump-pump-down-on-a-friday-afternoon",
        excerpt: "What a Friday pump alarm taught me about timing and calm.",
        tags: ["building operations", "sump pump"],
      }),
    );

    expect(prompt).toContain(
      "Task: Generate preview-only promotion copy for this post",
    );
    expect(prompt).toContain(
      "Return promotionCopy with telegram, social, newsletter, and hashtags",
    );
    expect(prompt).toContain(
      "Post URL: https://www.maplehub.cloud/blog/sump-pump-down-on-a-friday-afternoon",
    );
  });

  it("parses assistant JSON and normalizes tags", () => {
    const parsed = parseDraftAssistantResponse(
      `Here is the result:\n{"title":"Better title","excerpt":"Better excerpt","tags":["Building Safety"," ","scooters"],"contentPatch":"Rewritten body","notes":["Keep it personal"]}`,
    );

    expect(parsed).toEqual({
      title: "Better title",
      excerpt: "Better excerpt",
      tags: ["building safety", "scooters"],
      contentPatch: "Rewritten body",
      notes: ["Keep it personal"],
    });
  });

  it("parses promotion copy fields and normalizes hashtags", () => {
    const parsed = parseDraftAssistantResponse(
      `{"promotionCopy":{"telegram":"New post is live","social":"A short share post","newsletter":"A longer newsletter teaser","hashtags":["#BuildingOperations","toronto life"," "]},"notes":["Review before posting"]}`,
    );

    expect(parsed).toEqual({
      promotionCopy: {
        telegram: "New post is live",
        social: "A short share post",
        newsletter: "A longer newsletter teaser",
        hashtags: ["#BuildingOperations", "#torontolife"],
      },
      notes: ["Review before posting"],
    });
  });
});
