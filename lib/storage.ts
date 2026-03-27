import type { Certification, Tag, Settings } from './types'

// Use Vercel Blob in production or when BLOB_READ_WRITE_TOKEN is explicitly set.
// Fall back to local filesystem for development convenience.
const useBlob =
  process.env.NODE_ENV === 'production' || !!process.env.BLOB_READ_WRITE_TOKEN

// ─── Vercel Blob ─────────────────────────────────────────────────────────────

async function getBlobJson<T>(pathname: string, defaultValue: T): Promise<T> {
  try {
    const { list } = await import('@vercel/blob')
    const { blobs } = await list({ prefix: pathname, limit: 1 })
    const blob = blobs.find((b) => b.pathname === pathname)
    if (!blob) return defaultValue
    // Private stores require the token in the Authorization header
    const res = await fetch(blob.url, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
      cache: 'no-store',
    })
    if (!res.ok) return defaultValue
    return (await res.json()) as T
  } catch {
    return defaultValue
  }
}

async function setBlobJson<T>(pathname: string, data: T): Promise<void> {
  const { put } = await import('@vercel/blob')
  await put(pathname, JSON.stringify(data, null, 2), {
    addRandomSuffix: false,
    contentType: 'application/json',
  })
}

// ─── Local Filesystem (development) ──────────────────────────────────────────

async function getFileJson<T>(filename: string, defaultValue: T): Promise<T> {
  try {
    const { readFile } = await import('fs/promises')
    const { join } = await import('path')
    const filePath = join(process.cwd(), 'data', filename)
    const content = await readFile(filePath, 'utf-8')
    return JSON.parse(content) as T
  } catch {
    return defaultValue
  }
}

async function setFileJson<T>(filename: string, data: T): Promise<void> {
  const { writeFile, mkdir } = await import('fs/promises')
  const { join } = await import('path')
  const dir = join(process.cwd(), 'data')
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, filename), JSON.stringify(data, null, 2), 'utf-8')
}

// ─── Unified Interface ────────────────────────────────────────────────────────

function getJson<T>(key: string, defaultValue: T): Promise<T> {
  return useBlob ? getBlobJson(key, defaultValue) : getFileJson(key, defaultValue)
}

function setJson<T>(key: string, data: T): Promise<void> {
  return useBlob ? setBlobJson(key, data) : setFileJson(key, data)
}

// ─── Domain Functions ─────────────────────────────────────────────────────────

export const getCertifications = () =>
  getJson<Certification[]>('certifications.json', [])

export const setCertifications = (data: Certification[]) =>
  setJson('certifications.json', data)

export const getTags = () => getJson<Tag[]>('tags.json', [])

export const setTags = (data: Tag[]) => setJson('tags.json', data)

export const getSettings = () =>
  getJson<Settings>('settings.json', { showStats: true })

export const setSettings = (data: Settings) => setJson('settings.json', data)
