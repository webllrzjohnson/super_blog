'use client'

import { useCallback, useEffect, useState } from 'react'
import { Heart, Lightbulb, ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  REACTION_KINDS,
  REACTION_LABELS,
  type ReactionKind,
  emptyReactionCounts,
} from '@/lib/reactions'
import {
  VISITOR_DEVICE_HEADER,
  getOrCreateVisitorDeviceId,
} from '@/lib/visitor-device-id'

type Summary = {
  counts: Record<ReactionKind, number>
  mine: ReactionKind | null
}

const ICONS: Record<ReactionKind, typeof ThumbsUp> = {
  helpful: ThumbsUp,
  thanks: Heart,
  insight: Lightbulb,
}

export function PostReactions({ slug }: { slug: string }) {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [visitorId, setVisitorId] = useState('')

  const load = useCallback(async () => {
    const vid = getOrCreateVisitorDeviceId()
    setVisitorId(vid)
    try {
      const res = await fetch(`/api/blog/${encodeURIComponent(slug)}/reactions`, {
        headers: vid
          ? {
              [VISITOR_DEVICE_HEADER]: vid,
            }
          : undefined,
      })
      if (!res.ok) {
        throw new Error('Failed to load reactions')
      }
      const data = (await res.json()) as Summary
      setSummary({
        counts: { ...emptyReactionCounts(), ...data.counts },
        mine: data.mine ?? null,
      })
      setError(null)
    } catch {
      setError('Could not load reactions.')
      setSummary(null)
    }
  }, [slug])

  useEffect(() => {
    void load()
  }, [load])

  const setReaction = async (kind: ReactionKind | null) => {
    if (!visitorId || saving) return
    setSaving(true)
    try {
      const res = await fetch(`/api/blog/${encodeURIComponent(slug)}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [VISITOR_DEVICE_HEADER]: visitorId,
        },
        body: JSON.stringify({ kind }),
      })
      if (!res.ok) {
        throw new Error('Save failed')
      }
      const data = (await res.json()) as Summary
      setSummary({
        counts: { ...emptyReactionCounts(), ...data.counts },
        mine: data.mine ?? null,
      })
      setError(null)
    } catch {
      setError('Could not update reaction.')
    } finally {
      setSaving(false)
    }
  }

  const onPick = (kind: ReactionKind) => {
    if (!summary) return
    const next = summary.mine === kind ? null : kind
    void setReaction(next)
  }

  if (error && !summary) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        {error}
      </p>
    )
  }

  if (!summary) {
    return (
      <p className="text-sm text-muted-foreground" aria-busy="true">
        Loading reactions…
      </p>
    )
  }

  return (
    <section
      className="rounded-lg border border-border/60 bg-muted/30 px-4 py-4"
      aria-label="Post reactions"
    >
      <p className="text-sm font-medium text-foreground mb-3">Was this post useful?</p>
      <div className="flex flex-wrap gap-2">
        {REACTION_KINDS.map((kind) => {
          const Icon = ICONS[kind]
          const count = summary.counts[kind] ?? 0
          const active = summary.mine === kind
          const label = REACTION_LABELS[kind]
          return (
            <Button
              key={kind}
              type="button"
              variant={active ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5"
              disabled={saving || !visitorId}
              aria-pressed={active}
              aria-label={`${label}, ${count} reaction${count === 1 ? '' : 's'}`}
              onClick={() => onPick(kind)}
            >
              <Icon className={`h-4 w-4 ${active && kind === 'thanks' ? 'fill-current' : ''}`} />
              <span>{label}</span>
              <span className="tabular-nums text-muted-foreground">({count})</span>
            </Button>
          )
        })}
      </div>
      {error ? (
        <p className="text-xs text-destructive mt-2" role="status">
          {error}
        </p>
      ) : null}
    </section>
  )
}
