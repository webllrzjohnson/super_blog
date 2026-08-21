import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SITE_NAME } from "@/lib/site-identity";

const publicCopyFiles = [
  "app/about/page.tsx",
  "app/privacy/page.tsx",
  "app/disclaimer/page.tsx",
  "app/feed/route.ts",
];

async function readPublicCopy() {
  return Promise.all(
    publicCopyFiles.map((file) =>
      readFile(path.join(process.cwd(), file), "utf8"),
    ),
  );
}

describe("public site identity and current monetization copy", () => {
  it("uses the public site name on trust pages", async () => {
    const files = await readPublicCopy();
    for (const source of files) expect(source).toContain("SITE_NAME");
    expect(SITE_NAME).toBe("The Super's Logbook");
  });

  it("does not claim active AdSense ads or Amazon Associates participation", async () => {
    const source = (await readPublicCopy()).join("\n");
    const falseClaims = [
      /we display advertisements through google adsense/i,
      /we use google adsense to display advertisements/i,
      /as an amazon associate/i,
      /participant in the amazon services llc associates program/i,
      /track affiliate purchases through amazon associates/i,
      /this website contains affiliate links/i,
    ];

    for (const claim of falseClaims) expect(source).not.toMatch(claim);
  });

  it("does not render a blanket affiliate disclosure on every article", async () => {
    const articleSource = await readFile(
      path.join(process.cwd(), "app/blog/[slug]/page.tsx"),
      "utf8",
    );
    expect(articleSource).not.toContain("AffiliateDisclosure");
  });

  it("uses shared site and author identity defaults", async () => {
    const [settingsSource, postsSource, appearanceSource, feedSource] =
      await Promise.all([
        readFile(path.join(process.cwd(), "lib/settings.ts"), "utf8"),
        readFile(path.join(process.cwd(), "lib/posts.ts"), "utf8"),
        readFile(
          path.join(process.cwd(), "components/admin/settings-appearance.tsx"),
          "utf8",
        ),
        readFile(path.join(process.cwd(), "app/feed/route.ts"), "utf8"),
      ]);

    expect(settingsSource).toContain("siteName: SITE_NAME");
    expect(postsSource).toContain("name: AUTHOR_NAME");
    expect(appearanceSource).toContain(
      "siteName: initialBranding?.siteName ?? SITE_NAME",
    );
    expect(appearanceSource).toContain(
      "displayName: initialBranding?.displayName ?? AUTHOR_NAME",
    );
    expect(feedSource).toContain("<title>${escapeXml(SITE_NAME)}</title>");
    expect(settingsSource).not.toContain("siteName: 'Lester J.'");
    expect(postsSource).not.toContain("name: 'Admin'");
    expect(appearanceSource).not.toContain(
      "siteName: initialBranding?.siteName ?? 'Lester J.'",
    );
  });

  it("describes only implemented comment moderation actions", async () => {
    const [disclaimerSource, moderationSource] = await Promise.all([
      readFile(path.join(process.cwd(), "app/disclaimer/page.tsx"), "utf8"),
      readFile(
        path.join(process.cwd(), "app/api/comments/moderate/route.ts"),
        "utf8",
      ),
    ]);

    expect(disclaimerSource).toContain("approved, or rejected");
    expect(disclaimerSource).not.toMatch(/comments may be[^.]*edited/i);
    expect(disclaimerSource).not.toMatch(/comments may be[^.]*removed/i);
    expect(moderationSource).toMatch(
      /z\.enum\(\[["']approve["'], ["']reject["']\]\)/,
    );
  });

  it("keeps analytics conditional and ad placements disabled by default", async () => {
    const [layoutSource, settingsSource, googleAdSource] = await Promise.all([
      readFile(path.join(process.cwd(), "app/layout.tsx"), "utf8"),
      readFile(path.join(process.cwd(), "lib/settings.ts"), "utf8"),
      readFile(path.join(process.cwd(), "components/google-ad.tsx"), "utf8"),
    ]);

    expect(layoutSource).toMatch(
      /NEXT_PUBLIC_ENABLE_ANALYTICS === ["']true["']/,
    );
    expect(settingsSource).toContain("slots: []");
    expect(googleAdSource).toContain("!slot?.enabled");
  });

  it("uses Resend for contact and newsletter delivery", async () => {
    const [contactSource, newsletterSource] = await Promise.all([
      readFile(path.join(process.cwd(), "app/api/contact/route.ts"), "utf8"),
      readFile(path.join(process.cwd(), "app/api/newsletter/route.ts"), "utf8"),
    ]);

    expect(contactSource).toMatch(/from ["']resend["']/);
    expect(newsletterSource).toMatch(/from ["']resend["']/);
  });
});
