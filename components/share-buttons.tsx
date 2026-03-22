'use client'

import { Twitter, Linkedin, Link2, Check } from 'lucide-react'
import { useState } from 'react'

interface ShareButtonsProps {
  title: string
  slug: string
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  // Use env var consistently to avoid server/client hydration mismatch
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  const url = `${baseUrl}/blog/${slug}`
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ]

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Share on ${link.name}`}
        >
          <link.icon className="h-5 w-5" />
        </a>
      ))}
      <button
        onClick={copyLink}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Copy link"
      >
        {copied ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : (
          <Link2 className="h-5 w-5" />
        )}
      </button>
    </div>
  )
}
