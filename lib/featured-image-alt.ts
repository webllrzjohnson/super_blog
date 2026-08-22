import type { Post } from "@/lib/types";

const CATEGORY_LABELS: Record<Post["category"], string> = {
  Life: "a personal life scene",
  Work: "a building operations scene",
  Hobbies: "a hobby or outdoor scene",
  Experience: "a personal experience scene",
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
  const cut = cleaned.slice(0, maxLength - 1).trimEnd();
  const lastSpace = cut.lastIndexOf(" ");
  const safeCut = lastSpace > 80 ? cut.slice(0, lastSpace) : cut;
  return `${safeCut.replace(/[,.:-]+$/, "")}.`;
}

export function buildFeaturedImageAltText(
  post: Pick<Post, "title" | "excerpt" | "category" | "tags">,
): string {
  const subject =
    cleanText(post.title) || firstSentence(post.excerpt) || post.category;
  const scene = CATEGORY_LABELS[post.category];

  return truncateSentence(
    `Illustration of ${subject}, showing ${scene}.`,
    160,
  );
}

export function buildFeaturedImageAltTextFromTopic(topic: string): string {
  const subject = cleanText(topic) || "a Toronto apartment building field note";
  return truncateSentence(
    `Illustration of ${subject}, showing a Toronto apartment building scene.`,
    160,
  );
}
