'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PostList } from '@/components/admin/post-list'
import { PostEditor } from '@/components/admin/post-editor'
import { SettingsLinks } from '@/components/admin/settings-links'
import { SettingsAppearance } from '@/components/admin/settings-appearance'
import { SettingsAds } from '@/components/admin/settings-ads'
import { SettingsPages } from '@/components/admin/settings-pages'
import { SettingsAi } from '@/components/admin/settings-ai'
import { SettingsAccount } from '@/components/admin/settings-account'
import { AdminOutboundStats } from '@/components/admin/admin-outbound-stats'
import { AdminCommentsModeration } from '@/components/admin/admin-comments-moderation'
import { AdminOverview } from '@/components/admin/admin-overview'
import { AdminContentIdeas } from '@/components/admin/admin-content-ideas'
import { AdminContentQuality } from '@/components/admin/admin-content-quality'
import { getPosts, savePost, deletePost, generateId } from '@/lib/store'
import { defaultAuthor, calculateReadTime } from '@/lib/posts'
import type { Post } from '@/lib/types'
import type { ContentIdea } from '@/lib/content-ideas'
import type { SettingsMap } from '@/lib/settings'
import { LogOut, Plus, Home } from 'lucide-react'
import { toast } from 'sonner'
import { GeneratePostModal } from '@/components/admin/generate-post-modal'
import { Sparkles } from 'lucide-react' // already imported via lucide

interface AdminDashboardProps {
  onLogout: () => void
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [settings, setSettings] = useState<SettingsMap | null>(null)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [pendingComments, setPendingComments] = useState<number | null>(null)
  const [generateSeed, setGenerateSeed] = useState<{
    topic: string
    context: string
    schedule: string
  } | null>(null)
  const [generatingFromIdea, setGeneratingFromIdea] = useState<ContentIdea | null>(null)

  // Add to state
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  
  const upsertLocalPost = (savedPost: Post) => {
    setPosts((prev) => {
      const existingIndex = prev.findIndex((post) => post.id === savedPost.id)
      if (existingIndex === -1) {
        return [savedPost, ...prev]
      }

      const next = [...prev]
      next[existingIndex] = savedPost
      return next
    })
  }

  const openGenerateModal = () => {
    setGenerateSeed(null)
    setGeneratingFromIdea(null)
    setShowGenerateModal(true)
  }

  const handleGenerateFromIdea = (
    seed: { topic: string; context: string; schedule: string },
    idea: ContentIdea
  ) => {
    setGenerateSeed(seed)
    setGeneratingFromIdea(idea)
    setShowGenerateModal(true)
  }

  const handleGeneratedPost = async (savedPost: Post) => {
    upsertLocalPost(savedPost)
    if (!generatingFromIdea) return

    try {
      await fetch(`/api/content-ideas/${generatingFromIdea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: generatingFromIdea.title,
          notes: generatingFromIdea.notes,
          category: generatingFromIdea.category,
          priority: generatingFromIdea.priority,
          status: 'generated',
          targetPublishAt: generatingFromIdea.targetPublishAt ?? null,
          generatedPostId: savedPost.id,
        }),
      })
    } catch {
      // Non-blocking; the draft has already been saved.
    }
  }

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
      fetch('/api/comments/moderate?status=pending', { credentials: 'include' })
        .then(async (response) => {
          if (!response.ok) return null
          return response.json()
        })
        .then((data) => {
          setPendingComments(Array.isArray(data?.comments) ? data.comments.length : null)
        }),
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
      publishedAt: new Date().toISOString(),
      readTime: 1,
      status: 'draft',
    }
    setActiveTab('posts')
    setEditingPost(newPost)
    setIsCreating(true)
  }

  const handleEdit = (post: Post) => {
    setActiveTab('posts')
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
      const saved = await savePost(updatedPost)
      upsertLocalPost(saved)
      setEditingPost(null)
      setIsCreating(false)
      toast.success('Post saved successfully')
    } catch (err) {
      toast.error('Failed to save', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  const handleAutoSave = async (post: Post) => {
    const updatedPost = {
      ...post,
      readTime: calculateReadTime(post.content),
      updatedAt: new Date().toISOString().split('T')[0],
    }

    try {
      const saved = await savePost(updatedPost)
      upsertLocalPost(saved)
    } catch {
      // Autosave is best-effort; explicit saves still show full errors.
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
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold text-foreground">Admin Dashboard</h1>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {activeTab === 'posts' && !editingPost && (
              <>
                <Button variant="outline" size="sm" onClick={openGenerateModal}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>
                <Button onClick={handleCreateNew} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </>
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
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ideas">Ideas</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="ads">Ads</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview
              posts={posts}
              pendingComments={pendingComments}
              onCreatePost={handleCreateNew}
              onGeneratePost={openGenerateModal}
              onEditPost={handleEdit}
              onOpenTab={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="ideas">
            <AdminContentIdeas onGenerateDraft={handleGenerateFromIdea} />
          </TabsContent>

          <TabsContent value="quality">
            <AdminContentQuality posts={posts} onEditPost={handleEdit} />
          </TabsContent>

          <TabsContent value="posts">
            {editingPost ? (
              <PostEditor
                post={editingPost}
                isNew={isCreating}
                onSave={handleSave}
                onAutoSave={handleAutoSave}
                allPosts={posts}
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

          <TabsContent value="ai">
            <SettingsAi initialValue={settings?.ai} />
          </TabsContent>

          <TabsContent value="account">
            <SettingsAccount />
          </TabsContent>

          <TabsContent value="comments">
            <AdminCommentsModeration />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminOutboundStats />
          </TabsContent>
        </Tabs>
      </main>
      {showGenerateModal && (
        <GeneratePostModal
          onClose={() => setShowGenerateModal(false)}
          onGeneratedPost={handleGeneratedPost}
          initialTopic={generateSeed?.topic}
          initialContext={generateSeed?.context}
          initialSchedule={generateSeed?.schedule}
        />
      )}
    </div>
  )
}
