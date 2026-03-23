'use client'

import { useState, useMemo, useEffect, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const initialTag = searchParams.get('tag') || ''
  
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setSearchQuery(initialSearch)
    setCurrentPage(1)
  }, [initialSearch, initialTag])

  const filteredPosts = useMemo(() => {
    let posts = getPublishedPosts(initialPosts)

    if (initialTag) {
      posts = getPostsByTag(posts, initialTag)
    }

    if (searchQuery.trim()) {
      posts = searchPosts(posts, searchQuery)
    }

    return posts
  }, [initialPosts, initialTag, searchQuery])

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  )

  return (
    <div className="space-y-10">
      {/* Minimal search */}
      <div>
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
          No posts found{initialTag ? ` for tag #${initialTag}` : ''}.
        </p>
      )}
    </div>
  )
}
