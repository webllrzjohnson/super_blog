import { readFile } from "node:fs/promises";

const packagePath = new URL(
  "./adsense-short-post-rewrites.json",
  import.meta.url,
);
const proposed = JSON.parse(await readFile(packagePath, "utf8"));
const response = await fetch("https://www.maplehub.cloud/api/posts");
if (!response.ok)
  throw new Error(`Could not fetch live posts: ${response.status}`);
const livePosts = await response.json();
const liveBySlug = new Map(livePosts.map((post) => [post.slug, post]));

const wordCount = (text) =>
  text.match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)?/g)?.length ?? 0;
const aiPatterns = [
  /\bas an ai\b/i,
  /\bai-generated\b/i,
  /\bin conclusion\b/i,
  /\bit is important to note\b/i,
  /\bdelve\b/i,
  /\bcrucial\b/i,
  /\bpivotal\b/i,
  /\bunderscor(?:e|es|ed|ing)\b/i,
  /\blandscape\b/i,
  /\bat the end of the day\b/i,
  /\bwhat really matters\b/i,
  /\bthe real question is\b/i,
  /\bnot just\b/i,
  /\bit's not just\b/i,
  /\bhere's what you need to know\b/i,
  /\blet's (?:dive|explore|break)\b/i,
];

const report = proposed.map((entry) => {
  const live = liveBySlug.get(entry.slug);
  if (!live && entry.recommendedAction !== "consolidate") {
    throw new Error(`Live post missing: ${entry.slug}`);
  }

  const content = entry.proposedContent || "";
  const flags = [];
  if (!live && entry.recommendedAction === "consolidate") {
    flags.push("retired duplicate missing from live API");
  }
  if (/^#\s+\S+/m.test(content)) flags.push("duplicate markdown H1");
  if (content.includes("—")) flags.push("em dash");
  if (/\b(TCHC|Toronto Community Housing(?: Corporation)?)\b/i.test(content))
    flags.push("public employer name");
  for (const pattern of aiPatterns) {
    if (pattern.test(content)) flags.push(`AI phrase: ${pattern.source}`);
  }
  if (entry.recommendedAction !== "consolidate" && wordCount(content) < 700)
    flags.push("under 700 words");
  if (
    entry.recommendedAction !== "consolidate" &&
    !/\]\(\/blog\/[a-z0-9-]+\)/i.test(content)
  )
    flags.push("missing internal link");

  return {
    slug: entry.slug,
    action: entry.recommendedAction,
    liveWords: wordCount(live?.content || ""),
    proposedWords: wordCount(content),
    proposedTitle: entry.proposedTitle,
    flags,
  };
});

console.log(JSON.stringify(report, null, 2));
if (
  report.some((entry) =>
    entry.flags.some(
      (flag) => flag !== "retired duplicate missing from live API",
    ),
  )
) {
  process.exitCode = 1;
}
