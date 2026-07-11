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
  buildContentCalendar,
  getAdminActionItems,
  getAdminDashboardStats,
  getRecentDrafts,
  getUpcomingPosts,
} from '@/lib/admin-dashboard-insights'
import type { Post } from '@/lib/types'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  FileText,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

interface AdminOverviewProps {
  posts: Post[]
  pendingComments: number | null
  onCreatePost: () => void
  onGeneratePost: () => void
  onEditPost: (post: Post) => void
  onOpenTab: (tab: string) => void
}

function formatDateTime(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Invalid date'
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function statusClass(status: Post['status']): string {
  if (status === 'published') {
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  }
  if (status === 'scheduled') {
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
  }
  return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string
  value: string | number
  helper: string
  icon: typeof FileText
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

function QueueList({
  title,
  description,
  posts,
  empty,
  onEditPost,
}: {
  title: string
  description: string
  posts: Post[]
  empty: string
  onEditPost: (post: Post) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <button
                key={post.id}
                onClick={() => onEditPost(post)}
                className="w-full rounded-lg border border-border bg-background p-3 text-left transition-colors hover:bg-muted/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="line-clamp-1 text-sm font-medium text-foreground">
                      {post.title || 'Untitled'}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {post.category} · {formatDateTime(post.updatedAt || post.publishedAt)}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs ${statusClass(post.status)}`}>
                    {post.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function AdminOverview({
  posts,
  pendingComments,
  onCreatePost,
  onGeneratePost,
  onEditPost,
  onOpenTab,
}: AdminOverviewProps) {
  const stats = getAdminDashboardStats(posts)
  const upcomingPosts = getUpcomingPosts(posts)
  const recentDrafts = getRecentDrafts(posts)
  const calendar = buildContentCalendar(posts)
  const actionItems = getAdminActionItems(stats, pendingComments ?? 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Publishing control center
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">Admin overview</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Review content health, keep the schedule filled, and jump into the next publishing action.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onGeneratePost}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate with AI
          </Button>
          <Button onClick={onCreatePost}>
            <Edit3 className="mr-2 h-4 w-4" />
            New post
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Published"
          value={stats.published}
          helper={`${stats.total} total posts`}
          icon={CheckCircle2}
        />
        <StatCard
          label="Drafts"
          value={stats.drafts}
          helper={stats.staleDrafts ? `${stats.staleDrafts} stale draft(s)` : 'Ready for review'}
          icon={FileText}
        />
        <StatCard
          label="Scheduled"
          value={stats.scheduled}
          helper={`${stats.publishingThisWeek} publishing this week`}
          icon={CalendarDays}
        />
        <StatCard
          label="Avg read time"
          value={`${stats.averageReadTime} min`}
          helper="Across all admin posts"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recommended actions</CardTitle>
            <CardDescription>What needs attention before the next post goes live.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {actionItems.length === 0 ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-300">
                Content pipeline looks healthy. Keep one draft and one scheduled post ready.
              </div>
            ) : (
              <ul className="space-y-3">
                {actionItems.map((item) => (
                  <li key={item} className="flex gap-3 rounded-lg border border-border bg-background p-3 text-sm">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenTab('comments')}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Comments {pendingComments === null ? '' : `(${pendingComments})`}
              </Button>
              <Button variant="outline" size="sm" onClick={() => onOpenTab('analytics')}>
                View analytics
              </Button>
              <Button variant="outline" size="sm" onClick={() => onOpenTab('ai')}>
                AI settings
              </Button>
            </div>
          </CardContent>
        </Card>

        <QueueList
          title="Upcoming schedule"
          description="Next scheduled posts in publish order."
          posts={upcomingPosts}
          empty="No scheduled posts yet."
          onEditPost={onEditPost}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <QueueList
          title="Recent drafts"
          description="Drafts that are closest to ready."
          posts={recentDrafts}
          empty="No drafts in progress."
          onEditPost={onEditPost}
        />

        <Card>
          <CardHeader>
            <CardTitle>14-day content calendar</CardTitle>
            <CardDescription>Published and scheduled posts by day.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {calendar.map((day) => (
                <div
                  key={day.date}
                  className={`min-h-28 rounded-lg border p-3 ${
                    day.isToday ? 'border-primary/40 bg-primary/5' : 'border-border bg-background'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{day.label}</p>
                    {day.isToday && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        Today
                      </span>
                    )}
                  </div>
                  {day.posts.length === 0 ? (
                    <p className="mt-4 text-xs text-muted-foreground">No content planned.</p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {day.posts.map((post) => (
                        <button
                          key={post.id}
                          onClick={() => {
                            const fullPost = posts.find((candidate) => candidate.id === post.id)
                            if (fullPost) onEditPost(fullPost)
                          }}
                          className="w-full rounded-md bg-muted/70 p-2 text-left text-xs transition-colors hover:bg-muted"
                        >
                          <p className="line-clamp-2 font-medium text-foreground">
                            {post.title || 'Untitled'}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            {post.category} · {post.status}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
