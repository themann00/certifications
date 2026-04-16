import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { getCertifications, setCertifications } from '@/lib/storage'

// PATCH /api/admin/relink-image
// Body: { certId, imageUrl, imagePublicId, fileType }
export async function PATCH(request: NextRequest) {
  const authError = await requireAuth(request)
  if (authError) return authError

  const { certId, imageUrl, imagePublicId, fileType } = await request.json()
  if (!certId || !imageUrl) {
    return NextResponse.json({ error: 'certId and imageUrl required' }, { status: 400 })
  }

  const certs = await getCertifications()
  const idx = certs.findIndex((c) => c.id === certId)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  certs[idx] = {
    ...certs[idx],
    imageUrl,
    imagePublicId: imagePublicId ?? certs[idx].imagePublicId,
    fileType: fileType ?? certs[idx].fileType,
    updatedAt: new Date().toISOString(),
  }

  await setCertifications(certs)
  return NextResponse.json(certs[idx])
}
