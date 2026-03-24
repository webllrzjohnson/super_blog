'use client'

import { Button } from '@/components/ui/button'
import type { Post } from '@/lib/types'
import { Edit, Trash2, Eye, EyeOff, Clock3 } from 'lucide-react'

interface PostListProps {
  posts: Post[]
  onEdit: (post: Post) => void
  onDelete: (id: string) => void
}

export function PostList({ posts, onEdit, onDelete }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts yet. Create your first post!</p>
      </div>
    )
  }

  const scheduledPosts = posts
    .filter((post) => post.status === 'scheduled')
    .sort(
      (a, b) =>
        new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    )

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        All Posts ({posts.length})
      </h2>

      {scheduledPosts.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Scheduled Queue ({scheduledPosts.length})
          </h3>
          <div className="space-y-2">
            {scheduledPosts.map((post) => (
              <div
                key={post.id}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <button
                  onClick={() => onEdit(post)}
                  className="text-foreground hover:text-muted-foreground transition-colors text-left"
                >
                  {post.title || 'Untitled'}
                </button>
                <span className="text-muted-foreground">
                  {new Date(post.publishedAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Title</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground hidden sm:table-cell">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground hidden lg:table-cell">Date</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-foreground truncate max-w-xs">
                    {post.title || 'Untitled'}
                  </p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-sm text-muted-foreground">{post.category}</span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    post.status === 'published'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : post.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {post.status === 'published' ? (
                      <Eye className="h-3 w-3" />
                    ) : post.status === 'scheduled' ? (
                      <Clock3 className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                    {post.status}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(post)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(post.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
