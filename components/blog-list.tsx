'use client'

import { useState, useMemo, useEffect, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PostCard } from '@/components/post-card'
import { Input } from '@/components/ui/input'
import { getPublishedPosts, searchPosts, getPostsByTag } from '@/lib/posts'
import type { Post } from '@/lib/types'

const POSTS_PER_PAGE = 15

interface BlogListProps {
  initialPosts: Post[]
  betweenPostsAd?: ReactNode
}

export function BlogList({ initialPosts, betweenPostsAd }: BlogListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const urlSearch = searchParams.get('search') || ''
  const urlTag = searchParams.get('tag') || ''
  const urlPage = Number(searchParams.get('page') || '1')
  const initialPage = Number.isNaN(urlPage) || urlPage < 1 ? 1 : urlPage
  
  const [searchQuery, setSearchQuery] = useState(urlSearch)
  const [currentPage, setCurrentPage] = useState(initialPage)

  useEffect(() => {
    setSearchQuery(urlSearch)
    setCurrentPage(initialPage)
  }, [initialPage, urlSearch])

  const filteredPosts = useMemo(() => {
    let posts = getPublishedPosts(initialPosts)

    if (urlTag) {
      posts = getPostsByTag(posts, urlTag)
    }

    if (searchQuery.trim()) {
      posts = searchPosts(posts, searchQuery)
    }

    return posts
  }, [initialPosts, searchQuery, urlTag])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim())
    } else {
      params.delete('search')
    }

    if (currentPage > 1) {
      params.set('page', String(currentPage))
    } else {
      params.delete('page')
    }

    const nextQuery = params.toString()
    const currentQuery = searchParams.toString()
    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname)
    }
  }, [currentPage, pathname, router, searchParams, searchQuery])

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  )

  useEffect(() => {
    if (totalPages === 0) return
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return (
    <div className="space-y-10">
      {/* Minimal search */}
      <div className="space-y-3">
        <Input
          type="search"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setCurrentPage(1)
          }}
          className="max-w-xs text-sm"
        />
        {(urlTag || searchQuery.trim()) && (
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>
              Filtering
              {urlTag ? ` #${urlTag}` : ''}
              {searchQuery.trim() ? ` for "${searchQuery.trim()}"` : ''}
            </span>
            <Link
              href="/blog"
              className="hover:text-foreground transition-colors underline underline-offset-4"
            >
              Clear filters
            </Link>
          </div>
        )}
      </div>

      {/* Posts - cassidoo style: just the list */}
      {paginatedPosts.length > 0 ? (
        <>
          <div className="space-y-10">
            {paginatedPosts.map((post, index) => (
              <div key={post.id} className="space-y-10">
                <PostCard post={post} />
                {betweenPostsAd && index === 0 && paginatedPosts.length > 1 ? betweenPostsAd : null}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-6 text-sm text-muted-foreground">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-muted-foreground py-12">
          No posts found{urlTag ? ` for tag #${urlTag}` : ''}.
        </p>
      )}
    </div>
  )
}
