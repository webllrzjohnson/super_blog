// Sample blog posts (fallback when Supabase not configured)

import type { Post, Author } from './types'

export const defaultAuthor: Author = {
  name: 'Lester J.',
  avatar: '/avatar.png',
  bio: 'Writer, tinkerer, and lifelong learner based in Toronto. I write about work, life, and the things that make me curious.'
}

export const samplePosts: Post[] = [
  {
    id: '1',
    title: 'Why I Left Big Tech for a Startup',
    slug: 'why-i-left-big-tech-for-a-startup',
    excerpt: 'After five years at a major tech company, I made the leap to a 20-person startup. Here\'s what I learned about risk, growth, and finding meaning in work.',
    content: `
After five years at a major tech company, I made the leap to a 20-person startup. It wasn't an easy decision—I had stability, great benefits, and a clear career ladder. But something was missing.

## The Comfort Trap

Big tech is comfortable. Maybe too comfortable. I had a standing desk, unlimited snacks, and a salary that made my parents proud. But I realized I was optimizing for comfort rather than growth. Every day felt the same. I was a small cog in a massive machine, and my impact was measured in incremental improvements to features that millions of people would never notice.

## The Leap

When a friend told me about her startup, I was skeptical. The pay cut was significant. The risk was real. But she described something I hadn't felt in years: excitement about what she was building. That conversation planted a seed.

## What I've Learned

Three months in, I can tell you this: startup life isn't for everyone. The hours are longer. The problems are messier. There's no playbook. But there's also no bureaucracy. When I have an idea, I can build it. When something breaks, I fix it. My work matters in a tangible way.

## The Takeaway

I'm not saying everyone should leave their stable job. But if you're feeling stuck, ask yourself: am I growing, or am I just comfortable? Sometimes the scariest path is the one that leads somewhere new.

The biggest risk isn't failing at something new. It's succeeding at something that doesn't matter to you.
    `.trim(),
    category: 'Work',
    tags: ['career', 'startups', 'growth'],
    featuredImage: '/images/startup.jpg',
    author: defaultAuthor,
    publishedAt: '2026-03-15',
    readTime: 4,
    status: 'published'
  },
  {
    id: '2',
    title: 'Learning to Bake Bread Changed My Life',
    slug: 'learning-to-bake-bread-changed-my-life',
    excerpt: 'What started as a pandemic hobby became a meditation practice. Here\'s how flour, water, and patience taught me more than any self-help book.',
    content: `
I never thought I'd be the kind of person who wakes up at 6 AM to feed a sourdough starter. Yet here I am, talking to a jar of fermented flour like it's a pet.

## It Started with Boredom

Like many pandemic hobbies, bread baking started as a way to pass time. I ordered a bag of flour, watched some YouTube videos, and produced something that resembled a hockey puck. My first loaf was dense, flat, and slightly burned. I ate it anyway.

## The Learning Curve

Bread is humbling. It doesn't care about your deadlines or your ego. It rises when it's ready, not when you want it to. I learned to slow down, to watch for signs, to trust the process. Some loaves failed. Many, actually. But each failure taught me something.

## The Meditation

Now, kneading dough has become my meditation. There's something deeply satisfying about working with your hands, creating something tangible in a world of screens and notifications. The kitchen smells like warmth. The bread feeds people I love.

## More Than Bread

Bread taught me patience. It taught me that good things take time. It taught me to embrace imperfection—no two loaves are the same, and that's the beauty of it. In a world obsessed with optimization, bread reminded me that some things can't be hacked or shortcut.

## Your Turn

If you're looking for a new hobby, I can't recommend bread baking enough. Start simple. Expect failures. Enjoy the process. And when you pull that first successful loaf from the oven, you'll understand why humans have been doing this for thousands of years.
    `.trim(),
    category: 'Hobbies',
    tags: ['baking', 'hobbies', 'mindfulness'],
    featuredImage: '/images/bread.jpg',
    author: defaultAuthor,
    publishedAt: '2026-03-10',
    readTime: 4,
    status: 'published'
  },
  {
    id: '3',
    title: 'The Day I Decided to Stop Checking Email First Thing',
    slug: 'the-day-i-decided-to-stop-checking-email-first-thing',
    excerpt: 'A simple change to my morning routine transformed my productivity and mental health. It took me way too long to figure this out.',
    content: `
For years, my morning routine was the same: wake up, reach for phone, check email, feel anxious. I thought I was being productive. I was actually setting myself up for a reactive day.

## The Problem

When you start your day with email, you start your day with other people's priorities. Every message is a request, a task, a problem to solve. Before I'd even had coffee, I was already behind.

## The Change

One morning, I decided to try something different. I left my phone charging in another room. Instead of email, I made coffee, did some stretching, and spent 30 minutes on my own project. I didn't check email until 10 AM.

## The Results

That first week was hard. I felt anxious, like I was missing something important. But I wasn't. The emails were still there at 10 AM. Nothing had exploded. And I had already accomplished something meaningful before the requests started rolling in.

## Three Months Later

Now, my mornings belong to me. I write, I think, I exercise. By the time I open my inbox, I've already won the day. My productivity has increased, but more importantly, my stress has decreased. I feel in control rather than controlled.

## How to Start

You don't have to go cold turkey. Try waiting just 30 minutes before checking email. Use that time for something that matters to you. See how it feels. Your inbox will still be there. It always is.

The irony is that by ignoring urgent things temporarily, I've gotten better at handling them when I finally do.
    `.trim(),
    category: 'Life',
    tags: ['productivity', 'habits', 'wellness'],
    featuredImage: '/images/morning.jpg',
    author: defaultAuthor,
    publishedAt: '2026-03-05',
    readTime: 3,
    status: 'published'
  },
  {
    id: '4',
    title: 'What Traveling Solo Taught Me About Myself',
    slug: 'what-traveling-solo-taught-me-about-myself',
    excerpt: 'Two weeks alone in Japan forced me to confront my fears, embrace uncertainty, and discover that I\'m better company than I thought.',
    content: `
I'd always traveled with friends or family. The idea of solo travel terrified me. What if I got lost? What if I got lonely? What if I ran out of things to do? So naturally, I booked two weeks in Japan. Alone.

## The Fear

The night before my flight, I almost canceled. My excuses were creative: the timing wasn't right, I should save money, I could always go next year. But I knew these were just fear in disguise. So I went.

## The Reality

Getting lost was the best part. Without a group to defer to, I made my own decisions. I wandered into hidden temples, found a tiny ramen shop where the owner taught me how to properly eat noodles, and spent an entire afternoon in a garden just watching koi fish.

## The Loneliness

Yes, there were lonely moments. Dinners for one. Quiet evenings in small hotels. But loneliness taught me something: I'd been outsourcing my happiness to other people. Solo travel forced me to be my own company, and surprisingly, I didn't mind.

## The Growth

I returned home different. More confident. More comfortable with silence. More willing to try things alone—restaurants, movies, hikes. The trip taught me that solitude isn't the same as loneliness. It's an opportunity.

## My Advice

If solo travel scares you, that's probably a sign you should try it. Start small—a weekend trip somewhere new. Notice how you feel making decisions for yourself. Notice what you're drawn to when no one else is watching.

You might just discover that the person you've been avoiding—yourself—is pretty good company after all.
    `.trim(),
    category: 'Experience',
    tags: ['travel', 'growth', 'self-discovery'],
    featuredImage: '/images/japan.jpg',
    author: defaultAuthor,
    publishedAt: '2026-02-28',
    readTime: 4,
    status: 'published'
  },
  {
    id: '5',
    title: 'The Art of Saying No at Work',
    slug: 'the-art-of-saying-no-at-work',
    excerpt: 'I used to say yes to everything. Meetings, projects, favors. Then I burned out. Here\'s how I learned to set boundaries without feeling guilty.',
    content: `
I was the "yes" person. Need someone to take notes? Yes. Can you stay late? Yes. Want to add scope to the project? Yes. I thought saying yes made me valuable. It actually made me exhausted.

## The Breaking Point

The burnout crept up slowly, then hit all at once. I was working 60-hour weeks, my health was suffering, and I'd lost sight of why I enjoyed my job in the first place. Something had to change.

## Learning to Decline

Saying no felt impossible at first. I worried about disappointing people, missing opportunities, being seen as difficult. But I started small. "I can't make that meeting, but send me the notes." "I'm at capacity this sprint, but ask me again next month."

## The Magic Word

The secret wasn't just saying no—it was saying "not right now." This small reframe made everything easier. It's not rejection; it's prioritization. Most people understood. Many respected me more for having boundaries.

## The Results

My work improved. With fewer commitments, I could focus on what mattered. I delivered better results. I had time to think strategically instead of just reacting. And surprisingly, my relationships at work got stronger, not weaker.

## How to Start

Make a list of everything you've said yes to this week. For each item, ask: is this aligned with my priorities? If not, practice declining similar requests in the future. It feels uncomfortable at first. It gets easier. And your future self will thank you.

Remember: every yes is a no to something else. Make sure you're saying yes to the right things.
    `.trim(),
    category: 'Work',
    tags: ['career', 'boundaries', 'burnout'],
    featuredImage: '/images/work.jpg',
    author: defaultAuthor,
    publishedAt: '2026-02-20',
    readTime: 4,
    status: 'published'
  }
]

