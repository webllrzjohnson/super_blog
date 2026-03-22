'use client'

// Client-side post operations via API (used by admin dashboard)

import type { Post } from './types'

const API_BASE = '/api'

export async function getPosts(): Promise<Post[]> {
  const res = await fetch(API_BASE + '/posts')
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}

export async function savePost(post: Post): Promise<Post> {
  const res = await fetch(API_BASE + '/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
    credentials: 'include',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to save post')
  }
  return res.json()
}

export async function deletePost(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/posts/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to delete post')
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}
