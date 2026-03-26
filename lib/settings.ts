import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createServerClient, hasSupabaseConfig } from '@/lib/supabase/server'
import {
  CACHE_TAG_SETTINGS,
  SETTINGS_CACHE_REVALIDATE_SECONDS,
} from '@/lib/cache-tags'

export interface LinksSettings {
  github?: string
  linkedin?: string
  contactEmail?: string
  twitter?: string
}

export interface BrandingSettings {
  logoUrl?: string
  faviconUrl?: string
  siteName: string
}

export interface AppearanceSettings {
  fontPair: string
  colorPreset: string
  customPrimaryOklch?: string
}

export interface AdSlotSetting {
  slotId: string
  position: string
  enabled: boolean
}

export interface AdsSettings {
  clientId?: string
  slots: AdSlotSetting[]
}

export interface PagesSettings {
  about?: string
  privacy?: string
  contact?: string
  disclaimer?: string
}

export interface SettingsMap {
  links: LinksSettings
  branding: BrandingSettings
  appearance: AppearanceSettings
  ads: AdsSettings
  pages: PagesSettings
  admin_password_hash: string | null
}

export type SettingsKey = keyof SettingsMap

export const defaultSettings: SettingsMap = {
  links: {},
  branding: {
    siteName: 'Lester J.',
  },
  appearance: {
    fontPair: 'inter-source-serif',
    colorPreset: 'warm-terracotta',
  },
  ads: {
    slots: [],
  },
  pages: {},
  admin_password_hash: null,
}

interface SiteSettingsRow {
  key: SettingsKey
  value: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readOptionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key]
  return typeof value === 'string' && value.trim() ? value : undefined
}

function sanitizeLinksSettings(value: unknown): LinksSettings {
  if (!isRecord(value)) {
    return { ...defaultSettings.links }
  }

  return {
    github: readOptionalString(value, 'github'),
    linkedin: readOptionalString(value, 'linkedin'),
    contactEmail: readOptionalString(value, 'contactEmail'),
    twitter: readOptionalString(value, 'twitter'),
  }
}

function sanitizeBrandingSettings(value: unknown): BrandingSettings {
  if (!isRecord(value)) {
    return { ...defaultSettings.branding }
  }

  return {
    siteName: readOptionalString(value, 'siteName') ?? defaultSettings.branding.siteName,
    logoUrl: readOptionalString(value, 'logoUrl'),
    faviconUrl: readOptionalString(value, 'faviconUrl'),
  }
}

function sanitizeAppearanceSettings(value: unknown): AppearanceSettings {
  if (!isRecord(value)) {
    return { ...defaultSettings.appearance }
  }

  return {
    fontPair: readOptionalString(value, 'fontPair') ?? defaultSettings.appearance.fontPair,
    colorPreset: readOptionalString(value, 'colorPreset') ?? defaultSettings.appearance.colorPreset,
    customPrimaryOklch: readOptionalString(value, 'customPrimaryOklch'),
  }
}

function sanitizeAdsSettings(value: unknown): AdsSettings {
  if (!isRecord(value)) {
    return {
      clientId: defaultSettings.ads.clientId,
      slots: [...defaultSettings.ads.slots],
    }
  }

  const rawSlots = Array.isArray(value.slots) ? value.slots : []
  const slots = rawSlots
    .filter(isRecord)
    .map((slot) => {
      const rawSlotId = slot.slotId
      const slotId = typeof rawSlotId === 'string' ? rawSlotId.trim() : ''
      const position = readOptionalString(slot, 'position')
      const enabled = slot.enabled

      if (!position || typeof enabled !== 'boolean') {
        return null
      }

      if (enabled && !slotId) {
        return null
      }

      return {
        slotId,
        position,
        enabled,
      }
    })
    .filter((slot): slot is AdSlotSetting => slot !== null)

  return {
    clientId: readOptionalString(value, 'clientId'),
    slots,
  }
}

function sanitizePagesSettings(value: unknown): PagesSettings {
  if (!isRecord(value)) {
    return { ...defaultSettings.pages }
  }

  return {
    about: readOptionalString(value, 'about'),
    privacy: readOptionalString(value, 'privacy'),
    contact: readOptionalString(value, 'contact'),
    disclaimer: readOptionalString(value, 'disclaimer'),
  }
}

function sanitizeAdminPasswordHash(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function normalizeSetting<K extends SettingsKey>(key: K, value: unknown): SettingsMap[K] {
  switch (key) {
    case 'links':
      return sanitizeLinksSettings(value) as SettingsMap[K]
    case 'branding':
      return sanitizeBrandingSettings(value) as SettingsMap[K]
    case 'appearance':
      return sanitizeAppearanceSettings(value) as SettingsMap[K]
    case 'ads':
      return sanitizeAdsSettings(value) as SettingsMap[K]
    case 'pages':
      return sanitizePagesSettings(value) as SettingsMap[K]
    case 'admin_password_hash':
      return sanitizeAdminPasswordHash(value) as SettingsMap[K]
    default:
      return defaultSettings[key]
  }
}

function cloneDefaults(): SettingsMap {
  return {
    links: { ...defaultSettings.links },
    branding: { ...defaultSettings.branding },
    appearance: { ...defaultSettings.appearance },
    ads: {
      clientId: defaultSettings.ads.clientId,
      slots: [...defaultSettings.ads.slots],
    },
    pages: { ...defaultSettings.pages },
    admin_password_hash: defaultSettings.admin_password_hash,
  }
}

async function loadSettingsFromSupabase(): Promise<SettingsMap> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')

  if (error || !data) {
    return cloneDefaults()
  }

  const settings = cloneDefaults()

  for (const row of data as SiteSettingsRow[]) {
    switch (row.key) {
      case 'links':
        settings.links = normalizeSetting('links', row.value)
        break
      case 'branding':
        settings.branding = normalizeSetting('branding', row.value)
        break
      case 'appearance':
        settings.appearance = normalizeSetting('appearance', row.value)
        break
      case 'ads':
        settings.ads = normalizeSetting('ads', row.value)
        break
      case 'pages':
        settings.pages = normalizeSetting('pages', row.value)
        break
      case 'admin_password_hash':
        settings.admin_password_hash = normalizeSetting(
          'admin_password_hash',
          row.value
        )
        break
    }
  }

  return settings
}

const getSettingsFromSupabaseCached = unstable_cache(
  loadSettingsFromSupabase,
  ['site-settings-map'],
  {
    tags: [CACHE_TAG_SETTINGS],
    revalidate: SETTINGS_CACHE_REVALIDATE_SECONDS,
  }
)

export const getSettings = cache(async (): Promise<SettingsMap> => {
  if (!hasSupabaseConfig()) {
    return cloneDefaults()
  }
  return getSettingsFromSupabaseCached()
})

export const getSetting = cache(async <K extends SettingsKey>(key: K): Promise<SettingsMap[K]> => {
  const settings = await getSettings()
  return settings[key]
})
