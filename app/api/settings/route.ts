import { NextRequest, NextResponse } from 'next/server'
import { getSettings, setSettings } from '@/lib/storage'
import { requireAuth } from '@/lib/api-auth'

export async function GET() {
  const settings = await getSettings()
  return NextResponse.json(settings)
}

export async function PUT(request: NextRequest) {
  const authError = await requireAuth(request)
  if (authError) return authError

  const data = await request.json()
  const settings = await getSettings()
  const updated = { ...settings, ...data }
  await setSettings(updated)
  return NextResponse.json(updated)
}
