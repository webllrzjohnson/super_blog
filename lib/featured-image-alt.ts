import type { Post } from "@/lib/types";

const CATEGORY_LABELS: Record<Post["category"], string> = {
  Life: "life scene",
  Work: "building operations scene",
  Hobbies: "hobby scene",
  Experience: "personal experience scene",
};

function cleanText(value: string): string {
  return value
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_#>~]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function firstSentence(value: string): string {
  const cleaned = cleanText(value);
  const match = cleaned.match(/^(.{1,120}?)(?:[.!?]\s|$)/);
  return (match?.[1] ?? cleaned).trim().replace(/[.!?]+$/, "");
}

function truncateSentence(value: string, maxLength: number): string {
  const cleaned = cleanText(value);
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned
    .slice(0, maxLength - 1)
    .trimEnd()
    .replace(/[,.:-]+$/, "")}.`;
}

export function buildFeaturedImageAltText(
  post: Pick<Post, "title" | "excerpt" | "category" | "tags">,
): string {
  const subject =
    cleanText(post.title) || firstSentence(post.excerpt) || post.category;
  const scene = CATEGORY_LABELS[post.category];
  const primaryTag = post.tags.map(cleanText).find(Boolean);
  const about = primaryTag ? ` about ${primaryTag}` : "";

  return truncateSentence(
    `Illustration for ${subject}, showing a ${scene}${about}.`,
    160,
  );
}

export function buildFeaturedImageAltTextFromTopic(topic: string): string {
  const subject = cleanText(topic) || "a Toronto apartment building field note";
  return truncateSentence(
    `Illustration for ${subject}, showing a Toronto apartment building scene.`,
    160,
  );
}
