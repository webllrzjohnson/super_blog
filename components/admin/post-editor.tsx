'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { generateSlug } from '@/lib/store'
import type { Post } from '@/lib/types'
import { ArrowLeft, Eye } from 'lucide-react'

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

  const handleSave = (status: 'draft' | 'published') => {
    onSave({ ...formData, status })
  }

  // Simple markdown to HTML conversion for preview
  const renderContent = (content: string) => {
    return content
      .split('\n\n')
      .map((paragraph, i) => {
        if (paragraph.startsWith('## ')) {
          return `<h2 class="text-xl font-semibold mt-6 mb-3">${paragraph.replace('## ', '')}</h2>`
        }
        return `<p class="mb-4">${paragraph}</p>`
      })
      .join('')
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
          <div
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: renderContent(formData.content) }}
          />
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
            <Label htmlFor="featuredImage">Featured Image URL (optional)</Label>
            <Input
              id="featuredImage"
              name="featuredImage"
              value={formData.featuredImage || ''}
              onChange={handleChange}
              placeholder="/images/my-post.jpg"
            />
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
