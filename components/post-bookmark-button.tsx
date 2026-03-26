'use client'

import { useEffect, useState } from 'react'
import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBookmarks } from '@/components/bookmarks-provider'

interface PostBookmarkButtonProps {
  slug: string
  /** Larger tap target on post header */
  variant?: 'default' | 'icon'
}

export function PostBookmarkButton({ slug, variant = 'default' }: PostBookmarkButtonProps) {
  const [mounted, setMounted] = useState(false)
  const { hydrated, isBookmarked, toggleBookmark } = useBookmarks()
  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true)
    })
  }, [])

  if (!mounted) {
    return (
      <span
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md h-8 px-3 shrink-0 opacity-50 border bg-background shadow-xs text-sm font-medium"
        aria-hidden
      >
        Bookmark
      </span>
    )
  }

  const saved = hydrated && isBookmarked(slug)
  const pending = !hydrated

  if (variant === 'icon') {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-muted-foreground hover:text-foreground"
        disabled={pending}
        aria-busy={pending || undefined}
        aria-pressed={!pending && saved ? true : undefined}
        aria-label={pending ? 'Loading bookmark state' : saved ? 'Remove bookmark' : 'Bookmark this post'}
        onClick={() => {
          if (pending) return
          toggleBookmark(slug)
        }}
      >
        <Bookmark className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="shrink-0 gap-2"
      disabled={pending}
      aria-busy={pending || undefined}
      aria-pressed={!pending && saved ? true : undefined}
      aria-label={pending ? 'Loading bookmark state' : saved ? 'Remove bookmark' : 'Bookmark this post'}
      onClick={() => {
        if (pending) return
        toggleBookmark(slug)
      }}
    >
      <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
      {!pending && saved ? 'Saved' : 'Bookmark'}
    </Button>
  )
}

