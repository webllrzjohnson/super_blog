import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const rows = await sql`
      SELECT
        id,
        title,
        slug,
        excerpt,
        published_at,
        read_time,
        featured_image,
        featured_image_alt,
        tags,
        ts_rank(
          to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, '')),
          plainto_tsquery('english', ${q})
        ) AS rank
      FROM posts
      WHERE
        status = 'published'
        AND to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, ''))
            @@ plainto_tsquery('english', ${q})
      ORDER BY rank DESC
      LIMIT 20
    `
    return NextResponse.json({ results: rows })
  } catch (err) {
    console.error('Search error:', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}