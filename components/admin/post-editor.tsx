'use client'

import { useEffect, useRef, useState } from 'react'
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
  onAutoSave?: (post: Post) => Promise<void> | void
  onCancel: () => void
}

const categories = ['Life', 'Work', 'Hobbies', 'Experience'] as const

function toDateTimeLocalValue(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''

  const adjusted = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000)
  return adjusted.toISOString().slice(0, 16)
}

function fromDateTimeLocalValue(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString()
}

export function PostEditor({
  post,
  isNew,
  onSave,
  onAutoSave,
  onCancel,
}: PostEditorProps) {
  const [formData, setFormData] = useState<Post>(post)
  const [showPreview, setShowPreview] = useState(false)
  const [tagsInput, setTagsInput] = useState(post.tags.join(', '))
  const [uploading, setUploading] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<Date | null>(null)
  const [scheduleInput, setScheduleInput] = useState(
    toDateTimeLocalValue(post.publishedAt)
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initialSnapshotRef = useRef(JSON.stringify(post))

  useEffect(() => {
    setFormData(post)
    setTagsInput(post.tags.join(', '))
    setShowPreview(false)
    setScheduleInput(toDateTimeLocalValue(post.publishedAt))
    setLastAutoSavedAt(null)
    initialSnapshotRef.current = JSON.stringify(post)
  }, [post])

  const hasUnsavedChanges =
    JSON.stringify(formData) !== initialSnapshotRef.current

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  useEffect(() => {
    if (!onAutoSave || !hasUnsavedChanges || uploading || isAutoSaving) {
      return
    }

    if (!formData.title.trim() || !formData.slug.trim()) {
      return
    }

    if (formData.status === 'published') {
      return
    }

    const interval = window.setInterval(async () => {
      const autoSaveStatus: Post['status'] =
        formData.status === 'scheduled' ? 'scheduled' : 'draft'
      const payload: Post = {
        ...formData,
        status: autoSaveStatus,
      }

      if (autoSaveStatus === 'scheduled') {
        const scheduleDate = new Date(payload.publishedAt)
        if (
          Number.isNaN(scheduleDate.getTime()) ||
          scheduleDate.getTime() <= Date.now()
        ) {
          return
        }
      }

      setIsAutoSaving(true)
      try {
        await onAutoSave(payload)
        initialSnapshotRef.current = JSON.stringify(payload)
        setLastAutoSavedAt(new Date())
      } finally {
        setIsAutoSaving(false)
      }
    }, 20000)

    return () => {
      window.clearInterval(interval)
    }
  }, [formData, hasUnsavedChanges, isAutoSaving, onAutoSave, uploading])

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

  const handleScheduleInputChange = (value: string) => {
    setScheduleInput(value)
    const isoValue = fromDateTimeLocalValue(value)
    if (!isoValue) return
    setFormData((prev) => ({ ...prev, publishedAt: isoValue }))
  }

  const handleSave = (status: 'draft' | 'scheduled' | 'published') => {
    if (status === 'scheduled') {
      const scheduleDate = new Date(formData.publishedAt)
      if (Number.isNaN(scheduleDate.getTime())) {
        toast.error('Please choose a valid date and time to schedule.')
        return
      }

      if (scheduleDate.getTime() <= Date.now()) {
        toast.error('Scheduled publish time must be in the future.')
        return
      }
    }

    const publishedAt =
      status === 'published' && formData.status !== 'published'
        ? new Date().toISOString()
        : formData.publishedAt

    onSave({ ...formData, status, publishedAt })
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = confirm(
        'You have unsaved changes. Are you sure you want to leave this editor?'
      )
      if (!confirmed) {
        return
      }
    }
    onCancel()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleCancel}
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
      <div className="text-sm text-muted-foreground">
        {isAutoSaving
          ? 'Autosaving...'
          : lastAutoSavedAt
            ? `Last autosaved at ${lastAutoSavedAt.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}`
            : 'Autosave runs every 20 seconds for draft/scheduled edits.'}
      </div>

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

          <div className="space-y-2 max-w-sm">
            <Label htmlFor="scheduleAt">Schedule Publish (optional)</Label>
            <Input
              id="scheduleAt"
              type="datetime-local"
              value={scheduleInput}
              onChange={(e) => handleScheduleInputChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Set a future date and use the Schedule button to queue this post.
            </p>
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
        <Button onClick={() => handleSave('scheduled')} variant="outline">
          Schedule
        </Button>
        <Button onClick={() => handleSave('published')}>
          Publish
        </Button>
        <Button variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
