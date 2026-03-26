import { test, expect } from '@playwright/test'

test.describe('public pages', () => {
  test('home responds', async ({ page }) => {
    const res = await page.goto('/')
    expect(res?.ok()).toBeTruthy()
  })

  test('blog listing', async ({ page }) => {
    const res = await page.goto('/blog')
    expect(res?.ok()).toBeTruthy()
    await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible()
  })

  test('tags page', async ({ page }) => {
    const res = await page.goto('/blog/tags')
    expect(res?.ok()).toBeTruthy()
  })

  test('feed is xml', async ({ request }) => {
    const res = await request.get('/feed')
    expect(res.ok()).toBeTruthy()
    const text = await res.text()
    expect(text).toContain('<rss version="2.0"')
  })
})

test.describe('api smoke', () => {
  test('posts list is public', async ({ request }) => {
    const res = await request.get('/api/posts')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(Array.isArray(data)).toBeTruthy()
  })

  test('auth session endpoint responds', async ({ request }) => {
    const res = await request.get('/api/auth/session')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data).toHaveProperty('authenticated')
  })

  test('revalidate route rejects without auth', async ({ request }) => {
    const res = await request.get('/api/revalidate-posts')
    expect(res.status()).toBe(401)
  })
})

test.describe('admin', () => {
  test('login route returns HTML', async ({ request }) => {
    const res = await request.get('/admin')
    expect(res.ok()).toBeTruthy()
    const html = await res.text()
    expect(html.toLowerCase()).toMatch(/admin/)
  })
})
