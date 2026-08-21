import type { Post } from "@/lib/types";

export type AdminDashboardStats = {
  total: number;
  published: number;
  drafts: number;
  scheduled: number;
  overdueScheduled: number;
  publishingThisWeek: number;
  staleDrafts: number;
  averageReadTime: number;
};

export type CalendarPost = Pick<
  Post,
  "id" | "title" | "slug" | "status" | "publishedAt" | "category"
>;

export type ContentCalendarDay = {
  date: string;
  label: string;
  isToday: boolean;
  posts: CalendarPost[];
};

function safeDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor(
    (startOfDay(a).getTime() - startOfDay(b).getTime()) / msPerDay,
  );
}

export function getAdminDashboardStats(
  posts: Post[],
  now: Date = new Date(),
): AdminDashboardStats {
  const published = posts.filter((post) => post.status === "published");
  const drafts = posts.filter((post) => post.status === "draft");
  const scheduled = posts.filter((post) => post.status === "scheduled");
  const nowTime = now.getTime();
  const weekAhead = nowTime + 7 * 24 * 60 * 60 * 1000;

  const overdueScheduled = scheduled.filter((post) => {
    const date = safeDate(post.publishedAt);
    return date ? date.getTime() <= nowTime : false;
  }).length;

  const publishingThisWeek = scheduled.filter((post) => {
    const date = safeDate(post.publishedAt);
    if (!date) return false;
    const time = date.getTime();
    return time > nowTime && time <= weekAhead;
  }).length;

  const staleDrafts = drafts.filter((post) => {
    const date = safeDate(post.updatedAt || post.publishedAt);
    return date ? daysBetween(now, date) >= 14 : false;
  }).length;

  const averageReadTime = posts.length
    ? Math.round(
        posts.reduce((sum, post) => sum + post.readTime, 0) / posts.length,
      )
    : 0;

  return {
    total: posts.length,
    published: published.length,
    drafts: drafts.length,
    scheduled: scheduled.length,
    overdueScheduled,
    publishingThisWeek,
    staleDrafts,
    averageReadTime,
  };
}

export function getUpcomingPosts(
  posts: Post[],
  now: Date = new Date(),
  limit = 5,
): Post[] {
  const nowTime = now.getTime();
  return posts
    .filter((post) => post.status === "scheduled")
    .filter((post) => {
      const date = safeDate(post.publishedAt);
      return date ? date.getTime() > nowTime : false;
    })
    .sort(
      (a, b) =>
        (safeDate(a.publishedAt)?.getTime() ?? 0) -
        (safeDate(b.publishedAt)?.getTime() ?? 0),
    )
    .slice(0, limit);
}

export function getRecentDrafts(posts: Post[], limit = 5): Post[] {
  return posts
    .filter((post) => post.status === "draft")
    .sort(
      (a, b) =>
        (safeDate(b.updatedAt || b.publishedAt)?.getTime() ?? 0) -
        (safeDate(a.updatedAt || a.publishedAt)?.getTime() ?? 0),
    )
    .slice(0, limit);
}

export function buildContentCalendar(
  posts: Post[],
  now: Date = new Date(),
  days = 14,
): ContentCalendarDay[] {
  const today = startOfDay(now);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const dateKey = isoDate(date);

    const dayPosts = posts
      .filter((post) => {
        const postDate = safeDate(post.publishedAt);
        return postDate ? isoDate(postDate) === dateKey : false;
      })
      .sort(
        (a, b) =>
          (safeDate(a.publishedAt)?.getTime() ?? 0) -
          (safeDate(b.publishedAt)?.getTime() ?? 0),
      )
      .map(({ id, title, slug, status, publishedAt, category }) => ({
        id,
        title,
        slug,
        status,
        publishedAt,
        category,
      }));

    return {
      date: dateKey,
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      isToday: index === 0,
      posts: dayPosts,
    };
  });
}

export function getAdminActionItems(
  stats: AdminDashboardStats,
  pendingComments: number,
): string[] {
  const items: string[] = [];

  if (pendingComments > 0) {
    items.push(
      `${pendingComments} comment${pendingComments === 1 ? "" : "s"} need moderation.`,
    );
  }
  if (stats.overdueScheduled > 0) {
    items.push(
      `${stats.overdueScheduled} scheduled post${stats.overdueScheduled === 1 ? "" : "s"} are overdue and should be reviewed.`,
    );
  }
  if (stats.drafts === 0) {
    items.push("Draft queue is empty — generate or write the next post idea.");
  }
  if (stats.scheduled === 0) {
    items.push(
      "No posts are scheduled. Add at least one future post to keep publishing consistent.",
    );
  }
  if (stats.staleDrafts > 0) {
    items.push(
      `${stats.staleDrafts} draft${stats.staleDrafts === 1 ? "" : "s"} ${
        stats.staleDrafts === 1 ? "has" : "have"
      } not changed in 14+ days.`,
    );
  }

  return items.slice(0, 5);
}
