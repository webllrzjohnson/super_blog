import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { defaultAuthor } from '@/lib/posts'
import { getSetting } from '@/lib/settings'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about me, what I write about, and how to connect.',
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
}

export default async function AboutPage() {
  const [pages, links] = await Promise.all([
    getSetting('pages'),
    getSetting('links'),
  ])
  const customAbout = pages.about?.trim()

  const socialLinks = [
    links?.github ? { name: 'GitHub', href: links.github } : null,
    links?.linkedin ? { name: 'LinkedIn', href: links.linkedin } : null,
    links?.twitter ? { name: 'Twitter/X', href: links.twitter } : null,
    links?.contactEmail
      ? { name: 'Email', href: `mailto:${links.contactEmail}` }
      : null,
  ].filter((item): item is { name: string; href: string } => item !== null)

  const sameAsUrls = socialLinks
    .filter((l) => !l.href.startsWith('mailto:'))
    .map((l) => l.href)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: defaultAuthor.name,
    description: defaultAuthor.bio,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/about`,
    sameAs: sameAsUrls,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <header className="mb-12">
          <h1 className="text-3xl font-semibold text-foreground mb-4">
            About me
          </h1>
        </header>

        {customAbout ? (
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown>{customAbout}</ReactMarkdown>
          </div>
        ) : (
        <div className="space-y-8">
          {/* Profile */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 rounded-full bg-secondary shrink-0 overflow-hidden">
              {/* Add your profile image to /public and use: src="/your-photo.jpg" */}
              <Image
                src="/avatar.png"
                alt="Lester J."
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <p className="text-lg text-foreground leading-relaxed">
                Hey there! I&apos;m Lester—a software engineer by trade, a building superintendent by day, and a perpetual tinkerer at heart.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                I spent years as a full-stack developer building web apps and mobile apps, debugging production issues at odd hours, and 
                living that keyboard life. Then I made what most people would call a wild career pivot: I became a Senior Building 
                Superintendent at one of the largest subsidized housing companies in North America. Different world, same problem-solving 
                mindset—just swap the IDE for a set of tools and the standup meetings for emergency maintenance calls at 2 AM.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Engineering never really left me though. I still write code—just not full-time anymore. These days I build with AI as my 
                co-pilot, automating workflows, creating tools, and exploring what&apos;s possible when you combine years of dev experience 
                with modern AI capabilities. It keeps the brain sharp and honestly, it&apos;s some of the most fun I&apos;ve had coding.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Outside of work, life is good and full. My wife and I love exploring the city—trying new restaurants, hunting down the best 
                hidden gems, and cooking our way through cuisines we&apos;ve never attempted before. Weekends often involve something bubbling 
                on the stove or a fresh loaf of bread cooling on the counter. Baking in particular is my kind of therapy: precise, 
                patient, and deeply satisfying when it works.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We also love to travel. There&apos;s something about being somewhere completely new—navigating a foreign menu, getting 
                genuinely lost, figuring things out on the fly—that feels a lot like learning to code. Uncomfortable at first, 
                exhilarating once you find your footing.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This blog is where I bring it all together—the career lessons, the building stories, the AI experiments, the food finds, 
                the travel moments. I don&apos;t have everything figured out, but I&apos;m paying attention, and I write about what I notice. 
                Maybe some of it will be useful to you too.
              </p>
            </div>
          </div>

          {/* What I write about */}
          <section className="pt-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              What I write about
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                This blog is my space to think out loud. I write about:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong className="text-foreground">Work</strong> — career pivots, building management, AI-assisted development, and bridging the physical and digital worlds</li>
                <li><strong className="text-foreground">Life</strong> — productivity, habits, learning new skills, and navigating unconventional career paths</li>
                <li><strong className="text-foreground">Hobbies</strong> — coding experiments, automation projects, and whatever technical rabbit holes I&apos;m exploring</li>
                <li><strong className="text-foreground">Experience</strong> — lessons from managing people and properties, the realities of career transitions, and finding your own path</li>
              </ul>
              <p>
                I don&apos;t claim to have all the answers. I&apos;m just sharing what I&apos;m figuring out, 
                in case it helps someone else who&apos;s figuring out the same things.
              </p>
            </div>
          </section>

          {/* Connect */}
          <section className="pt-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Let&apos;s connect
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                I love hearing from readers. Whether you want to say hi, share feedback, or just chat about something I wrote, 
                feel free to reach out.
              </p>
              <div className="flex flex-wrap gap-6">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact form
                </Link>
              </div>
            </div>
          </section>

          {/* Newsletter CTA */}
          <section className="pt-8">
            <div className="p-6 bg-secondary/50 rounded-lg">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Want updates?
              </h2>
              <p className="text-muted-foreground mb-4">
                Subscribe to my newsletter and I&apos;ll send you occasional emails when I publish something new.
              </p>
              <Link
                href="/"
                className="text-foreground font-medium hover:text-muted-foreground transition-colors"
              >
                Subscribe here →
              </Link>
            </div>
          </section>
        </div>
        )}
      </div>
    </>
  )
}
