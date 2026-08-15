import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { headers } from "next/headers";
import { getPostBySlugFromDb, getPostSummariesFromDb } from "@/lib/db-posts";
import {
  getRelatedPosts,
  getPublishedPosts,
  getAdjacentPosts,
  isPostPubliclyVisible,
} from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { GoogleAd } from "@/components/google-ad";
import { ReadingProgressBar } from "@/components/reading-progress-bar";
import { PostBookmarkButton } from "@/components/post-bookmark-button";
import { PostReactions } from "@/components/post-reactions";
import { PostComments } from "@/components/post-comments";
import { ArticleOutboundClickTracker } from "@/components/article-outbound-click-tracker";
import { getMarkdownAnchorProps } from "@/lib/markdown-link-props";
import { getSafeImageAltText } from "@/lib/image-alt";
import { Sidebar } from "@/components/sidebar";
import { isAdminSession } from "@/lib/auth-session";
import { formatPostDate } from "@/lib/post-date";

interface Props {
  params: Promise<{ slug: string }>;
}

async function hasAdminAccess(): Promise<boolean> {
  const headersList = await headers();
  return isAdminSession(headersList.get("cookie"));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlugFromDb(slug);

  if (!post) notFound();

  const isAdmin = await hasAdminAccess();
  if (!isPostPubliclyVisible(post) && !isAdmin) {
    return {
      title: "Post Not Found",
      robots: { index: false, follow: false },
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const ogImage = post.featuredImage?.startsWith("/")
    ? `${baseUrl}${post.featuredImage}`
    : post.featuredImage;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `${baseUrl}/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.tags,
      ...(ogImage && { images: [ogImage] }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export async function generateStaticParams() {
  const posts = await getPostSummariesFromDb();
  const publishedPosts = getPublishedPosts(posts);
  return publishedPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlugFromDb(slug);

  if (!post) notFound();

  const isAdmin = await hasAdminAccess();
  if (!isPostPubliclyVisible(post) && !isAdmin) notFound();

  const allPosts = await getPostSummariesFromDb();
  const settings = await getSettings();
  const publishedPosts = getPublishedPosts(allPosts);
  const relatedPosts = getRelatedPosts(post, publishedPosts);
  const { prev: older, next: newer } = getAdjacentPosts(post, allPosts);
  const recentPosts = publishedPosts.slice(0, 5);
  const allTags = [...new Set(publishedPosts.flatMap((p) => p.tags))];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  const contentBlocks = post.content.split("\n\n").filter((p) => p.trim());

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    keywords: post.tags.join(", "),
  };

  return (
    <>
      <ReadingProgressBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">
          {/* Main content */}
          <article className="surface-card overflow-hidden p-5 md:p-8">
            <GoogleAd position="top-of-content" />

            <header className="mb-10">
              {post.featuredImage && (
                <div className="relative mb-8 aspect-[3/2] w-full overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src={post.featuredImage}
                    alt={getSafeImageAltText(post.featuredImageAlt, post.title)}
                    width={1536}
                    height={1024}
                    className="h-full w-full object-cover"
                    sizes="(max-width: 768px) 100vw, 672px"
                    priority
                  />
                </div>
              )}
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                <time dateTime={post.publishedAt}>
                  {formatPostDate(post.publishedAt)}
                  {post.updatedAt && " (updated)"}
                </time>
                <span aria-hidden>·</span>
                <span>{post.readTime} min read</span>
                <span aria-hidden>·</span>
                <span>{post.category}</span>
              </div>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <h1 className="min-w-[12rem] flex-1 text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-foreground md:text-5xl">
                  {post.title}
                </h1>
                <PostBookmarkButton slug={post.slug} />
              </div>
              <p className="mb-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                {post.excerpt}
              </p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag.toLowerCase())}`}
                    className="rounded-full bg-secondary/70 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </header>

            <ArticleOutboundClickTracker postSlug={post.slug}>
              <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
                {contentBlocks.map((block, index) => {
                  const showMidAd = index === 3;
                  return (
                    <div key={index}>
                      {showMidAd && <GoogleAd position="mid-content" />}
                      <ReactMarkdown
                        components={{
                          h2: ({ children, ...props }) => {
                            const text = String(children);
                            const id = text.toLowerCase().replace(/\s+/g, "-");
                            return (
                              <h2
                                id={id}
                                className="text-2xl font-semibold tracking-[-0.02em] text-foreground mt-10 mb-4"
                                {...props}
                              >
                                {children}
                              </h2>
                            );
                          },
                          p: ({ children, ...props }) => (
                            <p
                              className="text-foreground/90 leading-relaxed mb-4"
                              {...props}
                            >
                              {children}
                            </p>
                          ),
                          a: ({ href, children }) => {
                            const props = getMarkdownAnchorProps(href, siteUrl);
                            return <a {...props}>{children}</a>;
                          },
                        }}
                      >
                        {block}
                      </ReactMarkdown>
                    </div>
                  );
                })}
              </div>
            </ArticleOutboundClickTracker>

            <GoogleAd position="end-of-article" />

            {isPostPubliclyVisible(post) && (
              <div className="mt-10 space-y-10">
                <PostReactions slug={post.slug} />
                <PostComments slug={post.slug} />
              </div>
            )}

            <hr className="my-10 border-border/60" />

            <nav className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground mb-10">
              {newer ? (
                <Link
                  href={`/blog/${newer.slug}`}
                  className="hover:text-foreground transition-colors"
                >
                  ← Newer post
                </Link>
              ) : (
                <span className="opacity-50">← Newer post</span>
              )}
              <span>•</span>
              <Link
                href="/blog/random"
                className="hover:text-foreground transition-colors"
              >
                Random post
              </Link>
              <span>•</span>
              {older ? (
                <Link
                  href={`/blog/${older.slug}`}
                  className="hover:text-foreground transition-colors"
                >
                  Older post →
                </Link>
              ) : (
                <span className="opacity-50">Older post →</span>
              )}
            </nav>

            <div className="mt-10 pt-8 border-t border-border/60">
              <Link
                href="/blog/tags"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View posts by tag →
              </Link>
            </div>

            {relatedPosts.length > 0 && (
              <section className="mt-12 pt-8 border-t border-border/60">
                <h2 className="text-lg font-medium text-foreground mb-6">
                  Related posts
                </h2>
                <div className="space-y-8">
                  {relatedPosts.map((relatedPost) => (
                    <PostCard key={relatedPost.id} post={relatedPost} />
                  ))}
                </div>
              </section>
            )}

            <div className="mt-10">
              <Link
                href="/blog"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to all posts
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <Sidebar
            recentPosts={recentPosts}
            tags={allTags}
            avatarUrl={settings.branding.avatarUrl}
            shortBio={settings.branding.shortBio}
            displayName={settings.branding.displayName}
          />
        </div>
      </div>
    </>
  );
}
