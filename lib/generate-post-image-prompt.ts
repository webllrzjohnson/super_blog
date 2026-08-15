import { buildFeaturedImageAltTextFromTopic } from "@/lib/featured-image-alt";

export const TORONTO_IMAGE_SETTINGS = [
  "use the excerpt to choose the most accurate setting",
  "an everyday Toronto or Ontario scene only if it fits the story",
  "a quiet real-world location with believable lived-in details",
  "a practical indoor or outdoor setting that matches the activity",
  "a grounded personal-story scene with no generic stock-photo staging",
  "a natural setting suggested by the excerpt, not a forced city backdrop",
  "a work, home, travel, food, fitness, or outdoor setting only when the story supports it",
];

export const DEFAULT_IMAGE_PROMPT_TEMPLATE = `Story source: {{topic}}. Setting guidance: {{setting}}. No speech bubbles. No text. No watermarks. No logos.
Use the topic or excerpt as the source of truth for the setting, people, activity, mood, and objects. Only show activities, people, relationships, places, and props that are explicitly stated or strongly implied by the story source. Do not force a building, maintenance, family, child, running, camping, food, travel, or hobby scene unless the source text calls for it.
Do not literalize metaphors. If the source says emotional weight, carrying things home, feeling hollowed out, pressure, burnout, or burden, show emotional strain through posture, lighting, expression, environment, distance, paperwork, hallway/office context, or quiet body language. Do not turn those metaphors into physically carrying a person, carrying a child, carrying a heavy object, running with someone, or a family outing unless the story source explicitly says that happened.
For waste-related stories, choose the equipment from the excerpt and do not mix setups. If the story mentions a compactor room, main building garbage system, or chute-fed compactor, show Louie's actual indoor compactor room: three chute-fed compactors lined up side by side against concrete/block walls, green organic on the left, black garbage in the middle, blue recycling on the right, with large rectangular rolling receiver bins, industrial steel chute feeds above, exposed pipes/conduit, control panels, warning labels, casters, and practical maintenance-room lighting. If the story mentions townhouse bins, external bins, outdoor dumpsters, rear service areas, or parking-lot garbage areas, show large scuffed metal rolling dumpsters outdoors on pavement near fencing: rectangular steel containers with black hinged lids, small caster wheels, worn paint, rust/scuffs, white stenciled numbers, and side lifting pockets. If the story mentions a garbage chute mess, bags left by the chute, or tenant garbage on the floor, show a small apartment chute alcove with beige walls, gray tile floor, a wall-mounted stainless-steel chute door, a posted warning notice, and white plastic bags with orange drawstrings, cardboard packaging, cans, small loose recyclables, and clutter around the base of the chute. Avoid generic curbside bins, exaggerated landfill piles, dumpsters inside the compactor room, or chute-fed compactors outdoors unless the excerpt explicitly says so.
Cinematic cel-shaded editorial illustration with detailed environmental storytelling, production-quality animation background feel, strong perspective, believable real-world spaces, and lived-in documentary detail.
Use thick clean ink outlines, crisp linework, hand-painted background texture, subtle film grain, small scuffs and real-life objects, warm daylight or practical interior light, deep but readable shadows, muted natural surfaces, and a few saturated accent objects that fit the actual story.
If the main character is visible, show a light-brown-skinned adult man with a clean-shaven head, a beard, about 6 feet tall, medium build, wearing practical activity-appropriate clothing and a rugged black sports watch similar to a Garmin Epix Pro. Keep him grounded and realistic, not heroic, not childish, not overly muscular, not fashion-model polished.
Compose the scene like a still from an animated personal essay: realistic, slightly cinematic, human, specific, and story-rich, with no exaggerated fantasy, no glossy 3D render, no plastic vector look, no childish clip art, no distorted anatomy.`;

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
