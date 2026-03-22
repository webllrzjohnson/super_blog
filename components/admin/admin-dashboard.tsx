'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PostList } from '@/components/admin/post-list'
import { PostEditor } from '@/components/admin/post-editor'
import { getPosts, savePost, deletePost, generateId } from '@/lib/store'
import { defaultAuthor, calculateReadTime } from '@/lib/posts'
import type { Post } from '@/lib/types'
import { LogOut, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface AdminDashboardProps {
  onLogout: () => void
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPosts()
      .then(setPosts)
      .catch((err) => {
        toast.error('Failed to load posts', { description: err.message })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleCreateNew = () => {
    const newPost: Post = {
      id: generateId(),
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'Life',
      tags: [],
      author: defaultAuthor,
      publishedAt: new Date().toISOString().split('T')[0],
      readTime: 1,
      status: 'draft',
    }
    setEditingPost(newPost)
    setIsCreating(true)
  }

  const handleEdit = (post: Post) => {
    setEditingPost(post)
    setIsCreating(false)
  }

  const handleSave = async (post: Post) => {
    const updatedPost = {
      ...post,
      readTime: calculateReadTime(post.content),
      updatedAt: new Date().toISOString().split('T')[0],
    }
    try {
      await savePost(updatedPost)
      setPosts(await getPosts())
      setEditingPost(null)
      setIsCreating(false)
      toast.success('Post saved successfully')
    } catch (err) {
      toast.error('Failed to save', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    try {
      await deletePost(id)
      setPosts(await getPosts())
      toast.success('Post deleted')
    } catch (err) {
      toast.error('Failed to delete', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  const handleCancel = () => {
    setEditingPost(null)
    setIsCreating(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading posts...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            {!editingPost && (
              <Button onClick={handleCreateNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {editingPost ? (
          <PostEditor
            post={editingPost}
            isNew={isCreating}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <PostList
            posts={posts}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  )
}