// Helper functions for filtering and searching posts
export function isPostPubliclyVisible(post: Post, now = new Date()): boolean {
  if (post.status === 'published') {
    return true
  }

  if (post.status !== 'scheduled') {
    return false
  }

  const publishAt = new Date(post.publishedAt)
  return !Number.isNaN(publishAt.getTime()) && publishAt.getTime() <= now.getTime()
}

export function getPublishedPosts(posts: Post[]): Post[] {
  return posts
    .filter((post) => isPostPubliclyVisible(post))
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
}

export function getPostsByCategory(posts: Post[], category: string): Post[] {
  return posts.filter(post => post.category === category)
}

export function getPostsByTag(posts: Post[], tag: string): Post[] {
  return posts.filter(post =>
    post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  )
}

export function getAllTags(posts: Post[]): string[] {
  const tags = new Set<string>()
  getPublishedPosts(posts).forEach(post =>
    post.tags.forEach(tag => tags.add(tag.toLowerCase()))
  )
  return Array.from(tags).sort()
}

export function getRandomPost(posts: Post[]): Post | undefined {
  const published = getPublishedPosts(posts)
  if (published.length === 0) return undefined
  return published[Math.floor(Math.random() * published.length)]
}

export function getAdjacentPosts(posts: Post[], currentSlug: string): { newer: Post | null; older: Post | null } {
  const published = getPublishedPosts(posts)
  const sorted = [...published].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
  const idx = sorted.findIndex((p) => p.slug === currentSlug)
  if (idx === -1) return { newer: null, older: null }
  return {
    newer: idx > 0 ? sorted[idx - 1] : null,
    older: idx < sorted.length - 1 ? sorted[idx + 1] : null,
  }
}

