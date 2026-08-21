import type { Post } from "@/lib/types";

export const CONTENT_IDEA_STATUSES = [
  "idea",
  "planned",
  "generated",
  "published",
  "archived",
] as const;
export const CONTENT_IDEA_PRIORITIES = ["low", "medium", "high"] as const;

export type ContentIdeaStatus = (typeof CONTENT_IDEA_STATUSES)[number];
export type ContentIdeaPriority = (typeof CONTENT_IDEA_PRIORITIES)[number];
export type ContentIdeaCategory = Post["category"];

export interface ContentIdea {
  id: string;
  title: string;
  notes: string;
  category: ContentIdeaCategory;
  priority: ContentIdeaPriority;
  status: ContentIdeaStatus;
  targetPublishAt?: string | null;
  generatedPostId?: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export interface ContentIdeaInput {
  title?: unknown;
  notes?: unknown;
  category?: unknown;
  priority?: unknown;
  status?: unknown;
  targetPublishAt?: unknown;
}

export interface NormalizedContentIdeaInput {
  title: string;
  notes: string;
  category: ContentIdeaCategory;
  priority: ContentIdeaPriority;
  status: ContentIdeaStatus;
  targetPublishAt: string | null;
}

export interface ContentIdeaStats {
  total: number;
  open: number;
  idea: number;
  planned: number;
  generated: number;
  published: number;
  archived: number;
  highPriorityOpen: number;
}

const CATEGORIES: ContentIdeaCategory[] = [
  "Life",
  "Work",
  "Hobbies",
  "Experience",
];
const PRIORITY_RANK: Record<ContentIdeaPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function isCategory(value: unknown): value is ContentIdeaCategory {
  return (
    typeof value === "string" &&
    CATEGORIES.includes(value as ContentIdeaCategory)
  );
}

function isPriority(value: unknown): value is ContentIdeaPriority {
  return (
    typeof value === "string" &&
    CONTENT_IDEA_PRIORITIES.includes(value as ContentIdeaPriority)
  );
}

function isStatus(value: unknown): value is ContentIdeaStatus {
  return (
    typeof value === "string" &&
    CONTENT_IDEA_STATUSES.includes(value as ContentIdeaStatus)
  );
}

function normalizeOptionalIso(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function normalizeContentIdeaInput(
  input: ContentIdeaInput,
): NormalizedContentIdeaInput {
  return {
    title: typeof input.title === "string" ? input.title.trim() : "",
    notes: typeof input.notes === "string" ? input.notes.trim() : "",
    category: isCategory(input.category) ? input.category : "Work",
    priority: isPriority(input.priority) ? input.priority : "medium",
    status: isStatus(input.status) ? input.status : "idea",
    targetPublishAt: normalizeOptionalIso(input.targetPublishAt),
  };
}

export function getContentIdeaStats(ideas: ContentIdea[]): ContentIdeaStats {
  const stats: ContentIdeaStats = {
    total: ideas.length,
    open: 0,
    idea: 0,
    planned: 0,
    generated: 0,
    published: 0,
    archived: 0,
    highPriorityOpen: 0,
  };

  for (const item of ideas) {
    stats[item.status] += 1;
    if (item.status !== "archived" && item.status !== "published") {
      stats.open += 1;
      if (item.priority === "high") stats.highPriorityOpen += 1;
    }
  }

  return stats;
}

export function sortContentIdeas(ideas: ContentIdea[]): ContentIdea[] {
  return [...ideas].sort((a, b) => {
    const aArchived = a.status === "archived" ? 1 : 0;
    const bArchived = b.status === "archived" ? 1 : 0;
    if (aArchived !== bArchived) return aArchived - bArchived;

    const priority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (priority !== 0) return priority;

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function buildIdeaGenerationSeed(idea: ContentIdea) {
  const metadata = [`Category: ${idea.category}`];
  if (idea.targetPublishAt) {
    metadata.push(
      `Target publish date: ${new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(idea.targetPublishAt))}`,
    );
  }
  const contextParts = [idea.notes.trim(), metadata.join("\n")].filter(Boolean);

  return {
    topic: idea.title,
    context: contextParts.join("\n\n"),
    schedule: "Immediate",
  };
}
