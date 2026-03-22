'use client'

import { useMemo } from 'react'

interface TableOfContentsProps {
  content: string
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => {
    const regex = /^## (.+)$/gm
    const matches: { text: string; id: string }[] = []
    let match

    while ((match = regex.exec(content)) !== null) {
      const text = match[1]
      const id = text.toLowerCase().replace(/\s+/g, '-')
      matches.push({ text, id })
    }

    return matches
  }, [content])

  if (headings.length === 0) {
    return null
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav className="mb-8">
      <p className="text-sm font-medium text-foreground mb-3">On this page</p>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li key={heading.id}>
            <button
              onClick={() => scrollToHeading(heading.id)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
