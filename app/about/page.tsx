import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { defaultAuthor } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about me, what I write about, and how to connect.',
}

const socialLinks = [
  { name: 'Twitter', href: 'https://twitter.com', label: '@alexchen' },
  { name: 'GitHub', href: 'https://github.com', label: 'alexchen' },
  { name: 'LinkedIn', href: 'https://linkedin.com/in/alexchen', label: 'Alex Chen' },
]

export default function AboutPage() {
  // JSON-LD structured data for Person
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: defaultAuthor.name,
    description: defaultAuthor.bio,
    url: 'https://example.com/about',
    sameAs: socialLinks.map(link => link.href),
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

        <div className="space-y-8">
          {/* Profile */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 rounded-full bg-secondary shrink-0 overflow-hidden">
              {/* Add your profile image to /public and use: src="/your-photo.jpg" */}
              <Image
                src="/avatar.jpg"
                alt="Alex Chen"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <p className="text-lg text-foreground leading-relaxed">
                Hey there! I&apos;m Alex, a software engineer, writer, and chronic over-thinker based in San Francisco.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                I spent five years at a big tech company before making the leap to startup life. 
                Now I&apos;m building products at a 20-person company, learning more than I ever did in a corporate setting, 
                and writing about the journey along the way.
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
                <li><strong className="text-foreground">Work</strong> — career transitions, startup life, and what I&apos;m learning as an engineer</li>
                <li><strong className="text-foreground">Life</strong> — productivity, habits, and the ongoing experiment of being a human</li>
                <li><strong className="text-foreground">Hobbies</strong> — bread baking, reading, and whatever else I&apos;m obsessing over</li>
                <li><strong className="text-foreground">Experience</strong> — travel, relationships, and the messy parts of growing up</li>
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
                    target="_blank"
                    rel="noopener noreferrer"
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
      </div>
    </>
  )
}
