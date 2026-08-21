"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  buildIdeaGenerationSeed,
  CONTENT_IDEA_PRIORITIES,
  CONTENT_IDEA_STATUSES,
  getContentIdeaStats,
  sortContentIdeas,
  type ContentIdea,
  type ContentIdeaCategory,
  type ContentIdeaPriority,
  type ContentIdeaStatus,
} from "@/lib/content-ideas";
import { Archive, Lightbulb, Pencil, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES: ContentIdeaCategory[] = [
  "Work",
  "Life",
  "Hobbies",
  "Experience",
];

type IdeaFormState = {
  title: string;
  notes: string;
  category: ContentIdeaCategory;
  priority: ContentIdeaPriority;
  status: ContentIdeaStatus;
  targetPublishAt: string;
};

interface AdminContentIdeasProps {
  onGenerateDraft: (
    seed: ReturnType<typeof buildIdeaGenerationSeed>,
    idea: ContentIdea,
  ) => void;
}

function blankForm(): IdeaFormState {
  return {
    title: "",
    notes: "",
    category: "Work",
    priority: "medium",
    status: "idea",
    targetPublishAt: "",
  };
}

function formFromIdea(idea: ContentIdea): IdeaFormState {
  return {
    title: idea.title,
    notes: idea.notes,
    category: idea.category,
    priority: idea.priority,
    status: idea.status,
    targetPublishAt: idea.targetPublishAt
      ? idea.targetPublishAt.slice(0, 16)
      : "",
  };
}

function requestBody(form: IdeaFormState) {
  return {
    ...form,
    targetPublishAt: form.targetPublishAt
      ? new Date(form.targetPublishAt).toISOString()
      : null,
  };
}

function formatDate(value?: string | null) {
  if (!value) return "No target date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function AdminContentIdeas({ onGenerateDraft }: AdminContentIdeasProps) {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<IdeaFormState>(blankForm());

  const stats = getContentIdeaStats(ideas);
  const sortedIdeas = sortContentIdeas(ideas);

  const loadIdeas = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content-ideas", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load ideas");
      setIdeas(Array.isArray(data.ideas) ? data.ideas : []);
    } catch (err) {
      toast.error("Failed to load ideas", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIdeas();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(blankForm());
  };

  const saveIdea = async () => {
    if (!form.title.trim()) {
      toast.error("Idea title is required");
      return;
    }

    setSaving(true);
    try {
      const url = editingId
        ? `/api/content-ideas/${editingId}`
        : "/api/content-ideas";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody(form)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save idea");
      const saved = data.idea as ContentIdea;
      setIdeas((prev) => {
        const exists = prev.some((idea) => idea.id === saved.id);
        return exists
          ? prev.map((idea) => (idea.id === saved.id ? saved : idea))
          : [saved, ...prev];
      });
      toast.success(editingId ? "Idea updated" : "Idea added");
      resetForm();
    } catch (err) {
      toast.error("Failed to save idea", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  const patchIdea = async (
    idea: ContentIdea,
    patch: Partial<IdeaFormState>,
  ) => {
    const next = { ...formFromIdea(idea), ...patch };
    const res = await fetch(`/api/content-ideas/${idea.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(requestBody(next)),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to update idea");
    setIdeas((prev) =>
      prev.map((item) => (item.id === idea.id ? data.idea : item)),
    );
  };

  const archiveIdea = async (idea: ContentIdea) => {
    try {
      await patchIdea(idea, { status: "archived" });
      toast.success("Idea archived");
    } catch (err) {
      toast.error("Failed to archive idea", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const deleteIdea = async (idea: ContentIdea) => {
    if (!confirm(`Delete idea: ${idea.title}?`)) return;
    try {
      const res = await fetch(`/api/content-ideas/${idea.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to delete idea");
      setIdeas((prev) => prev.filter((item) => item.id !== idea.id));
      toast.success("Idea deleted");
    } catch (err) {
      toast.error("Failed to delete idea", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const startEdit = (idea: ContentIdea) => {
    setEditingId(idea.id);
    setForm(formFromIdea(idea));
  };

  const startGenerate = async (idea: ContentIdea) => {
    try {
      if (idea.status === "idea") {
        await patchIdea(idea, { status: "planned" });
      }
    } catch {
      // Non-blocking: generation can still proceed even if status update fails.
    }
    onGenerateDraft(buildIdeaGenerationSeed(idea), idea);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open ideas</CardDescription>
            <CardTitle>{stats.open}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Planned</CardDescription>
            <CardTitle>{stats.planned}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Generated</CardDescription>
            <CardTitle>{stats.generated}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>High priority</CardDescription>
            <CardTitle>{stats.highPriorityOpen}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            {editingId ? "Edit idea" : "Add content idea"}
          </CardTitle>
          <CardDescription>
            Capture raw ideas before they become AI drafts or scheduled posts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g. Elevator outage communication lesson"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      category: e.target.value as ContentIdeaCategory,
                    }))
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      priority: e.target.value as ContentIdeaPriority,
                    }))
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  {CONTENT_IDEA_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes/context</label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={4}
                placeholder="What happened, angle, details to include, personal lesson..."
                className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.value as ContentIdeaStatus,
                    }))
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  {CONTENT_IDEA_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Target publish date
                </label>
                <input
                  type="datetime-local"
                  value={form.targetPublishAt}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      targetPublishAt: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={saveIdea} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update idea" : "Add idea"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                Cancel edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading ideas...</p>
        ) : sortedIdeas.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No content ideas yet. Add one above to start planning.
            </CardContent>
          </Card>
        ) : (
          sortedIdeas.map((idea) => (
            <Card
              key={idea.id}
              className={idea.status === "archived" ? "opacity-70" : undefined}
            >
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {idea.title}
                      </h3>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                        {idea.category}
                      </span>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                        {idea.priority}
                      </span>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                        {idea.status}
                      </span>
                    </div>
                    {idea.notes && (
                      <p className="text-sm text-muted-foreground">
                        {idea.notes}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Target: {formatDate(idea.targetPublishAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startGenerate(idea)}
                      disabled={idea.status === "archived"}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate draft
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(idea)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => archiveIdea(idea)}
                      disabled={idea.status === "archived"}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteIdea(idea)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
