import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

async function source(file: string) {
  return readFile(path.join(process.cwd(), file), "utf8");
}

describe("public utility route integrity", () => {
  it("returns notFound during metadata generation for missing posts", async () => {
    const [postPage, proxy] = await Promise.all([
      source("app/blog/[slug]/page.tsx"),
      source("proxy.ts"),
    ]);
    expect(postPage.match(/if \(!post\) notFound\(\)/g)).toHaveLength(2);
    expect(proxy).toContain("pathname.match(/^\\/blog\\/([^/]+)$/)");
    expect(proxy).toContain("getPostBySlugFromDb");
    expect(proxy).toContain("isPostPubliclyVisible");
    expect(proxy).toContain("!post || !isPostPubliclyVisible(post)");
    expect(proxy).toMatch(/new URL\(["']\/_not-found["'], request\.url\)/);
    expect(proxy).toContain("status: 404");
  });

  it("noindexes search and uncurated tag utility pages", async () => {
    const [searchPage, tagsPage] = await Promise.all([
      source("app/search/page.tsx"),
      source("app/blog/tags/page.tsx"),
    ]);
    expect(searchPage).toMatch(/robots:\s*\{\s*index:\s*false/);
    expect(tagsPage).toMatch(/robots:\s*\{\s*index:\s*false/);
    expect(tagsPage).toContain(".filter(({ posts }) => posts.length >= 2)");
  });

  it("implements random navigation as a dynamic route handler", async () => {
    await expect(
      access(path.join(process.cwd(), "app/blog/random/route.ts")),
    ).resolves.toBeUndefined();
    await expect(
      access(path.join(process.cwd(), "app/blog/random/page.tsx")),
    ).rejects.toBeTruthy();
    const randomRoute = await source("app/blog/random/route.ts");
    expect(randomRoute).toMatch(/export const dynamic = ["']force-dynamic["']/);
    expect(randomRoute).toContain("NextResponse.redirect");
    expect(randomRoute).toContain("NEXT_PUBLIC_SITE_URL");
    expect(randomRoute).toContain("https://www.maplehub.cloud");
    expect(randomRoute).not.toContain("new URL(destination, request.url)");
  });

  it("builds the human sitemap from published database posts", async () => {
    const sitemapPage = await source("app/sitemap-page/page.tsx");
    expect(sitemapPage).toContain("getPostSummariesFromDb");
    expect(sitemapPage).toContain("getPublishedPosts");
    expect(sitemapPage).not.toContain("samplePosts");
  });

  it("formats public post dates through the UTC-safe helper", async () => {
    const dateSurfaces = await Promise.all(
      [
        "app/page.tsx",
        "app/blog/[slug]/page.tsx",
        "app/search/page.tsx",
        "app/sitemap-page/page.tsx",
        "components/post-card.tsx",
      ].map(source),
    );

    for (const fileSource of dateSurfaces) {
      expect(fileSource).toContain("formatPostDate");
      expect(fileSource).not.toContain("toLocaleDateString");
    }
  });

  it("redirects the bare production host to www before route handling", async () => {
    const proxy = await source("proxy.ts");
    expect(proxy).toMatch(/request\.headers\.get\(["']x-forwarded-host["']\)/);
    expect(proxy).toMatch(/request\.headers\.get\(["']host["']\)/);
    expect(proxy).toMatch(/requestHost === ["']maplehub\.cloud["']/);
    expect(proxy).toContain("https://www.maplehub.cloud");
    expect(proxy).toContain("request.nextUrl.pathname");
    expect(proxy).toContain("request.nextUrl.search");
    expect(proxy).toContain("status: 308");
    expect(proxy).toMatch(/matcher:\s*\[\s*['"]\/\(\(\?!/);
  });
});
