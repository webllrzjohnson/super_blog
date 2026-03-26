'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  BOOKMARKS_STORAGE_KEY,
  parseBookmarkSlugs,
  serializeBookmarkSlugs,
} from '@/lib/bookmarks'
import { isBookmarkSyncClientConfigured, mergeBookmarkSlugs } from '@/lib/bookmarks-sync'
import {
  getOrCreateVisitorDeviceId,
  VISITOR_DEVICE_HEADER,
} from '@/lib/visitor-device-id'

type BookmarksContextValue = {
  /** Slugs in bookmark order (oldest → newest). */
  slugs: string[]
  hydrated: boolean
  syncEnabled: boolean
  toggleBookmark: (slug: string) => void
  isBookmarked: (slug: string) => boolean
  removeBookmark: (slug: string) => void
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null)

const SYNC_DEBOUNCE_MS = 800

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [syncEnabled, setSyncEnabled] = useState(false)
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pushToServer = useCallback(async (next: string[]) => {
    if (!isBookmarkSyncClientConfigured()) return
    const vid = getOrCreateVisitorDeviceId()
    if (!vid) return
    try {
      await fetch('/api/bookmarks/sync', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          [VISITOR_DEVICE_HEADER]: vid,
        },
        body: JSON.stringify({ slugs: next }),
      })
    } catch {
      // best-effort
    }
  }, [])

  const scheduleSync = useCallback(
    (next: string[]) => {
      if (!isBookmarkSyncClientConfigured() || !syncEnabled) return
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
      syncTimerRef.current = setTimeout(() => {
        syncTimerRef.current = null
        void pushToServer(next)
      }, SYNC_DEBOUNCE_MS)
    },
    [pushToServer, syncEnabled]
  )

  useEffect(() => {
    const raw =
      typeof window !== 'undefined'
        ? window.localStorage.getItem(BOOKMARKS_STORAGE_KEY)
        : null
    const local = parseBookmarkSlugs(raw)
    queueMicrotask(() => {
      setSlugs(local)
      setHydrated(true)
    })

    if (!isBookmarkSyncClientConfigured()) {
      return
    }

    const vid = getOrCreateVisitorDeviceId()
    if (!vid) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/bookmarks/sync', {
          headers: { [VISITOR_DEVICE_HEADER]: vid },
        })
        if (!res.ok || cancelled) return
        const data = (await res.json()) as { enabled?: boolean; slugs?: string[] }
        if (!data.enabled) {
          if (!cancelled) setSyncEnabled(false)
          return
        }
        if (cancelled) return
        setSyncEnabled(true)
        setSlugs((prev) => mergeBookmarkSlugs(prev, data.slugs ?? []))
      } catch {
        if (!cancelled) setSyncEnabled(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return
    window.localStorage.setItem(BOOKMARKS_STORAGE_KEY, serializeBookmarkSlugs(slugs))
  }, [slugs, hydrated])

  useEffect(() => {
    if (!hydrated || !syncEnabled) return
    scheduleSync(slugs)
  }, [slugs, hydrated, syncEnabled, scheduleSync])

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
      syncEnabled,
      toggleBookmark,
      isBookmarked,
      removeBookmark,
    }),
    [slugs, hydrated, syncEnabled, toggleBookmark, isBookmarked, removeBookmark]
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
