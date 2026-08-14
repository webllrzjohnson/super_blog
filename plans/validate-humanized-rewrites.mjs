import { readFile } from "node:fs/promises";

const slugs = [
  "heat-wave-chaos-in-the-building",
  "respecting-shared-space",
  "basement-flooding-old-townhouses",
  "scooters-in-hallway-problem",
];

const wordCount = (text) =>
  text.match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)?/g)?.length ?? 0;
const patterns = [
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
  ["negative parallelism", /\bit(?:'|’)s not just\b/i],
  ["reassurance kicker", /\band that(?:'|’)s (?:okay|fine)\b/i],
];

const report = [];
for (const slug of slugs) {
  const content = await readFile(
    new URL(`./humanized-rewrites/${slug}.md`, import.meta.url),
    "utf8",
  );
  const flags = patterns
    .filter(([, pattern]) => pattern.test(content))
    .map(([name]) => name);
  const links = content.match(/\]\(\/blog\/[a-z0-9-]+\)/gi)?.length ?? 0;
  if (!links) flags.push("missing internal link");
  const words = wordCount(content);
  if (words < 650) flags.push("under 650 words");
  report.push({ slug, words, internalLinks: links, flags });
}

console.log(JSON.stringify(report, null, 2));
if (report.some(({ flags }) => flags.length)) process.exitCode = 1;
