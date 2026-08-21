import type { Post } from "@/lib/types";
import { isPlaceholderImageAltText } from "@/lib/image-alt";

export type EditorReadinessStatus = "complete" | "missing";

export type EditorReadinessItem = {
  id: string;
  label: string;
  status: EditorReadinessStatus;
  detail: string;
};

export type EditorReadinessResult = {
  ready: boolean;
  completedCount: number;
  totalCount: number;
  missingLabels: string[];
  items: EditorReadinessItem[];
};

function hasInternalBlogLink(content: string): boolean {
  return (
    /\]\(\/blog\/[^)]+\)/i.test(content) ||
    /https?:\/\/www\.maplehub\.cloud\/blog\//i.test(content)
  );
}

function item(
  id: string,
  label: string,
  complete: boolean,
  detail: string,
): EditorReadinessItem {
  return {
    id,
    label,
    status: complete ? "complete" : "missing",
    detail,
  };
}

export function evaluateEditorReadiness(post: Post): EditorReadinessResult {
  const title = post.title.trim();
  const excerpt = post.excerpt.trim();
  const content = post.content.trim();
  const hasFeaturedImage = Boolean(post.featuredImage?.trim());
  const hasFeaturedAlt =
    !hasFeaturedImage ||
    (Boolean(post.featuredImageAlt?.trim()) &&
      !isPlaceholderImageAltText(post.featuredImageAlt));

  const items: EditorReadinessItem[] = [
    item(
      "title",
      "Title written",
      Boolean(title),
      "Add a clear working title.",
    ),
    item(
      "excerpt",
      "Excerpt written",
      Boolean(excerpt),
      "Add a short summary for listings and sharing.",
    ),
    item(
      "content",
      "Body draft written",
      content.length >= 80,
      "Write enough body content before publishing.",
    ),
    item(
      "tags",
      "Tags added",
      post.tags.length > 0,
      "Add tags for discovery and related posts.",
    ),
    item(
      "featured-image-alt",
      "Featured image alt text added",
      hasFeaturedAlt,
      "Add alt text when a featured image is set.",
    ),
    item(
      "internal-link",
      "Internal link added",
      hasInternalBlogLink(content),
      "Link to at least one related blog post when possible.",
    ),
  ];

  const completedCount = items.filter(
    (readinessItem) => readinessItem.status === "complete",
  ).length;
  const missingLabels = items
    .filter((readinessItem) => readinessItem.status === "missing")
    .map((readinessItem) => readinessItem.label);

  return {
    ready: missingLabels.length === 0,
    completedCount,
    totalCount: items.length,
    missingLabels,
    items,
  };
}
