import { NextRequest, NextResponse } from 'next/server'
import { getCertifications, setCertifications } from '@/lib/storage'
import { requireAuth } from '@/lib/api-auth'
import type { Certification, PublicCertification } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

function toPublic(cert: Certification): PublicCertification {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { certificationId, imagePublicId, ...rest } = cert
  return rest
}

// Public: get all certifications (sensitive fields stripped)
export async function GET() {
  const certs = await getCertifications()
  return NextResponse.json(certs.map(toPublic))
}

// Admin: create a new certification
export async function POST(request: NextRequest) {
  const authError = await requireAuth(request)
  if (authError) return authError

  const data = await request.json()
  const certs = await getCertifications()

  const now = new Date().toISOString()
  const newCert: Certification = {
    id: uuidv4(),
    name: data.name ?? '',
    issuingOrg: data.issuingOrg ?? '',
    issueDate: data.issueDate ?? '',
    expirationDate: data.noExpiration ? null : (data.expirationDate ?? null),
    noExpiration: data.noExpiration ?? false,
    certificationId: data.certificationId ?? '',
    linkUrl: data.linkUrl ?? null,
    linkType: data.linkType ?? 'hidden',
    imageUrl: data.imageUrl ?? null,
    imagePublicId: data.imagePublicId ?? null,
    tags: data.tags ?? [],
    featured: data.featured ?? false,
    createdAt: now,
    updatedAt: now,
  }

  try {
    certs.push(newCert)
    await setCertifications(certs)
    return NextResponse.json(newCert, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('POST /api/certifications error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
