import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import Link from "next/link";
import { Suspense } from "react";
import { BlogList } from "@/components/blog-list";
import { GoogleAd } from "@/components/google-ad";
import { Sidebar } from "@/components/sidebar";
import { getPostSummariesFromDb } from "@/lib/db-posts";
import { getPublishedPosts } from "@/lib/posts";

/** Must be a literal for Next.js segment config (see POSTS_CACHE_REVALIDATE_SECONDS). */
export const revalidate = 120;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Thoughts on work, life, hobbies, and experiences. Read all my blog posts here.",
  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
};

export default async function BlogPage() {
  const allPosts = await getPostSummariesFromDb();
  const settings = await getSettings();
  const posts = getPublishedPosts(allPosts);
  const recentPosts = posts.slice(0, 5);
  const allTags = [...new Set(posts.flatMap((p) => p.tags))];
  const browseLanes = [
    ["Building operations", "/blog?tag=building%20operations"],
    ["Superintendent life", "/blog?tag=superintendent%20life"],
    ["Running & recovery", "/blog?tag=running"],
    ["Garbage & shared spaces", "/blog?tag=garbage%20management"],
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <header className="surface-card mb-10 p-6 md:p-8">
        <p className="eyebrow mb-3">All posts</p>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
              Blog
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Field notes on building operations, AI experiments, running, food,
              and everyday life.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              {browseLanes.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/blog/random"
            className="rounded-full border border-border/70 bg-card/70 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/70"
          >
            Read a random one →
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="mb-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="surface-card p-4">
              <p className="font-semibold text-foreground">
                {posts.length} published notes
              </p>
              <p className="mt-1 leading-6">
                Longer field notes with related reading, not throwaway updates.
              </p>
            </div>
            <div className="surface-card p-4">
              <p className="font-semibold text-foreground">
                Built around real work
              </p>
              <p className="mt-1 leading-6">
                Maintenance calls, resident issues, recovery, travel, and side
                projects.
              </p>
            </div>
            <div className="surface-card p-4">
              <p className="font-semibold text-foreground">Browse or search</p>
              <p className="mt-1 leading-6">
                Use tags, search, or the random button when you just want a
                story.
              </p>
            </div>
          </div>
          <Suspense
            fallback={
              <p className="text-muted-foreground py-12 text-sm">
                Loading posts…
              </p>
            }
          >
            <BlogList
              initialPosts={posts}
              betweenPostsAd={<GoogleAd position="between-posts" />}
            />
          </Suspense>

          <div className="mt-12 pt-8 border-t border-border/60">
            <Link
              href="/blog/tags"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View posts by tag →
            </Link>
          </div>
        </div>

        <Sidebar
          recentPosts={recentPosts}
          tags={allTags}
          avatarUrl={settings.branding.avatarUrl}
          shortBio={settings.branding.shortBio}
          displayName={settings.branding.displayName}
        />
      </div>
    </div>
  );
}
