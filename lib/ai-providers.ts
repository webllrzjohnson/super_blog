export const AI_TEXT_PROVIDERS = ["claude", "openai", "groq"] as const;

export type AiTextProvider = (typeof AI_TEXT_PROVIDERS)[number];

export const DEFAULT_AI_PROVIDER_ORDER: AiTextProvider[] = [
  "claude",
  "openai",
  "groq",
];

export const AI_PROVIDER_LABELS: Record<AiTextProvider, string> = {
  claude: "Claude",
  openai: "OpenAI",
  groq: "Groq",
};

export function isAiTextProvider(value: string): value is AiTextProvider {
  return AI_TEXT_PROVIDERS.includes(value as AiTextProvider);
}

export function normalizeAiProviderOrder(value: unknown): AiTextProvider[] {
  if (!Array.isArray(value)) return [...DEFAULT_AI_PROVIDER_ORDER];

  const seen = new Set<AiTextProvider>();
  const providers: AiTextProvider[] = [];

  for (const item of value) {
    if (typeof item !== "string") continue;
    if (!isAiTextProvider(item)) continue;
    if (seen.has(item)) continue;
    seen.add(item);
    providers.push(item);
  }

  for (const provider of DEFAULT_AI_PROVIDER_ORDER) {
    if (!seen.has(provider)) providers.push(provider);
  }

  return providers;
}
