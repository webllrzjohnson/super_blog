'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  BOOKMARKS_STORAGE_KEY,
  parseBookmarkSlugs,
  serializeBookmarkSlugs,
} from '@/lib/bookmarks'

type BookmarksContextValue = {
  /** Slugs in bookmark order (oldest → newest). */
  slugs: string[]
  hydrated: boolean
  toggleBookmark: (slug: string) => void
  isBookmarked: (slug: string) => boolean
  removeBookmark: (slug: string) => void
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null)

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const raw =
      typeof window !== 'undefined'
        ? window.localStorage.getItem(BOOKMARKS_STORAGE_KEY)
        : null
    queueMicrotask(() => {
      setSlugs(parseBookmarkSlugs(raw))
      setHydrated(true)
    })
  }, [])

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return
    window.localStorage.setItem(BOOKMARKS_STORAGE_KEY, serializeBookmarkSlugs(slugs))
  }, [slugs, hydrated])

  const toggleBookmark = useCallback((slug: string) => {
    const s = slug.trim()
    if (!s) return
    setSlugs((prev) => {
      if (prev.includes(s)) {
        return prev.filter((x) => x !== s)
      }
      return [...prev, s]
    })
  }, [])

  const removeBookmark = useCallback((slug: string) => {
    const s = slug.trim()
    if (!s) return
    setSlugs((prev) => prev.filter((x) => x !== s))
  }, [])

  const isBookmarked = useCallback(
    (slug: string) => slugs.includes(slug.trim()),
    [slugs]
  )

  const value = useMemo(
    () => ({
      slugs,
      hydrated,
      toggleBookmark,
      isBookmarked,
      removeBookmark,
    }),
    [slugs, hydrated, toggleBookmark, isBookmarked, removeBookmark]
  )

  return (
    <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>
  )
}

export function useBookmarks(): BookmarksContextValue {
  const ctx = useContext(BookmarksContext)
  if (!ctx) {
    throw new Error('useBookmarks must be used within BookmarksProvider')
  }
  return ctx
}
