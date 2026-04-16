import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface CloudinaryAsset {
  publicId: string
  secureUrl: string
  resourceType: string
  format: string
  bytes: number
  createdAt: string
}

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request)
  if (authError) return authError

  try {
    const results: CloudinaryAsset[] = []

    // Fetch images
    const imageRes = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'jacobmann-me-certifications/',
      resource_type: 'image',
      max_results: 200,
    })
    for (const r of imageRes.resources ?? []) {
      results.push({
        publicId: r.public_id,
        secureUrl: r.secure_url,
        resourceType: 'image',
        format: r.format,
        bytes: r.bytes,
        createdAt: r.created_at,
      })
    }

    // Fetch raw (PDFs uploaded with resource_type auto become raw)
    const rawRes = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'jacobmann-me-certifications/',
      resource_type: 'raw',
      max_results: 200,
    })
    for (const r of rawRes.resources ?? []) {
      results.push({
        publicId: r.public_id,
        secureUrl: r.secure_url,
        resourceType: 'raw',
        format: r.format ?? 'pdf',
        bytes: r.bytes,
        createdAt: r.created_at,
      })
    }

    return NextResponse.json(results)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
