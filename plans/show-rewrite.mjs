import { readFile } from "node:fs/promises";

const slug = process.argv[2];
if (!slug) throw new Error("Usage: node plans/show-rewrite.mjs <slug>");
const proposed = JSON.parse(
  await readFile(
    new URL("./adsense-short-post-rewrites.json", import.meta.url),
    "utf8",
  ),
);
const response = await fetch("https://www.maplehub.cloud/api/posts");
if (!response.ok)
  throw new Error(`Could not fetch live posts: ${response.status}`);
const livePosts = await response.json();
const live = livePosts.find((post) => post.slug === slug);
const rewrite = proposed.find((post) => post.slug === slug);
if (!live || !rewrite)
  throw new Error(`Missing live or proposed post: ${slug}`);
console.log("=== ORIGINAL ===\n");
console.log(live.content);
console.log("\n=== PROPOSED ===\n");
console.log(rewrite.proposedContent);
