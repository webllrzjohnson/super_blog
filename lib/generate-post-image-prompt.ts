const torontoSettings = [
  'a residential side street with older apartment buildings',
  'a downtown Toronto neighborhood skyline in the background, no specific landmarks',
  'a quiet courtyard between government-subsidized apartment buildings',
  'a Toronto streetscape near a subway entrance',
  'a laneway behind a row of Toronto apartment buildings',
  'a Toronto residential block in late afternoon light',
  'a Toronto street during a changing season, distant city skyline',
  'a Toronto apartment building exterior with a glimpse of the CN Tower in the far distance',
  'the Beaches neighborhood in Toronto, boardwalk and lakeside apartment buildings',
]

export function buildPostImagePrompt(topic: string): string {
  const setting = torontoSettings[Math.floor(Math.random() * torontoSettings.length)]

  return `${topic}. Typical government-subsidized Toronto apartment building and townhouse setting, ${setting}. Male superintendent's perspective. No speech bubbles. No text. No watermarks. No logos.
Professional anime background art, environmental storytelling, realistic scene composition, perfect perspective, Studio Ghibli inspired environmental design,
Makoto Shinkai inspired lighting and atmosphere, hand-painted illustration, ultra detailed, crisp linework, high dynamic range,
atmospheric depth, realistic reflections, volumetric lighting, sharp focus, masterpiece, award-winning background illustration,
production-quality animation background, 8k.`
}

export function buildPostImageAlt(topic: string): string {
  return topic
    ? `Anime-style illustration for a blog post about ${topic}`
    : 'Anime-style illustration of a Toronto apartment building'
}
