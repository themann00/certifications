import { NextRequest, NextResponse } from 'next/server'
import { getTags, setTags, getCertifications, setCertifications } from '@/lib/storage'
import { requireAuth } from '@/lib/api-auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request)
  if (authError) return authError

  const { id } = await params
  const data = await request.json()
  const tags = await getTags()
  const idx = tags.findIndex((t) => t.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  tags[idx] = {
    ...tags[idx],
    name: data.name ?? tags[idx].name,
    color: data.color ?? tags[idx].color,
  }
  await setTags(tags)
  return NextResponse.json(tags[idx])
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request)
  if (authError) return authError

  const { id } = await params
  const tags = await getTags()
  const filtered = tags.filter((t) => t.id !== id)
  if (filtered.length === tags.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  await setTags(filtered)

  // Remove this tag from all certifications
  const certs = await getCertifications()
  const updated = certs.map((c) => ({ ...c, tags: c.tags.filter((tid) => tid !== id) }))
  await setCertifications(updated)

  return NextResponse.json({ success: true })
}
