'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { defaultAiSettings } from '@/lib/ai-defaults'
import type { AiSettings } from '@/lib/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface SettingsAiProps {
  initialValue?: AiSettings
}

export function SettingsAi({ initialValue }: SettingsAiProps) {
  const [formData, setFormData] = useState<AiSettings>({
    claudeModel: initialValue?.claudeModel ?? defaultAiSettings.claudeModel,
    groqModel: initialValue?.groqModel ?? defaultAiSettings.groqModel,
    imageModel: initialValue?.imageModel ?? defaultAiSettings.imageModel,
    claudeSystemPrompt:
      initialValue?.claudeSystemPrompt ?? defaultAiSettings.claudeSystemPrompt,
    groqSystemPrompt:
      initialValue?.groqSystemPrompt ?? defaultAiSettings.groqSystemPrompt,
    userMessageTemplate:
      initialValue?.userMessageTemplate ?? defaultAiSettings.userMessageTemplate,
    groqUserMessageTemplate:
      initialValue?.groqUserMessageTemplate ?? defaultAiSettings.groqUserMessageTemplate,
    imagePromptTemplate:
      initialValue?.imagePromptTemplate ?? defaultAiSettings.imagePromptTemplate,
  })
  const [isSaving, setIsSaving] = useState(false)

  const updateField = <K extends keyof AiSettings>(key: K, value: AiSettings[K]) => {
    setFormData((current) => ({ ...current, [key]: value }))
  }

  const handleReset = () => {
    if (!confirm('Reset all AI models and prompts to defaults?')) return
    setFormData({ ...defaultAiSettings })
    toast.message('Defaults loaded — save to apply')
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
          key: 'ai',
          value: formData,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save AI settings')
      }

      toast.success('AI settings saved')
    } catch (error) {
      toast.error('Failed to save AI settings', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Models</CardTitle>
          <CardDescription>
            API keys stay in environment variables. These model IDs are used for post and image
            generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="claudeModel">Claude model (primary)</Label>
            <Input
              id="claudeModel"
              value={formData.claudeModel}
              onChange={(event) => updateField('claudeModel', event.target.value)}
              placeholder="claude-sonnet-4-6"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="groqModel">Groq model (fallback)</Label>
            <Input
              id="groqModel"
              value={formData.groqModel}
              onChange={(event) => updateField('groqModel', event.target.value)}
              placeholder="llama-3.3-70b-versatile"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="imageModel">OpenAI image model</Label>
            <Input
              id="imageModel"
              value={formData.imageModel}
              onChange={(event) => updateField('imageModel', event.target.value)}
              placeholder="gpt-image-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Post generation prompts</CardTitle>
          <CardDescription>
            Claude uses the full system prompt. Groq uses the shorter fallback. Keep the
            ---JSON--- / ---CONTENT--- / ---END--- response format in system prompts or
            generation will fail.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="claudeSystemPrompt">Claude system prompt</Label>
            <Textarea
              id="claudeSystemPrompt"
              value={formData.claudeSystemPrompt}
              onChange={(event) => updateField('claudeSystemPrompt', event.target.value)}
              className="min-h-[280px] font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="groqSystemPrompt">Groq system prompt</Label>
            <Textarea
              id="groqSystemPrompt"
              value={formData.groqSystemPrompt}
              onChange={(event) => updateField('groqSystemPrompt', event.target.value)}
              className="min-h-[200px] font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userMessageTemplate">Claude user message template</Label>
            <Textarea
              id="userMessageTemplate"
              value={formData.userMessageTemplate}
              onChange={(event) => updateField('userMessageTemplate', event.target.value)}
              className="min-h-[160px] font-mono text-xs"
            />
            <p className="text-sm text-muted-foreground">
              Placeholders: {'{{topic}}'}, {'{{context}}'}, {'{{schedule}}'}, {'{{recentPosts}}'}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="groqUserMessageTemplate">Groq user message template</Label>
            <Textarea
              id="groqUserMessageTemplate"
              value={formData.groqUserMessageTemplate}
              onChange={(event) => updateField('groqUserMessageTemplate', event.target.value)}
              className="min-h-[100px] font-mono text-xs"
            />
            <p className="text-sm text-muted-foreground">
              Placeholders: {'{{topic}}'}, {'{{context}}'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Image generation prompt</CardTitle>
          <CardDescription>
            Used when generating featured images without an upload. A random Toronto scene is
            picked for {'{{setting}}'} on each generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="imagePromptTemplate">Image prompt template</Label>
          <Textarea
            id="imagePromptTemplate"
            value={formData.imagePromptTemplate}
            onChange={(event) => updateField('imagePromptTemplate', event.target.value)}
            className="min-h-[160px] font-mono text-xs"
          />
          <p className="text-sm text-muted-foreground">
            Placeholders: {'{{topic}}'}, {'{{setting}}'}
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={handleReset} disabled={isSaving}>
          Reset to defaults
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save AI settings'}
        </Button>
      </div>
    </div>
  )
}
