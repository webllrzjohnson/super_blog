import { buildFeaturedImageAltTextFromTopic } from "@/lib/featured-image-alt";

export const TORONTO_IMAGE_SETTINGS = [
  "a residential side street with older apartment buildings",
  "a downtown Toronto neighborhood skyline in the background, no specific landmarks",
  "a quiet courtyard between government-subsidized apartment buildings",
  "a Toronto streetscape near a subway entrance",
  "a laneway behind a row of Toronto apartment buildings",
  "a Toronto residential block in late afternoon light",
  "a Toronto street during a changing season, distant city skyline",
  "a Toronto apartment building exterior with a glimpse of the CN Tower in the far distance",
  "the Beaches neighborhood in Toronto, boardwalk and lakeside apartment buildings",
];

export const DEFAULT_IMAGE_PROMPT_TEMPLATE = `{{topic}}. Toronto apartment building or townhouse setting, {{setting}}. Building superintendent's ground-level perspective. No speech bubbles. No text. No watermarks. No logos.
Cinematic cel-shaded editorial illustration with detailed environmental storytelling, production-quality animation background feel, strong architectural perspective, believable stairs, doors, hallways, railings, service rooms, sidewalks, or building interiors.
Use thick clean ink outlines, crisp linework, hand-painted background texture, subtle film grain, small scuffs and lived-in marks, warm daylight or practical interior light, deep but readable shadows, muted cream/green/gray building surfaces, and saturated accent objects such as blue doors, garbage bags, safety signs, tools, notices, boxes, or maintenance supplies.
Compose the scene like a still from an animated building-operations story: grounded, realistic, slightly cinematic, human but not cute, detailed enough to feel specific, with no exaggerated fantasy, no glossy 3D render, no plastic vector look, no childish clip art, no distorted anatomy.`;

function applyTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template,
  );
}

export function buildPostImagePrompt(
  topic: string,
  templateOverride?: string,
): string {
  const setting =
    TORONTO_IMAGE_SETTINGS[
      Math.floor(Math.random() * TORONTO_IMAGE_SETTINGS.length)
    ];
  const template = templateOverride?.trim() || DEFAULT_IMAGE_PROMPT_TEMPLATE;

  return applyTemplate(template, {
    topic,
    setting,
  });
}

export function buildPostImageAlt(topic: string): string {
  return buildFeaturedImageAltTextFromTopic(topic);
}
