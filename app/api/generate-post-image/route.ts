import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { isAdminSession } from '@/lib/auth-session'

async function checkAdmin(): Promise<boolean> {
  const headersList = await headers()
  return isAdminSession(headersList.get('cookie'))
}

const torontoSettings = [
  'a residential side street with older apartment buildings',
  'a downtown Toronto neighborhood skyline in the background, no specific landmarks',
  'a quiet courtyard between government-subsidized apartment buildings',
  'a Toronto streetscape near a subway entrance',
  'a laneway behind a row of Toronto apartment buildings',
  'a Toronto residential block in late afternoon light',
  'a Toronto street during a changing season, distant city skyline',
  'a Toronto apartment building exterior with a glimpse of the CN Tower in the far distance',
  'the Beaches neighborhood in Toronto, boardwalk and lakeside apartment buildings',
]

export async function POST(request: Request) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { topic } = await request.json()
  if (!topic) {
    return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
  }

  const setting = torontoSettings[Math.floor(Math.random() * torontoSettings.length)]

  const prompt = `${topic}. Typical government-subsidized Toronto apartment building and townhouse setting, ${setting}. Male superintendent's perspective. No speech bubbles. No text. No watermarks. No logos. 
Professional anime background art, environmental storytelling, realistic scene composition, perfect perspective, Studio Ghibli inspired environmental design, 
Makoto Shinkai inspired lighting and atmosphere, hand-painted illustration, ultra detailed, crisp linework, high dynamic range, 
atmospheric depth, realistic reflections, volumetric lighting, sharp focus, masterpiece, award-winning background illustration, 
production-quality animation background, 8k.`

  try {
    const imageRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        size: '1536x1024',
      }),
    })

    if (!imageRes.ok) {
      const err = await imageRes.json().catch(() => ({}))
      throw new Error(err.error?.message || 'OpenAI image generation failed')
    }

    const imageData = await imageRes.json()
    const b64 = imageData.data[0].b64_json
    if (!b64) throw new Error('No image data returned')

    const binary = Buffer.from(b64, 'base64')
    const filename = `generated_${Date.now()}.png`

    const formData = new FormData()
    formData.append('file', new Blob([binary], { type: 'image/png' }), filename)

    const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        cookie: (await headers()).get('cookie') || '',
      },
      body: formData,
    })

    if (!uploadRes.ok) {
      throw new Error('Failed to upload generated image')
    }

    const uploadData = await uploadRes.json()
    return NextResponse.json({ url: uploadData.url })

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Image generation failed' },
      { status: 500 }
    )
  }
}