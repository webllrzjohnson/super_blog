'use client'

import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { generateSlug } from '@/lib/store'
import type { Post } from '@/lib/types'
import { ArrowLeft, Eye, ImagePlus } from 'lucide-react'
import { toast } from 'sonner'

interface PostEditorProps {
  post: Post
  isNew: boolean
  onSave: (post: Post) => void
  onCancel: () => void
}

const categories = ['Life', 'Work', 'Hobbies', 'Experience'] as const

export function PostEditor({ post, isNew, onSave, onCancel }: PostEditorProps) {
  const [formData, setFormData] = useState<Post>(post)
  const [showPreview, setShowPreview] = useState(false)
  const [tagsInput, setTagsInput] = useState(post.tags.join(', '))
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from title
      ...(name === 'title' && { slug: generateSlug(value) }),
    }))
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value)
    const tags = e.target.value
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
    setFormData((prev) => ({ ...prev, tags }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Upload failed')
      }
      const { url } = await res.json()
      setFormData((prev) => ({ ...prev, featuredImage: url }))
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSave = (status: 'draft' | 'published') => {
    onSave({ ...formData, status })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to posts
        </button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          <Eye className="h-4 w-4 mr-2" />
          {showPreview ? 'Edit' : 'Preview'}
        </Button>
      </div>

      <h2 className="text-xl font-semibold text-foreground">
        {isNew ? 'Create New Post' : 'Edit Post'}
      </h2>

      {showPreview ? (
        /* Preview Mode */
        <div className="border border-border rounded-lg p-6 bg-card">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            {formData.title || 'Untitled'}
          </h1>
          <p className="text-muted-foreground mb-6">{formData.excerpt}</p>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown>{formData.content}</ReactMarkdown>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Post title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="post-url-slug"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Brief description of the post..."
              rows={2}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={handleTagsChange}
                placeholder="career, productivity, life"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="featuredImage">Featured Image (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="featuredImage"
                name="featuredImage"
                value={formData.featuredImage || ''}
                onChange={handleChange}
                placeholder="Paste URL or upload below"
                className="flex-1"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            {formData.featuredImage && (
              <img
                src={formData.featuredImage}
                alt="Featured preview"
                className="mt-2 h-24 w-auto rounded border border-border object-cover"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown supported)</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your post content here...

Use ## for headings
Separate paragraphs with blank lines"
              rows={20}
              className="font-mono text-sm"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <Button onClick={() => handleSave('draft')} variant="outline">
          Save as Draft
        </Button>
        <Button onClick={() => handleSave('published')}>
          Publish
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
