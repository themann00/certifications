import { NextRequest, NextResponse } from 'next/server'
import { getCertifications, setCertifications } from '@/lib/storage'
import { requireAuth } from '@/lib/api-auth'
import { deleteImage } from '@/lib/cloudinary'
import type { Certification } from '@/lib/types'

// Admin: get a single certification with all fields
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request)
  if (authError) return authError

  const { id } = await params
  const certs = await getCertifications()
  const cert = certs.find((c) => c.id === id)
  if (!cert) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(cert)
}

// Admin: update a certification
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request)
  if (authError) return authError

  const { id } = await params
  const data = await request.json()
  const certs = await getCertifications()
  const idx = certs.findIndex((c) => c.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const existing = certs[idx]
  const updated: Certification = {
    ...existing,
    name: data.name ?? existing.name,
    issuingOrg: data.issuingOrg ?? existing.issuingOrg,
    issueDate: data.issueDate ?? existing.issueDate,
    expirationDate: data.noExpiration
      ? null
      : data.expirationDate !== undefined
        ? data.expirationDate
        : existing.expirationDate,
    noExpiration: data.noExpiration ?? existing.noExpiration,
    certificationId: data.certificationId ?? existing.certificationId,
    linkUrl: data.linkUrl !== undefined ? data.linkUrl : existing.linkUrl,
    linkType: data.linkType ?? existing.linkType,
    imageUrl: data.imageUrl !== undefined ? data.imageUrl : existing.imageUrl,
    imagePublicId:
      data.imagePublicId !== undefined ? data.imagePublicId : existing.imagePublicId,
    fileType: data.fileType !== undefined ? data.fileType : existing.fileType,
    tags: data.tags ?? existing.tags,
    featured: data.featured ?? existing.featured,
    updatedAt: new Date().toISOString(),
  }

  certs[idx] = updated
  await setCertifications(certs)
  return NextResponse.json(updated)
}

// Admin: delete a certification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request)
  if (authError) return authError

  const { id } = await params
  const certs = await getCertifications()
  const cert = certs.find((c) => c.id === id)
  if (!cert) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Delete the image from Cloudinary if present
  if (cert.imagePublicId) {
    try {
      await deleteImage(cert.imagePublicId)
    } catch {
      // Don't block deletion if Cloudinary fails
    }
  }

  await setCertifications(certs.filter((c) => c.id !== id))
  return NextResponse.json({ success: true })
}