export function getPostBySlug(posts: Post[], slug: string): Post | undefined {
  return posts.find(post => post.slug === slug)
}

export function searchPosts(posts: Post[], query: string): Post[] {
  const lowercaseQuery = query.toLowerCase()
  return posts.filter(post =>
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.excerpt.toLowerCase().includes(lowercaseQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

function normalizedTagSet(tags: string[]): Set<string> {
  return new Set(tags.map((t) => t.toLowerCase()))
}

function sharedTagCount(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0
  const setA = normalizedTagSet(a)
  let n = 0
  for (const t of b) {
    if (setA.has(t.toLowerCase())) n++
  }
  return n
}

function titleTokenOverlap(titleA: string, titleB: string): number {
  const tokenize = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 2)
    )
  const A = tokenize(titleA)
  const B = tokenize(titleB)
  if (A.size === 0 || B.size === 0) return 0
  let inter = 0
  for (const w of B) {
    if (A.has(w)) inter++
  }
  return inter
}

/**
 * Relevance score for ranking related posts (higher = more related).
 * Exported for unit tests.
 */
export function scoreRelatedPost(current: Post, candidate: Post): number {
  const tags = sharedTagCount(current.tags, candidate.tags)
  const categoryMatch = current.category === candidate.category ? 1 : 0
  const titleOverlap = titleTokenOverlap(current.title, candidate.title)
  const base = tags * 12 + categoryMatch * 6 + titleOverlap * 4
  if (base === 0) return 0
  const pub = new Date(candidate.publishedAt).getTime()
  const ageMs = Date.now() - pub
  const year = 365 * 24 * 60 * 60 * 1000
  const recency = Math.max(0, Math.min(1, 1 - ageMs / year))
  return base + recency * 2
}

export function getRelatedPosts(posts: Post[], currentPost: Post, limit = 3): Post[] {
  const candidates = posts.filter(
    (post) => post.id !== currentPost.id && isPostPubliclyVisible(post)
  )

  const scored = candidates
    .map((post) => ({ post, score: scoreRelatedPost(currentPost, post) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return (
        new Date(b.post.publishedAt).getTime() - new Date(a.post.publishedAt).getTime()
      )
    })

  const result: Post[] = []
  const used = new Set<string>([currentPost.id])

  for (const { post } of scored) {
    if (result.length >= limit) break
    if (used.has(post.id)) continue
    used.add(post.id)
    result.push(post)
  }

  const fillBy = (predicate: (p: Post) => boolean) => {
    const pool = candidates
      .filter((p) => !used.has(p.id) && predicate(p))
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
    for (const p of pool) {
      if (result.length >= limit) break
      used.add(p.id)
      result.push(p)
    }
  }

  if (result.length < limit) {
    fillBy((p) => p.category === currentPost.category)
  }
  if (result.length < limit) {
    fillBy(() => true)
  }

  return result
}

export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}
