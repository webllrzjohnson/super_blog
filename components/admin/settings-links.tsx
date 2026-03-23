'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { LinksSettings } from '@/lib/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SettingsLinksProps {
  initialValue?: LinksSettings
}

export function SettingsLinks({ initialValue }: SettingsLinksProps) {
  const [formData, setFormData] = useState<LinksSettings>({
    github: initialValue?.github ?? '',
    linkedin: initialValue?.linkedin ?? '',
    contactEmail: initialValue?.contactEmail ?? '',
    twitter: initialValue?.twitter ?? '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const updateField = (field: keyof LinksSettings, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          key: 'links',
          value: formData,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save link settings')
      }

      toast.success('Links settings saved')
    } catch (error) {
      toast.error('Failed to save links settings', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Links</CardTitle>
        <CardDescription>
          Manage the social profiles and contact details shown around the site.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="github">GitHub URL</Label>
          <Input
            id="github"
            placeholder="https://github.com/yourname"
            value={formData.github ?? ''}
            onChange={(event) => updateField('github', event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn URL</Label>
          <Input
            id="linkedin"
            placeholder="https://linkedin.com/in/yourname"
            value={formData.linkedin ?? ''}
            onChange={(event) => updateField('linkedin', event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter/X URL</Label>
          <Input
            id="twitter"
            placeholder="https://x.com/yourname"
            value={formData.twitter ?? ''}
            onChange={(event) => updateField('twitter', event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="you@example.com"
            value={formData.contactEmail ?? ''}
            onChange={(event) => updateField('contactEmail', event.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save links'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
