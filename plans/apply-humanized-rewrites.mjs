import { mkdir, readFile, writeFile } from "node:fs/promises";

const baseUrl = (process.env.SITE_URL || "https://www.maplehub.cloud").replace(
  /\/$/,
  "",
);
const shouldApply = process.argv.includes("--apply");
const shouldDeleteDuplicate = process.argv.includes("--delete-duplicate");
const adminPassword = process.env.ADMIN_PASSWORD;

const rewrites = [
  {
    slug: "heat-wave-chaos-in-the-building",
    title: "The Building Wouldn't Cool Down",
    excerpt:
      "The first heat wave of summer brought messages from tenants about weak cooling. I changed a clogged filter, checked the rooftop equipment, and kept working after the easy fix was gone.",
  },
  {
    slug: "respecting-shared-space",
    title: "Someone Was Urinating in the Stairwell",
    excerpt:
      "Camera footage confirmed why the stairwell kept smelling bad. The cleanup mattered, but so did handling the conversation privately and protecting the staff member left with the mess.",
  },
  {
    slug: "basement-flooding-old-townhouses",
    title: "At Least Three Townhouse Basements Flooded in One Morning",
    excerpt:
      "Heavy rain and a blocked playground drain sent water into at least three old townhouse basements. Clearing the drain stopped the immediate problem, but waterproofing follow-up was still pending.",
  },
  {
    slug: "scooters-in-hallway-problem",
    title: "The Scooter in the Middle of the Hallway",
    excerpt:
      "At 7:30, I moved someone's e-scooter out of the hallway. The tire marks were annoying, but the real problem was a rider passing too close to a resident who walks with a cane.",
  },
];

const wordCount = (text) =>
  text.match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)?/g)?.length ?? 0;
const forbiddenPatterns = [
  ["em dash", /—/],
  ["duplicate markdown H1", /^#\s+\S+/m],
  ["public employer", /\b(TCHC|Toronto Community Housing(?: Corporation)?)\b/i],
  ["AI disclosure", /\b(as an ai|ai-generated)\b/i],
  [
    "formulaic closer",
    /^##\s+(final thoughts|conclusion|the takeaway|practical takeaway)\s*$/im,
  ],
  [
    "AI vocabulary",
    /\b(crucial|pivotal|underscor(?:e|es|ed|ing)|delve|tapestry|landscape)\b/i,
  ],
  [
    "chatbot signpost",
    /\b(let's dive|let's explore|here's what you need to know|in conclusion)\b/i,
  ],
];

async function getPublicPosts() {
  const response = await fetch(`${baseUrl}/api/posts`, { cache: "no-store" });
  if (!response.ok)
    throw new Error(`Could not fetch public posts: ${response.status}`);
  return response.json();
}

async function login() {
  if (!adminPassword)
    throw new Error("ADMIN_PASSWORD is required with --apply");
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: adminPassword }),
    redirect: "manual",
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Admin login failed (${response.status}): ${body}`);
  }
  const setCookie = response.headers.get("set-cookie");
  if (!setCookie)
    throw new Error("Admin login did not return a session cookie");
  return setCookie.split(";", 1)[0];
}

const livePosts = await getPublicPosts();
const liveBySlug = new Map(livePosts.map((post) => [post.slug, post]));
const updates = [];

for (const rewrite of rewrites) {
  const live = liveBySlug.get(rewrite.slug);
  if (!live) throw new Error(`Published post not found: ${rewrite.slug}`);
  const content = await readFile(
    new URL(`./humanized-rewrites/${rewrite.slug}.md`, import.meta.url),
    "utf8",
  );
  const flags = forbiddenPatterns
    .filter(([, pattern]) =>
      pattern.test(`${rewrite.title}\n${rewrite.excerpt}\n${content}`),
    )
    .map(([name]) => name);
  if (wordCount(content) < 650) flags.push("under 650 words");
  if (!/\]\(\/blog\/[a-z0-9-]+\)/i.test(content))
    flags.push("missing internal link");
  if (flags.length)
    throw new Error(`${rewrite.slug} failed validation: ${flags.join(", ")}`);

  updates.push({
    ...live,
    title: rewrite.title,
    excerpt: rewrite.excerpt,
    content,
  });
}

console.log(`Validated ${updates.length} humanized rewrites:`);
for (const post of updates)
  console.log(`- ${post.slug}: ${wordCount(post.content)} words`);

if (!shouldApply) {
  console.log(
    "\nDry run only. Use --apply with ADMIN_PASSWORD to update production.",
  );
} else {
  const archiveDirectory = new URL(
    "../../super_blog-archives/",
    import.meta.url,
  );
  await mkdir(archiveDirectory, { recursive: true });
  const backupUrl = new URL(
    `adsense-originals-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
    archiveDirectory,
  );
  const backupSlugs = new Set([
    ...rewrites.map(({ slug }) => slug),
    "respecting-shared-space-update",
  ]);
  await writeFile(
    backupUrl,
    `${JSON.stringify(
      livePosts.filter(({ slug }) => backupSlugs.has(slug)),
      null,
      2,
    )}\n`,
    "utf8",
  );
  console.log(
    `Saved original-post backup: ${decodeURIComponent(backupUrl.pathname)}`,
  );

  const cookie = await login();
  try {
    for (const post of updates) {
      const response = await fetch(`${baseUrl}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
        },
        body: JSON.stringify(post),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `Failed to update ${post.slug} (${response.status}): ${body}`,
        );
      }
      console.log(`Updated ${post.slug}`);
    }

    if (shouldDeleteDuplicate) {
      const oldPath = "/blog/respecting-shared-space-update";
      const canonicalPath = "/blog/respecting-shared-space";
      const redirectResponse = await fetch(`${baseUrl}${oldPath}`, {
        redirect: "manual",
      });
      const location = redirectResponse.headers.get("location");
      if (
        ![307, 308].includes(redirectResponse.status) ||
        !location?.endsWith(canonicalPath)
      ) {
        throw new Error(
          `Refusing duplicate deletion: ${oldPath} is not redirecting to ${canonicalPath}`,
        );
      }

      const duplicate = liveBySlug.get("respecting-shared-space-update");
      if (!duplicate)
        throw new Error("Duplicate post was not found before deletion");
      const response = await fetch(`${baseUrl}/api/posts/${duplicate.id}`, {
        method: "DELETE",
        headers: { Cookie: cookie },
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `Failed to delete duplicate (${response.status}): ${body}`,
        );
      }
      console.log(
        "Deleted respecting-shared-space-update after verifying its permanent redirect",
      );
    }

    const verifiedPosts = await getPublicPosts();
    const verifiedBySlug = new Map(
      verifiedPosts.map((post) => [post.slug, post]),
    );
    for (const expected of updates) {
      const actual = verifiedBySlug.get(expected.slug);
      if (
        !actual ||
        actual.title !== expected.title ||
        actual.content.trim() !== expected.content.trim()
      ) {
        throw new Error(`Live verification failed for ${expected.slug}`);
      }
    }
    if (
      shouldDeleteDuplicate &&
      verifiedBySlug.has("respecting-shared-space-update")
    ) {
      throw new Error("Duplicate post still appears in the public API");
    }
    console.log("Live API verification passed");
  } finally {
    const response = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: cookie },
    });
    if (!response.ok) console.warn(`Admin logout returned ${response.status}`);
  }
}
