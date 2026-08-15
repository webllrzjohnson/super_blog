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

export const WASTE_PROMPT_BLOCKS = {
  dirtyChute: `Waste equipment reference: dirty garbage chute alcove. Use only because the story source mentions a chute mess, bags left by the chute, or tenant garbage on the floor. Show a small apartment chute alcove with beige walls, gray tile floor, a wall-mounted stainless-steel chute door, a posted warning notice, and tenant garbage left on the floor: white plastic bags with orange drawstrings, cardboard packaging, cans, small loose recyclables, and clutter around the base of the chute. Keep it realistic and neglected, not an exaggerated landfill. Do not show outdoor dumpsters or compactor-room equipment unless the story explicitly mentions them.`,
  compactorRoom: `Waste equipment reference: indoor chute-fed compactor room. Use only because the story source mentions a compactor room, main building garbage system, garbage room, or chute-fed compactor. Show Louie's actual setup: three chute-fed compactors lined up side by side against concrete/block walls, green organic on the left, black garbage in the middle, and blue recycling on the right. Each unit has a large rectangular rolling receiver bin, industrial steel chute feed above, exposed pipes/conduit, control panels, warning labels, casters, and practical maintenance-room lighting. Use heavy-duty square functional forms, not curbside wheelie bins or outdoor dumpsters.`,
  townhouseDumpster: `Waste equipment reference: townhouse or exterior dumpster area. Use only because the story source mentions townhouse bins, external bins, outdoor dumpsters, rear service areas, parking-lot garbage areas, or exterior garbage areas. Show large scuffed metal rolling dumpsters outdoors on pavement near fencing: rectangular steel containers with black hinged lids, small caster wheels, worn paint, rust/scuffs, white stenciled numbers, and side lifting pockets. Do not show chute-fed compactors outdoors unless the story explicitly says so.`,
} as const;

const DIRTY_CHUTE_PATTERNS = [
  /\bdirty\s+(garbage\s+)?chute\b/i,
  /\bchute\s+(mess|area|alcove|room)\b/i,
  /\b(bags?|garbage|trash|cardboard|recycling|recyclables)\s+(left|sitting|dumped|placed)\s+(on\s+the\s+floor\s+)?(by|beside|near|around)\s+(the\s+)?chute\b/i,
  /\b(by|beside|near|around)\s+(the\s+)?chute\b/i,
  /\btenant\s+garbage\s+on\s+the\s+floor\b/i,
];

const COMPACTOR_ROOM_PATTERNS = [
  /\bcompactor\s+(room|rooms|area|areas)\b/i,
  /\b(chute[-\s]?fed\s+)?compactors?\b/i,
  /\bmain\s+building\s+garbage\s+system\b/i,
  /\bgarbage\s+room\b/i,
];

const TOWNHOUSE_DUMPSTER_PATTERNS = [
  /\btown\s*house\b/i,
  /\btownhouse\b/i,
  /\bexternal\s+(bins?|dumpsters?)\b/i,
  /\boutdoor\s+(bins?|dumpsters?|garbage)\b/i,
  /\b(rear\s+service|parking[-\s]?lot|exterior)\s+(area|garbage|bins?|dumpsters?)\b/i,
  /\bdumpsters?\b/i,
];

export const DEFAULT_IMAGE_PROMPT_TEMPLATE = `Story source: {{topic}}. Setting guidance: {{setting}}. No speech bubbles. No text. No watermarks. No logos.
Use the topic or excerpt as the source of truth for the setting, people, activity, mood, and objects. Only show activities, people, relationships, places, and props that are explicitly stated or strongly implied by the story source. Do not force a building, maintenance, family, child, running, camping, food, travel, or hobby scene unless the source text calls for it.
Do not literalize metaphors. If the source says emotional weight, carrying things home, feeling hollowed out, pressure, burnout, or burden, show emotional strain through posture, lighting, expression, environment, distance, paperwork, hallway/office context, or quiet body language. Do not turn those metaphors into physically carrying a person, carrying a child, carrying a heavy object, running with someone, or a family outing unless the story source explicitly says that happened.
{{wasteDetails}}
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

export function selectWastePromptBlock(topic: string): string {
  if (DIRTY_CHUTE_PATTERNS.some((pattern) => pattern.test(topic))) {
    return WASTE_PROMPT_BLOCKS.dirtyChute;
  }

  if (COMPACTOR_ROOM_PATTERNS.some((pattern) => pattern.test(topic))) {
    return WASTE_PROMPT_BLOCKS.compactorRoom;
  }

  if (TOWNHOUSE_DUMPSTER_PATTERNS.some((pattern) => pattern.test(topic))) {
    return WASTE_PROMPT_BLOCKS.townhouseDumpster;
  }

  return "";
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
    wasteDetails: selectWastePromptBlock(topic),
  });
}

export function buildPostImageAlt(topic: string): string {
  return buildFeaturedImageAltTextFromTopic(topic);
}
