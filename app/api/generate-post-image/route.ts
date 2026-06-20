import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { isAdminSession } from '@/lib/auth-session'

async function checkAdmin(): Promise<boolean> {
  const headersList = await headers()
  return isAdminSession(headersList.get('cookie'))
}

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



const prompt = `${topic}. Professional anime background art, environmental storytelling, realistic scene composition, perfect perspective, Studio Ghibli inspired environmental design, 
Makoto Shinkai inspired lighting and atmosphere, hand-painted illustration, ultra detailed, crisp linework, high dynamic range, 
atmospheric depth, realistic reflections, volumetric lighting, sharp focus, masterpiece, award-winning background illustration, 
production-quality animation background, 8k. Downtown apartment building and townhouse setting in Toronto. Never show the CN Tower.
Typical apartment environment stairwells, hallways, balcony, parking areas, playground, streets, traffic, parks, walkways, patios, backyards, frontyards, lobby, elevators, parking lot, balcony, boiler rooms, rooftops, 
loading docks, maintenance equipment, tools, supplies, and building infrastructure relevant to the topic. 
The environment should always be clean and organized unless stated or described otherwise.
`


/*
  //original
  //const prompt = Generate an image of ${topic} with illustration quality based on Studio Ghibli and Makoto Shinkai inspired environmental art, ultra detailed, crisp linework, high dynamic range, atmospheric storytelling, perfect perspective, 4k, 8k, sharp focus, professional illustration, highly detailed shadows, realistic clutter distribution, award-winning background design.
  //Adult People dressed according to the setting described and characters are allowed and encouraged when relevant to the topic — show them in action, in context, from behind or at an angle (avoid direct face close-ups). Dynamic poses, expressive body language, environmental storytelling.
  //Focus on the environment itself: stairwells, hallways, balcony, parking areas, playground, parks, walkways, patios, backyards, frontyards, lobby, elevators, parking lot, balcony, boiler rooms, rooftops, loading docks, maintenance equipment, tools, supplies, and building infrastructure relevant to the topic. The environment should always be clean and organized unless stated or described otherwise.
  //Wide 16:9 blog featured image. No speech bubbles. No text. No watermarks. No logos.`

  //from gpt instruction
  // Professional anime background art, environmental storytelling, realistic scene composition, perfect perspective, 
  // Studio Ghibli inspired environmental design, Makoto Shinkai inspired lighting and atmosphere, hand-painted illustration, 
  // ultra detailed, crisp linework, high dynamic range, atmospheric depth, realistic reflections, volumetric lighting, sharp focus, 
  // masterpiece, award-winning background illustration, production-quality animation background, 8k.
*/


  /*
  const prompt = `Comic-book illustration for a blog post titled: "${topic}".

  Read the title carefully and illustrate the core subject matter of that specific topic. If the topic is about running, show a running scene. If it's about an injury, show recovery or physical effort. If it's about building maintenance, show the relevant building environment. Match the illustration to what the post is actually about.
  
  Professional comic-book artwork with bold linework, vibrant saturated colors, dramatic lighting with strong highlights and deep shadows, rich scene composition, and cinematic depth. Magazine-quality illustration.
  
  People and characters are allowed and encouraged when relevant to the topic — show them in action, in context, from behind or at an angle (avoid direct face close-ups). Dynamic poses, expressive body language, environmental storytelling.
  
  Natural details and realistic context for the scene. No generic stock-photo compositions.
  
  No text. No speech bubbles. No logos. No watermarks.
  
  Wide 16:9 blog featured image.`

  */

  try {
    // Generate image via OpenAI
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

    // Convert base64 to blob and upload to VPS
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