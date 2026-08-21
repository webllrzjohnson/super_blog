import {
  normalizeContentIdeaInput,
  type NormalizedContentIdeaInput,
} from "@/lib/content-ideas";

const CATEGORY_HINTS: Record<string, NormalizedContentIdeaInput["category"]> = {
  life: "Life",
  work: "Work",
  hobbies: "Hobbies",
  hobby: "Hobbies",
  experience: "Experience",
};

const PRIORITY_HINTS: Record<string, NormalizedContentIdeaInput["priority"]> = {
  low: "low",
  medium: "medium",
  normal: "medium",
  high: "high",
  urgent: "high",
};

type ParsedHints = {
  title?: string;
  notes?: string;
  category?: NormalizedContentIdeaInput["category"];
  priority?: NormalizedContentIdeaInput["priority"];
  targetPublishAt?: string | null;
};

function stripLeadPrefix(value: string): string {
  return value
    .replace(/^\s*(?:blog\s+idea|idea|content\s+idea)\s*[:\-–—]?\s*/i, "")
    .trim();
}

function normalizeDate(value: string): string | null {
  const date = new Date(value.trim());
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function parseLabelLine(line: string, hints: ParsedHints): boolean {
  const match = line.match(
    /^\s*(title|idea|topic|category|priority|target|date|notes?|context)\s*:\s*(.+)$/i,
  );
  if (!match) return false;

  const key = match[1].toLowerCase();
  const value = match[2].trim();
  if (!value) return true;

  if (key === "title" || key === "idea" || key === "topic") {
    hints.title = extractInlineHints(stripLeadPrefix(value), hints);
    return true;
  }
  if (key === "category") {
    const category = CATEGORY_HINTS[value.toLowerCase()];
    if (category) hints.category = category;
    return true;
  }
  if (key === "priority") {
    const priority = PRIORITY_HINTS[value.toLowerCase()];
    if (priority) hints.priority = priority;
    return true;
  }
  if (key === "target" || key === "date") {
    hints.targetPublishAt = normalizeDate(value);
    return true;
  }
  hints.notes = value;
  return true;
}

function extractInlineHints(text: string, hints: ParsedHints): string {
  let title = text;

  title = title.replace(
    /\s+#(life|work|hobbies|hobby|experience)\b/gi,
    (_match, raw: string) => {
      const category = CATEGORY_HINTS[String(raw).toLowerCase()];
      if (category) hints.category = category;
      return "";
    },
  );

  title = title.replace(
    /\s+priority\s*:\s*(low|medium|normal|high|urgent)\b/gi,
    (_match, raw: string) => {
      const priority = PRIORITY_HINTS[String(raw).toLowerCase()];
      if (priority) hints.priority = priority;
      return "";
    },
  );

  title = title.replace(/\s+notes?\s*:\s*(.+)$/i, (_match, raw: string) => {
    hints.notes = String(raw).trim();
    return "";
  });

  title = title.replace(
    /\s+target\s*:\s*([^\s].*?)(?=\s+(?:notes?|priority|#)|$)/i,
    (_match, raw: string) => {
      hints.targetPublishAt = normalizeDate(String(raw).trim());
      return "";
    },
  );

  return title.trim();
}

export function parseTelegramIdeaCapture(
  message: string,
): NormalizedContentIdeaInput {
  const hints: ParsedHints = {};
  const lines = message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const unlabelled: string[] = [];
  for (const line of lines) {
    if (!parseLabelLine(line, hints)) {
      unlabelled.push(line);
    }
  }

  if (!hints.title && unlabelled.length > 0) {
    hints.title = extractInlineHints(stripLeadPrefix(unlabelled[0]), hints);
  }

  if (!hints.notes && unlabelled.length > 1) {
    hints.notes = unlabelled.slice(1).join("\n");
  }

  const normalized = normalizeContentIdeaInput({
    title: hints.title ?? "",
    notes: hints.notes ?? "",
    category: hints.category,
    priority: hints.priority,
    status: "idea",
    targetPublishAt: hints.targetPublishAt ?? null,
  });

  if (!normalized.title) {
    throw new Error("Idea title is required");
  }

  return normalized;
}
