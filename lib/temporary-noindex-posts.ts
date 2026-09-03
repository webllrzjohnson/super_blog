export const TEMPORARILY_NOINDEXED_POST_SLUGS = new Set([
  "psychology-behind-garbage-chaos-subsidized-housing",
  "why-harassing-building-staff-has-to-stop",
  "what-is-a-notice-of-entry-noe-and-what-it-isnt",
  "first-acupuncture-treatment-running-injury-knee-recovery",
  "the-mould-problem-dangers-resolution-and-prevention",
  "how-pest-problems-start-and-spread-in-your-home",
  "dealing-with-difficult-tenants-disputes-evictions-high-maintenance",
  "the-audit-nobody-wants-to-run",
]);

export function isTemporarilyNoindexedPost(slug: string): boolean {
  return TEMPORARILY_NOINDEXED_POST_SLUGS.has(slug.trim().toLowerCase());
}
