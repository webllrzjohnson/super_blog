import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import {
  getResourceFilesFromDb,
  type ResourceFileItem,
} from "@/lib/resource-files";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.maplehub.cloud";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Useful downloadable templates, notices, checklists, and guides.",
  alternates: {
    canonical: `${BASE_URL}/resources`,
  },
};

function formatBytes(bytes: number): string {
  if (!bytes) return "Download";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function groupResources(
  files: ResourceFileItem[],
): Array<[string, ResourceFileItem[]]> {
  const grouped = files.reduce<Record<string, ResourceFileItem[]>>(
    (acc, file) => {
      acc[file.category] ??= [];
      acc[file.category].push(file);
      return acc;
    },
    {},
  );
  return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
}

export default async function ResourcesPage() {
  const files = await getResourceFilesFromDb();
  const groups = groupResources(files);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
      <header className="surface-card mb-10 p-6 md:p-8">
        <p className="eyebrow mb-3">Downloads</p>
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-foreground">
          Resources
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          Useful templates, notices, checklists, and guides. These downloads are
          general examples only — review and adapt them for your own situation
          before using them.
        </p>
      </header>

      <section className="mb-10 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
        <div className="surface-card p-4">
          <p className="font-semibold text-foreground">General examples</p>
          <p className="mt-1 leading-6">
            Templates are starting points, not professional or legal advice.
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="font-semibold text-foreground">Review before use</p>
          <p className="mt-1 leading-6">
            Adapt dates, names, policies, and local requirements before sharing.
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="font-semibold text-foreground">Built from practice</p>
          <p className="mt-1 leading-6">
            Resources are meant to support clear communication and organized
            follow-up.
          </p>
        </div>
      </section>

      {groups.length === 0 ? (
        <div className="surface-card p-6 text-muted-foreground">
          No public resource files are available yet. Check back soon.
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(([category, items]) => (
            <section key={category} className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                {category}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {items.map((file) => (
                  <article
                    key={file.id}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-foreground">
                          {file.title}
                        </h3>
                        {file.description ? (
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {file.description}
                          </p>
                        ) : null}
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>{file.originalFilename}</span>
                          <span>{formatBytes(file.sizeBytes)}</span>
                        </div>
                        <Link
                          href={file.url}
                          className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
