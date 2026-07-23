import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { publicUploadUrl, resolveUploadDir } from './upload-storage'

describe('upload storage helpers', () => {
  it('uses a local public/uploads directory outside production when no upload dir is configured', () => {
    expect(resolveUploadDir({ cwd: '/repo', nodeEnv: 'development' })).toBe(
      path.join('/repo', 'public', 'uploads')
    )
  })

  it('keeps the container upload directory in production', () => {
    expect(resolveUploadDir({ cwd: '/repo', nodeEnv: 'production' })).toBe('/app/public/uploads')
  })

  it('builds upload URLs from the request origin first', () => {
    expect(publicUploadUrl('image.png', 'http://localhost:3006')).toBe(
      'http://localhost:3006/api/uploads/image.png'
    )
  })
})
