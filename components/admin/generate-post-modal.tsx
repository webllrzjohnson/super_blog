'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Sparkles, X } from 'lucide-react'

interface GeneratePostModalProps {
  onClose: () => void
}

export function GeneratePostModal({ onClose }: GeneratePostModalProps) {
  const [topic, setTopic] = useState('')
  const [context, setContext] = useState('')
  const [schedule, setSchedule] = useState('Immediate')
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('topic', topic)
      formData.append('context', context)
      formData.append('schedule', schedule)
      if (featuredImage) {
        formData.append('featured_image', featuredImage)
      }

      const res = await fetch('/api/generate-post', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!res.ok) throw new Error('Failed to trigger generation')

      toast.success('Post generation started', {
        description: 'Your post will appear shortly after Claude finishes writing.',
      })
      onClose()
    } catch (err) {
      toast.error('Failed to generate post', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate Post with AI
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How to handle tenant complaints professionally"
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Context</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. Write from a first-person perspective, focus on practical tips..."
              rows={3}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Schedule</label>
            <select
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Immediate">Immediate</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Featured Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFeaturedImage(e.target.files?.[0] ?? null)}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {featuredImage && (
              <p className="text-xs text-muted-foreground mt-1">{featuredImage.name}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading ? 'Starting...' : 'Generate Post'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}