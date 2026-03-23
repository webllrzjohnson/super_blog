import { AdSlot } from '@/components/ad-slot'
import { getSetting } from '@/lib/settings'

interface GoogleAdProps {
  position: 'top-of-content' | 'mid-content' | 'end-of-article' | 'between-posts'
}

const positionMap = {
  'top-of-content': 'top',
  'mid-content': 'mid',
  'end-of-article': 'footer',
  'between-posts': 'footer',
} as const

export async function GoogleAd({ position }: GoogleAdProps) {
  const ads = await getSetting('ads')
  const slot = ads.slots.find((item) => item.position === position)

  if (!ads.clientId || !slot?.enabled || !slot.slotId) {
    return null
  }

  return (
    <AdSlot
      position={positionMap[position]}
      adSlot={slot.slotId}
      clientId={ads.clientId}
    />
  )
}
