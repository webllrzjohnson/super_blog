'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'error') {
    return (
      <div className="p-6 bg-destructive/10 rounded-lg">
        <p className="text-destructive font-medium">Subscription failed</p>
        <p className="text-sm text-muted-foreground mt-1">
          Please try again or contact us directly.
        </p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="p-6 bg-secondary rounded-lg">
        <p className="text-foreground font-medium">Thanks for subscribing!</p>
        <p className="text-sm text-muted-foreground mt-1">
          Check your inbox for a confirmation email.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 max-w-md">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 text-sm"
          disabled={status === 'loading'}
        />
        <Button type="submit" disabled={status === 'loading'} size="sm" className="sm:w-auto">
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        No spam. Unsubscribe anytime.
      </p>
    </form>
  )
}
