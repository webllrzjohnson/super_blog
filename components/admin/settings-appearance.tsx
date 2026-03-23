'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { AppearanceSettings, BrandingSettings } from '@/lib/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SettingsAppearanceProps {
  initialBranding?: BrandingSettings
  initialAppearance?: AppearanceSettings
}

const fontPairOptions = [
  { value: 'inter-source-serif', label: 'Inter + Source Serif 4' },
  { value: 'inter-merriweather', label: 'Inter + Merriweather' },
  { value: 'lato-playfair', label: 'Lato + Playfair Display' },
  { value: 'roboto-lora', label: 'Roboto + Lora' },
  { value: 'nunito-libre-baskerville', label: 'Nunito + Libre Baskerville' },
]

const colorPresetOptions = [
  { value: 'warm-terracotta', label: 'Warm Terracotta' },
  { value: 'ocean-blue', label: 'Ocean Blue' },
  { value: 'forest-green', label: 'Forest Green' },
  { value: 'midnight-purple', label: 'Midnight Purple' },
  { value: 'monochrome', label: 'Monochrome' },
]

export function SettingsAppearance({
  initialBranding,
  initialAppearance,
}: SettingsAppearanceProps) {
  const [branding, setBranding] = useState<BrandingSettings>({
    siteName: initialBranding?.siteName ?? 'Lester J.',
    logoUrl: initialBranding?.logoUrl ?? '',
    faviconUrl: initialBranding?.faviconUrl ?? '',
  })
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    fontPair: initialAppearance?.fontPair ?? 'inter-source-serif',
    colorPreset: initialAppearance?.colorPreset ?? 'warm-terracotta',
    customPrimaryOklch: initialAppearance?.customPrimaryOklch ?? '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<'logoUrl' | 'faviconUrl' | null>(null)

  const handleAssetUpload = async (
    field: 'logoUrl' | 'faviconUrl',
    file: File | undefined
  ) => {
    if (!file) {
      return
    }

    setUploadingField(field)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to upload asset')
      }

      const data = await response.json()
      setBranding((current) => ({
        ...current,
        [field]: data.url,
      }))

      toast.success(field === 'logoUrl' ? 'Logo uploaded' : 'Favicon uploaded')
    } catch (error) {
      toast.error('Failed to upload asset', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setUploadingField(null)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const requests = await Promise.all([
        fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            key: 'branding',
            value: branding,
          }),
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            key: 'appearance',
            value: appearance,
          }),
        }),
      ])

      const failedResponse = requests.find((response) => !response.ok)
      if (failedResponse) {
        const data = await failedResponse.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save appearance settings')
      }

      toast.success('Appearance settings saved')
    } catch (error) {
      toast.error('Failed to save appearance settings', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Manage your site name, branding assets, font pair, and color palette.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="site-name">Site name</Label>
          <Input
            id="site-name"
            value={branding.siteName}
            onChange={(event) =>
              setBranding((current) => ({
                ...current,
                siteName: event.target.value,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo-url">Logo URL</Label>
          <Input
            id="logo-url"
            placeholder="https://... or Supabase public URL"
            value={branding.logoUrl ?? ''}
            onChange={(event) =>
              setBranding((current) => ({
                ...current,
                logoUrl: event.target.value,
              }))
            }
          />
          <Input
            type="file"
            accept="image/*"
            disabled={uploadingField === 'logoUrl'}
            onChange={(event) =>
              handleAssetUpload('logoUrl', event.target.files?.[0])
            }
          />
          <p className="text-sm text-muted-foreground">
            {uploadingField === 'logoUrl'
              ? 'Uploading logo...'
              : 'Paste a URL or upload a logo image.'}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="favicon-url">Favicon URL</Label>
          <Input
            id="favicon-url"
            placeholder="https://... or Supabase public URL"
            value={branding.faviconUrl ?? ''}
            onChange={(event) =>
              setBranding((current) => ({
                ...current,
                faviconUrl: event.target.value,
              }))
            }
          />
          <Input
            type="file"
            accept="image/*,.ico"
            disabled={uploadingField === 'faviconUrl'}
            onChange={(event) =>
              handleAssetUpload('faviconUrl', event.target.files?.[0])
            }
          />
          <p className="text-sm text-muted-foreground">
            {uploadingField === 'faviconUrl'
              ? 'Uploading favicon...'
              : 'Paste a URL or upload a favicon image.'}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Font pair</Label>
          <Select
            value={appearance.fontPair}
            onValueChange={(value) =>
              setAppearance((current) => ({
                ...current,
                fontPair: value,
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a font pair" />
            </SelectTrigger>
            <SelectContent>
              {fontPairOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Color preset</Label>
          <Select
            value={appearance.colorPreset}
            onValueChange={(value) =>
              setAppearance((current) => ({
                ...current,
                colorPreset: value,
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a color preset" />
            </SelectTrigger>
            <SelectContent>
              {colorPresetOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-primary">Custom primary OKLCH</Label>
          <Input
            id="custom-primary"
            placeholder="oklch(0.62 0.18 30)"
            value={appearance.customPrimaryOklch ?? ''}
            onChange={(event) =>
              setAppearance((current) => ({
                ...current,
                customPrimaryOklch: event.target.value,
              }))
            }
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save appearance'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
