import type { Metadata } from 'next'
import Link from 'next/link'
import { Download, FileText } from 'lucide-react'
import { getResourceFilesFromDb, type ResourceFileItem } from '@/lib/resource-files'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.maplehub.cloud'

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Useful downloadable templates, notices, checklists, and guides.',
  alternates: {
    canonical: `${BASE_URL}/resources`,
  },
}

function formatBytes(bytes: number): string {
  if (!bytes) return 'Download'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`
}

function groupResources(files: ResourceFileItem[]): Array<[string, ResourceFileItem[]]> {
  const grouped = files.reduce<Record<string, ResourceFileItem[]>>((acc, file) => {
    acc[file.category] ??= []
    acc[file.category].push(file)
    return acc
  }, {})
  return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
}

export default async function ResourcesPage() {
  const files = await getResourceFilesFromDb()
  const groups = groupResources(files)

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Downloads
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">Resources</h1>
        <p className="mt-4 text-muted-foreground">
          Useful templates, notices, checklists, and guides. These downloads are general examples only — review and adapt them for your own situation before using them.
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-muted-foreground">
          No public resource files are available yet. Check back soon.
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(([category, items]) => (
            <section key={category} className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">{category}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {items.map((file) => (
                  <article key={file.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-start gap-3">
                      <FileText className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-foreground">{file.title}</h3>
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
  )
}
