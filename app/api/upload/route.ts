import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request)
  if (authError) return authError

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

  try {
    const { url, publicId } = await uploadImage(base64)
    return NextResponse.json({ url, publicId })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Cloudinary upload error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
