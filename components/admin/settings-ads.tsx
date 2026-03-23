'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { AdsSettings, AdSlotSetting } from '@/lib/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface SettingsAdsProps {
  initialValue?: AdsSettings
}

const adPositions = [
  'top-of-content',
  'mid-content',
  'end-of-article',
  'between-posts',
] as const

function buildSlotMap(slots: AdSlotSetting[]): Record<string, AdSlotSetting> {
  return Object.fromEntries(slots.map((slot) => [slot.position, slot]))
}

export function SettingsAds({ initialValue }: SettingsAdsProps) {
  const initialSlots = useMemo(() => {
    const slotMap = buildSlotMap(initialValue?.slots ?? [])

    return adPositions.map((position) => ({
      slotId: slotMap[position]?.slotId ?? '',
      position,
      enabled: slotMap[position]?.enabled ?? false,
    }))
  }, [initialValue])

  const [clientId, setClientId] = useState(initialValue?.clientId ?? '')
  const [slots, setSlots] = useState<AdSlotSetting[]>(initialSlots)
  const [isSaving, setIsSaving] = useState(false)

  const updateSlot = (position: string, patch: Partial<AdSlotSetting>) => {
    setSlots((current) =>
      current.map((slot) =>
        slot.position === position
          ? {
              ...slot,
              ...patch,
            }
          : slot
      )
    )
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const normalizedClientId = clientId.trim()
      const normalizedSlots = slots.map((slot) => ({
        ...slot,
        slotId: slot.slotId.trim(),
      }))

      const invalidEnabledSlot = normalizedSlots.find(
        (slot) => slot.enabled && !slot.slotId
      )

      if (invalidEnabledSlot) {
        throw new Error(`Provide a slot ID for ${invalidEnabledSlot.position}`)
      }

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          key: 'ads',
          value: {
            clientId: normalizedClientId,
            slots: normalizedSlots,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save ads settings')
      }

      toast.success('Ads settings saved')
    } catch (error) {
      toast.error('Failed to save ads settings', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ads</CardTitle>
        <CardDescription>
          Configure the AdSense client ID and the allowed ad placements used by the site.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="ads-client-id">AdSense client ID</Label>
          <Input
            id="ads-client-id"
            placeholder="ca-pub-1234567890123456"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
          />
        </div>

        <div className="space-y-4">
          {slots.map((slot) => (
            <div key={slot.position} className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{slot.position}</p>
                  <p className="text-sm text-muted-foreground">
                    Enable this placement and provide the AdSense slot ID to render ads here.
                  </p>
                </div>
                <Switch
                  checked={slot.enabled}
                  onCheckedChange={(checked) => updateSlot(slot.position, { enabled: checked })}
                  aria-label={`Enable ${slot.position}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`slot-${slot.position}`}>Slot ID</Label>
                <Input
                  id={`slot-${slot.position}`}
                  placeholder="1234567890"
                  value={slot.slotId}
                  onChange={(event) =>
                    updateSlot(slot.position, { slotId: event.target.value })
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save ads'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
