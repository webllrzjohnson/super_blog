import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import sql from '@/lib/db'
import { hasDatabaseConfig } from '@/lib/db-config'
import {
  RESOURCE_FILE_CATEGORIES,
  type ResourceFileCategory,
  type ResourceFileItem,
} from '@/lib/resource-file-types'

const RESOURCE_FILES_KEY = 'resource_files'
const RESOURCE_UPLOAD_DIR = '/app/public/uploads/resources'
const MAX_RESOURCE_FILE_SIZE_BYTES = 10 * 1024 * 1024

export { RESOURCE_FILE_CATEGORIES, type ResourceFileCategory, type ResourceFileItem }

const ALLOWED_RESOURCE_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
  'text/plain': 'txt',
  'text/csv': 'csv',
  'application/rtf': 'rtf',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key]
  return typeof value === 'string' ? value.trim() : ''
}

function readBoolean(record: Record<string, unknown>, key: string, fallback: boolean): boolean {
  return typeof record[key] === 'boolean' ? record[key] : fallback
}

function readNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function normalizeCategory(value: unknown): ResourceFileCategory {
  return RESOURCE_FILE_CATEGORIES.includes(value as ResourceFileCategory)
    ? (value as ResourceFileCategory)
    : 'Other'
}

function normalizeResourceFile(value: unknown): ResourceFileItem | null {
  if (!isRecord(value)) return null
  const id = readString(value, 'id')
  const title = readString(value, 'title')
  const url = readString(value, 'url')
  const filename = readString(value, 'filename')
  const mimeType = readString(value, 'mimeType')
  if (!id || !title || !url || !filename || !mimeType) return null

  const now = new Date().toISOString()
  return {
    id,
    title,
    description: readString(value, 'description'),
    category: normalizeCategory(value.category),
    url,
    filename,
    originalFilename: readString(value, 'originalFilename') || filename,
    mimeType,
    sizeBytes: readNumber(value, 'sizeBytes'),
    published: readBoolean(value, 'published', true),
    createdAt: readString(value, 'createdAt') || now,
    updatedAt: readString(value, 'updatedAt') || now,
  }
}

function normalizeResourceFiles(value: unknown): ResourceFileItem[] {
  const files = Array.isArray(value) ? value : []
  return files
    .map(normalizeResourceFile)
    .filter((file): file is ResourceFileItem => file !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function sanitizeFilename(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'resource-file'
}

function extensionForFile(file: File): string {
  const fromType = ALLOWED_RESOURCE_TYPES[file.type]
  if (fromType) return fromType
  const fromName = file.name.split('.').pop()?.toLowerCase()
  return fromName && /^[a-z0-9]+$/.test(fromName) ? fromName : 'bin'
}

function publicResourceUrl(filename: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || ''
  return `${base}/api/uploads/resources/${filename}`
}

export function validateResourceFile(file: File): void {
  if (!ALLOWED_RESOURCE_TYPES[file.type]) {
    throw new Error('Unsupported file type. Upload PDF, Word, Excel, TXT, CSV, or RTF files.')
  }
  if (file.size > MAX_RESOURCE_FILE_SIZE_BYTES) {
    throw new Error('File too large (max 10MB)')
  }
}

export async function getResourceFilesFromDb(options: { includeUnpublished?: boolean } = {}): Promise<ResourceFileItem[]> {
  if (!hasDatabaseConfig()) return []
  const rows = await sql<{ value: unknown }[]>`
    SELECT value FROM site_settings WHERE key = ${RESOURCE_FILES_KEY} LIMIT 1
  `
  const files = normalizeResourceFiles(rows[0]?.value)
  return options.includeUnpublished ? files : files.filter((file) => file.published)
}

async function saveResourceFilesToDb(files: ResourceFileItem[]): Promise<void> {
  if (!hasDatabaseConfig()) {
    throw new Error('Database is not configured')
  }

  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${RESOURCE_FILES_KEY}, ${sql.json(files as any)}, NOW())
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
  `
}

export async function saveUploadedResourceFile(input: {
  file: File
  title: string
  description: string
  category: ResourceFileCategory
  published: boolean
}): Promise<ResourceFileItem> {
  validateResourceFile(input.file)
  const title = input.title.trim()
  if (!title) throw new Error('Title is required')

  const ext = extensionForFile(input.file)
  const safeBaseName = sanitizeFilename(title)
  const filename = `${Date.now()}-${crypto.randomUUID()}-${safeBaseName}.${ext}`
  const fullPath = path.join(RESOURCE_UPLOAD_DIR, filename)
  await mkdir(RESOURCE_UPLOAD_DIR, { recursive: true })
  await writeFile(fullPath, Buffer.from(await input.file.arrayBuffer()))

  const now = new Date().toISOString()
  const item: ResourceFileItem = {
    id: crypto.randomUUID(),
    title,
    description: input.description.trim(),
    category: input.category,
    url: publicResourceUrl(filename),
    filename,
    originalFilename: input.file.name,
    mimeType: input.file.type,
    sizeBytes: input.file.size,
    published: input.published,
    createdAt: now,
    updatedAt: now,
  }

  const files = await getResourceFilesFromDb({ includeUnpublished: true })
  await saveResourceFilesToDb([item, ...files])
  return item
}

export async function updateResourceFileInDb(
  id: string,
  patch: Partial<Pick<ResourceFileItem, 'title' | 'description' | 'category' | 'published'>>
): Promise<ResourceFileItem | null> {
  const files = await getResourceFilesFromDb({ includeUnpublished: true })
  const index = files.findIndex((file) => file.id === id)
  if (index === -1) return null

  const current = files[index]
  const next: ResourceFileItem = {
    ...current,
    title: patch.title?.trim() || current.title,
    description: patch.description?.trim() ?? current.description,
    category: patch.category ?? current.category,
    published: typeof patch.published === 'boolean' ? patch.published : current.published,
    updatedAt: new Date().toISOString(),
  }
  files[index] = next
  await saveResourceFilesToDb(files)
  return next
}

export async function deleteResourceFileFromDb(id: string): Promise<boolean> {
  const files = await getResourceFilesFromDb({ includeUnpublished: true })
  const next = files.filter((file) => file.id !== id)
  if (next.length === files.length) return false
  await saveResourceFilesToDb(next)
  return true
}
