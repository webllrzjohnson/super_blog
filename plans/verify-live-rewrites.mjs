import { access, readFile } from "node:fs/promises";

const baseUrl = "https://www.maplehub.cloud";
const backupPath =
  "D:/Factory/super_blog-archives/adsense-originals-2026-07-19T18-32-36-276Z.json";
const expected = [
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

await access(backupPath);
const backup = JSON.parse(await readFile(backupPath, "utf8"));
const response = await fetch(`${baseUrl}/api/posts`, { cache: "no-store" });
if (!response.ok) throw new Error(`Posts API returned ${response.status}`);
const live = await response.json();
const beforeBySlug = new Map(backup.map((post) => [post.slug, post]));
const liveBySlug = new Map(live.map((post) => [post.slug, post]));
const allowedChanges = new Set([
  "title",
  "excerpt",
  "content",
  "updatedAt",
  "readTime",
]);
const results = [];

for (const item of expected) {
  const before = beforeBySlug.get(item.slug);
  const after = liveBySlug.get(item.slug);
  if (!before || !after)
    throw new Error(`Missing backup or live post: ${item.slug}`);
  const draft = (
    await readFile(
      new URL(`./humanized-rewrites/${item.slug}.md`, import.meta.url),
      "utf8",
    )
  ).trim();
  const unexpected = [
    ...new Set([...Object.keys(before), ...Object.keys(after)]),
  ].filter(
    (key) =>
      !allowedChanges.has(key) &&
      JSON.stringify(before[key]) !== JSON.stringify(after[key]),
  );
  const page = await fetch(`${baseUrl}/blog/${item.slug}`, {
    redirect: "manual",
    cache: "no-store",
  });
  const checks = {
    title: after.title === item.title,
    excerpt: after.excerpt === item.excerpt,
    content: after.content.trim() === draft,
    pageStatus: page.status === 200,
    preservedFields: unexpected.length === 0,
  };
  if (Object.values(checks).some((value) => value !== true)) {
    throw new Error(
      `${item.slug} failed: ${JSON.stringify({ checks, unexpected })}`,
    );
  }
  results.push({ slug: item.slug, status: page.status, checks });
}

console.log(
  JSON.stringify(
    {
      backupPath,
      duplicateStillPresent: liveBySlug.has("respecting-shared-space-update"),
      posts: results,
    },
    null,
    2,
  ),
);
