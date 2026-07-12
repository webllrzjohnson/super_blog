'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  auditContentQuality,
  getContentQualityStats,
  getPostsNeedingAttention,
  type ContentQualityAudit,
} from '@/lib/content-quality-audit'
import type { Post } from '@/lib/types'
import { AlertTriangle, CheckCircle2, ExternalLink, FileWarning, Link2, SearchCheck } from 'lucide-react'

interface AdminContentQualityProps {
  posts: Post[]
  onEditPost: (post: Post) => void
}

function scoreClass(score: number): string {
  if (score >= 90) return 'text-green-600 dark:text-green-400'
  if (score >= 70) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function badgeClass(audit: ContentQualityAudit): string {
  if (audit.blockers.length > 0) {
    return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
  }
  if (audit.score < 90) {
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300'
  }
  return 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'
}

function issueList(label: string, issues: string[]) {
  if (issues.length === 0) return null
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {issues.map((issue) => (
          <li key={issue} className="flex gap-2">
            <span aria-hidden="true">•</span>
            <span>{issue}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function QualityStatCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string
  value: string | number
  helper: string
  icon: typeof SearchCheck
}) {
  return (
    <Card className="gap-3 py-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-5">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="px-5">
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  )
}

export function AdminContentQuality({ posts, onEditPost }: AdminContentQualityProps) {
  const audits = posts.map((post) => auditContentQuality(post))
  const stats = getContentQualityStats(audits)
  const attention = getPostsNeedingAttention(audits, 10)
  const healthyPosts = audits.filter((audit) => audit.score >= 90 && audit.blockers.length === 0)

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          SEO and content QA
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">Content quality dashboard</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Find posts that need SEO basics, accessibility fixes, internal links, stronger excerpts, or freshness review before promotion.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QualityStatCard
          label="Average score"
          value={`${stats.averageScore}%`}
          helper="Across all admin posts"
          icon={SearchCheck}
        />
        <QualityStatCard
          label="Healthy"
          value={stats.healthy}
          helper={`${stats.total} total posts audited`}
          icon={CheckCircle2}
        />
        <QualityStatCard
          label="Needs work"
          value={stats.needsWork}
          helper="Warnings or suggestions present"
          icon={FileWarning}
        />
        <QualityStatCard
          label="Blockers"
          value={stats.blockers}
          helper="Fix before promoting/publishing"
          icon={AlertTriangle}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Posts needing attention</CardTitle>
            <CardDescription>
              Prioritized by blockers first, then lowest quality score.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attention.length === 0 ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-300">
                All posts look healthy. Keep checking new drafts before promotion.
              </div>
            ) : (
              <div className="space-y-4">
                {attention.map((audit) => (
                  <div key={audit.post.id} className="rounded-lg border border-border bg-background p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-foreground">{audit.post.title || 'Untitled'}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${badgeClass(audit)}`}>
                            {audit.blockers.length > 0 ? 'Blockers' : audit.score >= 90 ? 'Healthy' : 'Needs work'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {audit.post.category} · {audit.post.status} · {audit.post.readTime} min read
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className={`text-lg font-semibold ${scoreClass(audit.score)}`}>{audit.score}%</p>
                        <Button size="sm" variant="outline" onClick={() => onEditPost(audit.post)}>
                          Edit
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      {issueList('Blockers', audit.blockers)}
                      {issueList('Warnings', audit.warnings)}
                      {issueList('Suggestions', audit.suggestions)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What this checks</CardTitle>
            <CardDescription>Advisory checks to improve publish quality.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <SearchCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <p>SEO basics: title, slug, excerpt length, and tags.</p>
            </div>
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Accessibility blockers: featured images without alt text.</p>
            </div>
            <div className="flex gap-3">
              <Link2 className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Internal links: at least one related `/blog/...` link in the body.</p>
            </div>
            <div className="flex gap-3">
              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Freshness: published posts older than 180 days get a review suggestion.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {healthyPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Healthy posts</CardTitle>
            <CardDescription>Posts scoring 90% or higher with no blockers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {healthyPosts.slice(0, 8).map((audit) => (
                <button
                  key={audit.post.id}
                  onClick={() => onEditPost(audit.post)}
                  className="rounded-lg border border-border bg-background p-3 text-left transition-colors hover:bg-muted/60"
                >
                  <p className="line-clamp-1 text-sm font-medium text-foreground">{audit.post.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {audit.post.category} · {audit.post.status} · {audit.score}%
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
