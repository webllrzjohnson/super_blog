import type { Post } from "@/lib/types";
import { isPlaceholderImageAltText } from "@/lib/image-alt";

export type ContentQualitySeverity = "blocker" | "warning" | "suggestion";

export interface ContentQualityAudit {
  post: Post;
  score: number;
  blockers: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ContentQualityStats {
  total: number;
  healthy: number;
  needsWork: number;
  blockers: number;
  averageScore: number;
}

const MIN_EXCERPT_LENGTH = 70;
const MIN_BODY_WORDS = 250;
const ADSENSE_DEPTH_WORDS = 700;
const STALE_PUBLISHED_DAYS = 180;

const AI_PLACEHOLDER_PATTERNS = [
  /\bas an ai\b/i,
  /\bai-generated\b/i,
  /\bi cannot provide personal experience\b/i,
  /\bin conclusion,?\b/i,
];

function countWords(content: string): number {
  return content.match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)?/g)?.length ?? 0;
}

function hasInternalLink(content: string): boolean {
  return (
    /\]\(\/blog\/[a-z0-9-]+\)/i.test(content) ||
    /href=["']\/blog\//i.test(content)
  );
}

function hasEmptyMarkdownImageAlt(content: string): boolean {
  return /!\[\s*\]\([^)]+\)/.test(content);
}

function hasPlaceholderMarkdownImageAlt(content: string): boolean {
  const imageAltPattern = /!\[([^\]]*)\]\([^)]+\)/g;
  let match: RegExpExecArray | null;
  while ((match = imageAltPattern.exec(content)) !== null) {
    if (isPlaceholderImageAltText(match[1])) return true;
  }
  return false;
}

function hasDuplicateMarkdownH1(content: string): boolean {
  return /^#\s+\S+/m.test(content);
}

function hasAiPlaceholderLanguage(content: string): boolean {
  return AI_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(content));
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export function auditContentQuality(
  post: Post,
  now = new Date(),
): ContentQualityAudit {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const title = post.title.trim();
  const excerpt = post.excerpt.trim();
  const content = post.content.trim();

  if (!title) blockers.push("Title is missing.");
  if (!post.slug.trim()) blockers.push("Slug is missing.");
  if (!excerpt) blockers.push("Excerpt is missing.");
  else if (excerpt.length < MIN_EXCERPT_LENGTH) {
    warnings.push(
      "Excerpt is short; expand it for search and social previews.",
    );
  }

  if (
    post.featuredImage?.trim() &&
    (!post.featuredImageAlt?.trim() ||
      isPlaceholderImageAltText(post.featuredImageAlt))
  ) {
    blockers.push("Featured image is missing alt text.");
  }

  if (hasEmptyMarkdownImageAlt(content)) {
    warnings.push("One or more inline markdown images have empty alt text.");
  }

  if (hasPlaceholderMarkdownImageAlt(content)) {
    warnings.push(
      "One or more inline markdown images use placeholder alt text.",
    );
  }

  if (hasDuplicateMarkdownH1(content)) {
    warnings.push(
      "Body contains an in-post H1; remove it so the page has one clear title.",
    );
  }

  if (hasAiPlaceholderLanguage(content)) {
    warnings.push(
      "Body contains AI-placeholder or formulaic language; revise before promotion.",
    );
  }

  if (post.tags.length === 0) warnings.push("No tags are set.");
  if (!hasInternalLink(content))
    suggestions.push("Add at least one internal link to a related post.");
  if (countWords(content) < MIN_BODY_WORDS && post.readTime <= 1) {
    suggestions.push(
      "Post is thin; expand it with more detail before promoting it.",
    );
  }
  if (
    post.status === "published" &&
    countWords(content) < ADSENSE_DEPTH_WORDS
  ) {
    suggestions.push(
      "Published post is short for AdSense review; add concrete detail when practical.",
    );
  }

  const lastTouched = new Date(post.updatedAt || post.publishedAt);
  if (
    post.status === "published" &&
    !Number.isNaN(lastTouched.getTime()) &&
    daysBetween(now, lastTouched) > STALE_PUBLISHED_DAYS
  ) {
    suggestions.push(
      "Published post is over 180 days old; review for freshness.",
    );
  }

  const penalty =
    blockers.length * 25 + warnings.length * 10 + suggestions.length * 5;
  const score = Math.max(0, 100 - penalty);

  return { post, score, blockers, warnings, suggestions };
}

export function getContentQualityStats(
  audits: ContentQualityAudit[],
): ContentQualityStats {
  const total = audits.length;
  const healthy = audits.filter(
    (audit) => audit.score >= 90 && audit.blockers.length === 0,
  ).length;
  const blockers = audits.filter((audit) => audit.blockers.length > 0).length;
  const averageScore = total
    ? Math.round(audits.reduce((sum, audit) => sum + audit.score, 0) / total)
    : 0;

  return {
    total,
    healthy,
    needsWork: total - healthy,
    blockers,
    averageScore,
  };
}

export function getPostsNeedingAttention(
  audits: ContentQualityAudit[],
  limit = 8,
): ContentQualityAudit[] {
  return [...audits]
    .filter((audit) => audit.score < 90 || audit.blockers.length > 0)
    .sort((a, b) => {
      const blockerDelta = b.blockers.length - a.blockers.length;
      if (blockerDelta !== 0) return blockerDelta;
      return a.score - b.score;
    })
    .slice(0, limit);
}
