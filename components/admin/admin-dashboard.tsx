'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PostList } from '@/components/admin/post-list'
import { PostEditor } from '@/components/admin/post-editor'
import { SettingsLinks } from '@/components/admin/settings-links'
import { SettingsAppearance } from '@/components/admin/settings-appearance'
import { SettingsAds } from '@/components/admin/settings-ads'
import { SettingsPages } from '@/components/admin/settings-pages'
import { SettingsAccount } from '@/components/admin/settings-account'
import { getPosts, savePost, deletePost, generateId } from '@/lib/store'
import { defaultAuthor, calculateReadTime } from '@/lib/posts'
import type { Post } from '@/lib/types'
import type { SettingsMap } from '@/lib/settings'
import { LogOut, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface AdminDashboardProps {
  onLogout: () => void
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [settings, setSettings] = useState<SettingsMap | null>(null)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getPosts().then(setPosts),
      fetch('/api/settings', { credentials: 'include' })
        .then(async (response) => {
          if (!response.ok) {
            const data = await response.json().catch(() => ({}))
            throw new Error(data.error || 'Failed to load settings')
          }

          return response.json()
        })
        .then(setSettings),
    ])
      .catch((err) => {
        toast.error('Failed to load dashboard', {
          description: err instanceof Error ? err.message : 'Unknown error',
        })
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
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            {activeTab === 'posts' && !editingPost && (
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-6">
          <TabsList className="h-auto w-full justify-start overflow-x-auto p-1">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="ads">Ads</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
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
          </TabsContent>

          <TabsContent value="links">
            <SettingsLinks initialValue={settings?.links} />
          </TabsContent>

          <TabsContent value="appearance">
            <SettingsAppearance
              initialBranding={settings?.branding}
              initialAppearance={settings?.appearance}
            />
          </TabsContent>

          <TabsContent value="ads">
            <SettingsAds initialValue={settings?.ads} />
          </TabsContent>

          <TabsContent value="pages">
            <SettingsPages initialValue={settings?.pages} />
          </TabsContent>

          <TabsContent value="account">
            <SettingsAccount />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
