import Link from 'next/link'
import type { LinksSettings } from '@/lib/settings'

interface FooterProps {
  links?: LinksSettings
  siteName?: string
}

export function Footer({ links, siteName = 'Lester J.' }: FooterProps) {
  const socialLinks = [
    links?.github ? { href: links.github, label: 'GitHub' } : null,
    links?.linkedin ? { href: links.linkedin, label: 'LinkedIn' } : null,
    links?.twitter ? { href: links.twitter, label: 'Twitter/X' } : null,
    links?.contactEmail
      ? { href: `mailto:${links.contactEmail}`, label: 'Email' }
      : null,
  ].filter((item): item is { href: string; label: string } => item !== null)

  return (
    <footer className="border-t border-border/60 mt-12">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

          {/* Nav links */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link href="/blog/tags" className="hover:text-foreground transition-colors">Tags</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
            <a href="/feed" className="hover:text-foreground transition-colors">RSS</a>
          </div>

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {socialLinks.map((link) => (

                key = { link.label }
                href = { link.href }
                target = { link.href.startsWith('mailto:') ? undefined : '_blank' }
                rel = { link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer' }
                className = "hover:text-foreground transition-colors"
                >
                { link.label }
              </a>
          ))}
        </div>
          )}
      </div>

      <p className="text-sm text-muted-foreground mt-8">
        &copy; {new Date().getFullYear()} {siteName}
      </p>
    </div>
    </footer >
  )
}