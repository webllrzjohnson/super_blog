'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { PagesSettings } from '@/lib/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface SettingsPagesProps {
  initialValue?: PagesSettings
}

const pageLabels: Record<keyof PagesSettings, string> = {
  about: 'About',
  privacy: 'Privacy',
  contact: 'Contact',
  disclaimer: 'Disclaimer',
}

export function SettingsPages({ initialValue }: SettingsPagesProps) {
  const [activePage, setActivePage] = useState<keyof PagesSettings>('about')
  const [formData, setFormData] = useState<PagesSettings>({
    about: initialValue?.about ?? '',
    privacy: initialValue?.privacy ?? '',
    contact: initialValue?.contact ?? '',
    disclaimer: initialValue?.disclaimer ?? '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const pageKeys = useMemo(
    () => Object.keys(pageLabels) as Array<keyof PagesSettings>,
    []
  )

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
          key: 'pages',
          value: formData,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save page settings')
      }

      toast.success('Page content saved')
    } catch (error) {
      toast.error('Failed to save page content', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pages</CardTitle>
        <CardDescription>
          Edit the markdown content for the main informational pages.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {pageKeys.map((pageKey) => (
            <button
              key={pageKey}
              type="button"
              onClick={() => setActivePage(pageKey)}
              className={cn(
                'rounded-md border px-3 py-2 text-sm transition-colors',
                activePage === pageKey
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground'
              )}
            >
              {pageLabels[pageKey]}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{pageLabels[activePage]} content</p>
          <Textarea
            value={formData[activePage] ?? ''}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                [activePage]: event.target.value,
              }))
            }
            className="min-h-[420px]"
            placeholder={`Write the ${pageLabels[activePage].toLowerCase()} page in markdown...`}
          />
          <p className="text-sm text-muted-foreground">
            Stored as markdown and rendered on the public page when present.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save pages'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
