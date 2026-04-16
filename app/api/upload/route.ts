import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { uploadImage, deleteImage } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request)
  if (authError) return authError

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const oldPublicId = formData.get('oldPublicId') as string | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Try to delete the old image if one is being replaced
  let oldImageMissing = false
  if (oldPublicId) {
    try {
      await deleteImage(oldPublicId)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      // Cloudinary returns "not found" when the asset doesn't exist
      if (/not found/i.test(message)) {
        oldImageMissing = true
      } else {
        console.error('Cloudinary delete error:', message)
      }
    }
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

  try {
    const { url, publicId } = await uploadImage(base64)
    return NextResponse.json({ url, publicId, oldImageMissing })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Cloudinary upload error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
