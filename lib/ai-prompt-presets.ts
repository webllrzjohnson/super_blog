export const AI_PROMPT_PRESETS = [
  {
    id: "building-operations-story",
    label: "Building operations story",
    description:
      "A lived-in field note about something that happened in the building.",
    instructions:
      "Write this as a first-person building operations story. Start close to the moment, include what triggered the issue, who was involved by role, what you checked, what you tried, and where it landed.",
  },
  {
    id: "tenant-communication-lesson",
    label: "Tenant communication lesson",
    description:
      "A practical communication post from a superintendent perspective.",
    instructions:
      "Focus on tenant communication. Include the hallway conversation, what was misunderstood, how you explained it, and what you would say differently next time. Keep the tone practical, not corporate.",
  },
  {
    id: "maintenance-incident-breakdown",
    label: "Maintenance incident breakdown",
    description:
      "A diagnosis/process post about equipment, building systems, or repairs.",
    instructions:
      "Structure this like a maintenance incident breakdown. Include symptoms, first checks, constraints, vendor or staff involvement, what was ruled out, and the current fix or next step.",
  },
  {
    id: "personal-reflection",
    label: "Personal reflection",
    description:
      "A more reflective post about work pressure, judgment, routines, or lessons.",
    instructions:
      "Make this more reflective and human. Keep it tied to a real work moment, but spend more time on what it made you notice, what still bothers you, and what you are still figuring out.",
  },
  {
    id: "running-lifestyle",
    label: "Running / lifestyle post",
    description: "A personal life post that still fits the blog voice.",
    instructions:
      "Write this as a personal running, food, travel, or lifestyle post. Keep the superintendent perspective in the background only if it naturally connects. Avoid forcing a work lesson.",
  },
  {
    id: "ai-coding-experiment",
    label: "AI / coding experiment",
    description: "A post about tools, automation, coding, or AI experiments.",
    instructions:
      "Write this as an AI or coding experiment note from someone who still builds software on the side. Include what you were trying to automate or test, what worked, what failed, and what you would improve next.",
  },
  {
    id: "toronto-life",
    label: "Food / Toronto life",
    description: "A Toronto life, restaurant, food, or city observation post.",
    instructions:
      "Write this as a grounded Toronto life post. Include specific sensory detail, a place or routine if provided, and keep it personal without turning it into a generic city guide.",
  },
] as const;

export type AiPromptPresetId = (typeof AI_PROMPT_PRESETS)[number]["id"];

export const DEFAULT_AI_PROMPT_PRESET_ID: AiPromptPresetId =
  "building-operations-story";

export function isAiPromptPresetId(value: string): value is AiPromptPresetId {
  return AI_PROMPT_PRESETS.some((preset) => preset.id === value);
}

export function getAiPromptPreset(value: string | undefined) {
  const id =
    value && isAiPromptPresetId(value) ? value : DEFAULT_AI_PROMPT_PRESET_ID;
  return (
    AI_PROMPT_PRESETS.find((preset) => preset.id === id) ?? AI_PROMPT_PRESETS[0]
  );
}

export function applyAiPromptPresetToContext(
  presetId: string | undefined,
  context: string,
): string {
  const preset = getAiPromptPreset(presetId);
  const trimmedContext = context.trim();
  const presetContext = [
    `Content type preset: ${preset.label}.`,
    `Preset guidance: ${preset.instructions}`,
  ].join("\n");

  return trimmedContext
    ? `${presetContext}\n\nAdditional context:\n${trimmedContext}`
    : presetContext;
}
