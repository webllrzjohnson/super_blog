import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardCheck,
  Download,
  FileText,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import {
  getResourceFilesFromDb,
  type ResourceFileItem,
} from "@/lib/resource-files";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.maplehub.cloud";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Practical building-operation templates, checklists, and plain-language guides from The Super's Logbook.",
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

const fieldGuides = [
  {
    title: "Notice of Entry basics",
    description:
      "A plain-language walkthrough of what an NOE is, why it should be clear, and why it should never be treated like casual permission to enter a unit.",
    href: "/blog/what-is-a-notice-of-entry-noe-and-what-it-isnt",
  },
  {
    title: "Sump pump incident notes",
    description:
      "What I pay attention to when a pump alarm or basement water issue shows up: timing, photos, escalation, contractor notes, and follow-up communication.",
    href: "/blog/sump-pump-down-friday-afternoon",
  },
  {
    title: "Shared-space enforcement",
    description:
      "Why hallways, stairwells, garbage rooms, and parking areas need consistent expectations instead of one-off arguments after complaints arrive.",
    href: "/blog/scooters-in-hallway-problem",
  },
];

const quickChecklists = [
  {
    title: "Before using a template",
    items: [
      "Confirm the building's current policy and local requirements.",
      "Replace sample names, dates, unit numbers, and deadlines.",
      "Keep the tone factual, specific, and calm.",
      "Save a copy with the related work order, photo, or incident note.",
    ],
  },
  {
    title: "When documenting an issue",
    items: [
      "Write down the date, time, location, and who reported it.",
      "Separate what you saw from what someone else told you.",
      "Add photos only when appropriate and privacy-safe.",
      "Record the next step: notice, repair, contractor call, or follow-up check.",
    ],
  },
  {
    title: "When communicating with residents",
    items: [
      "Explain the practical reason for the request, not just the rule.",
      "Avoid blame when the goal is cooperation.",
      "Be consistent so the rule does not look optional.",
      "Direct urgent, legal, or safety questions to the proper official channel.",
    ],
  },
];

export default async function ResourcesPage() {
  const files = await getResourceFilesFromDb();
  const groups = groupResources(files);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
      <header className="surface-card mb-10 p-6 md:p-8">
        <p className="eyebrow mb-3">Downloads and field guides</p>
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-foreground">
          Resources for clearer building follow-up
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          This page collects practical templates, checklists, and plain-language
          notes I use to think through common building situations: notices,
          resident communication, shared-space problems, maintenance follow-up,
          and incident documentation. Everything here is a starting point, not a
          substitute for your building&apos;s policy or professional advice.
        </p>
      </header>

      <section className="mb-10 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
        <div className="surface-card p-4">
          <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
          <p className="font-semibold text-foreground">General examples</p>
          <p className="mt-1 leading-6">
            Templates are practical examples from field experience, not legal,
            safety, engineering, employment, or housing advice.
          </p>
        </div>
        <div className="surface-card p-4">
          <ClipboardCheck className="mb-3 h-5 w-5 text-primary" />
          <p className="font-semibold text-foreground">Review before use</p>
          <p className="mt-1 leading-6">
            Adapt dates, names, policies, local requirements, and approval steps
            before sharing anything with residents or staff.
          </p>
        </div>
        <div className="surface-card p-4">
          <ListChecks className="mb-3 h-5 w-5 text-primary" />
          <p className="font-semibold text-foreground">Built from practice</p>
          <p className="mt-1 leading-6">
            The goal is organized follow-up: clear records, calmer conversations,
            and fewer issues slipping through the cracks.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-5 max-w-3xl">
          <p className="eyebrow mb-2">Start here</p>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
            Practical field guides
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            These posts explain the thinking behind the templates: why clear
            notice matters, how documentation protects everyone, and how small
            shared-space issues turn into bigger building problems when nobody
            follows up consistently.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {fieldGuides.map((guide) => (
            <article key={guide.href} className="surface-card p-5">
              <h3 className="font-semibold text-foreground">{guide.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {guide.description}
              </p>
              <Link
                href={guide.href}
                className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
              >
                Read the guide →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-5 max-w-3xl">
          <p className="eyebrow mb-2">Quick checks</p>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
            Use resources with context
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            A template is only useful when the details are accurate. Before using
            any example from this page, slow down and make sure the message fits
            the actual issue, the building&apos;s process, and the people involved.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {quickChecklists.map((checklist) => (
            <article
              key={checklist.title}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h3 className="font-semibold text-foreground">
                {checklist.title}
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                {checklist.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-12 surface-card p-6 md:p-8">
        <p className="eyebrow mb-2">Downloads</p>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
          Template files
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
          Downloadable files appear here when they are ready for public use. I
          only publish resources that have enough explanation to be useful on
          their own, and each file should still be reviewed against your own
          building, lease, local rules, and internal approval process.
        </p>
      </section>

      {groups.length === 0 ? (
        <div className="surface-card p-6 text-muted-foreground">
          <h3 className="font-semibold text-foreground">No public files yet</h3>
          <p className="mt-2 leading-7">
            I am preparing public download files and will add them here once they
            include enough context to be useful. In the meantime, use the field
            guides and quick checks above as plain-language starting points for
            better documentation and follow-up.
          </p>
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
