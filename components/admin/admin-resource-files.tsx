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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  RESOURCE_FILE_CATEGORIES,
  type ResourceFileCategory,
  type ResourceFileItem,
} from "@/lib/resource-file-types";
import { Download, FileText, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

function formatBytes(bytes: number): string {
  if (!bytes) return "Unknown size";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function AdminResourceFiles() {
  const [files, setFiles] = useState<ResourceFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ResourceFileCategory>("Template");
  const [published, setPublished] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/resource-files", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load files");
      const data = await response.json();
      setFiles(Array.isArray(data.files) ? data.files : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFiles();
  }, []);

  const uploadFile = async () => {
    if (!selectedFile) {
      toast.error("Choose a file first");
      return;
    }
    if (!title.trim()) {
      toast.error("Add a public title");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("published", String(published));

    setSaving(true);
    try {
      const response = await fetch("/api/resource-files", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to upload file");
      setFiles((prev) => [data.file, ...prev]);
      setTitle("");
      setDescription("");
      setCategory("Template");
      setPublished(true);
      setSelectedFile(null);
      const input = document.getElementById(
        "resource-file-upload",
      ) as HTMLInputElement | null;
      if (input) input.value = "";
      toast.success("Resource file uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (file: ResourceFileItem) => {
    try {
      const response = await fetch("/api/resource-files", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: file.id, published: !file.published }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to update file");
      setFiles((prev) =>
        prev.map((item) => (item.id === file.id ? data.file : item)),
      );
      toast.success(data.file.published ? "File published" : "File hidden");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update file");
    }
  };

  const deleteFile = async (file: ResourceFileItem) => {
    if (
      !confirm(
        `Remove ${file.title} from the downloads list? The uploaded file may still exist on disk.`,
      )
    )
      return;
    try {
      const response = await fetch("/api/resource-files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: file.id }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to delete file");
      setFiles((prev) => prev.filter((item) => item.id !== file.id));
      toast.success("File removed from downloads");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete file");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visitor downloads</CardTitle>
          <CardDescription>
            Upload useful public files such as lease examples, notice of entry
            templates, powerwash notices, checklists, or guides.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="resource-title">Public title</Label>
              <Input
                id="resource-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Notice of entry template"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resource-category">Category</Label>
              <select
                id="resource-category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as ResourceFileCategory)
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {RESOURCE_FILE_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="resource-description">Description</Label>
            <Textarea
              id="resource-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Short note explaining who this file helps and when to use it."
              rows={3}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="resource-file-upload">File</Label>
              <Input
                id="resource-file-upload"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.rtf"
                onChange={(event) =>
                  setSelectedFile(event.target.files?.[0] ?? null)
                }
              />
              <p className="text-xs text-muted-foreground">
                PDF, Word, Excel, TXT, CSV, or RTF. Max 10MB.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={published}
                onChange={(event) => setPublished(event.target.checked)}
              />
              Publish immediately
            </label>
          </div>
          <Button type="button" onClick={uploadFile} disabled={saving}>
            <Upload className="mr-2 h-4 w-4" />
            {saving ? "Uploading..." : "Upload resource"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded resources</CardTitle>
          <CardDescription>
            Published files appear on the public Resources page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading files...</p>
          ) : files.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No visitor files uploaded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium text-foreground">
                          {file.title}
                        </h3>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {file.category}
                        </span>
                        <span
                          className={
                            file.published
                              ? "text-xs text-green-600"
                              : "text-xs text-amber-600"
                          }
                        >
                          {file.published ? "Published" : "Hidden"}
                        </span>
                      </div>
                      {file.description ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {file.description}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {file.originalFilename} · {formatBytes(file.sizeBytes)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <a href={file.url} target="_blank" rel="noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Open
                        </a>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => togglePublished(file)}
                      >
                        {file.published ? "Hide" : "Publish"}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteFile(file)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
