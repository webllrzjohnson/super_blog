#!/usr/bin/env node

const message = process.argv.slice(2).join(' ').trim()
const baseUrl = (process.env.SUPER_BLOG_URL || process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
const secret = process.env.CONTENT_IDEA_CAPTURE_SECRET || ''

if (!message) {
  console.error('Usage: node scripts/capture-telegram-idea.mjs "Blog idea: ..."')
  process.exit(1)
}

if (!baseUrl) {
  console.error('Missing SUPER_BLOG_URL or NEXT_PUBLIC_SITE_URL')
  process.exit(1)
}

if (!secret) {
  console.error('Missing CONTENT_IDEA_CAPTURE_SECRET')
  process.exit(1)
}

const response = await fetch(`${baseUrl}/api/content-ideas/capture`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${secret}`,
  },
  body: JSON.stringify({
    message,
    source: 'Telegram via Hermes',
  }),
})

const data = await response.json().catch(() => ({}))
if (!response.ok) {
  console.error(data.error || `Capture failed with HTTP ${response.status}`)
  process.exit(1)
}

console.log(`Captured idea: ${data.idea?.title ?? 'Untitled idea'}`)
console.log(`Status: ${data.idea?.status ?? 'idea'} · Priority: ${data.idea?.priority ?? 'medium'} · Category: ${data.idea?.category ?? 'Work'}`)
