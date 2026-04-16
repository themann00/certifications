import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { getCertifications } from '@/lib/storage'

// Admin: get all certifications with full fields (including imagePublicId)
export async function GET(request: NextRequest) {
  const authError = await requireAuth(request)
  if (authError) return authError

  const certs = await getCertifications()
  return NextResponse.json(certs)
}
