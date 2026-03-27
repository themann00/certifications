import { NextRequest, NextResponse } from 'next/server'
import { getTags, setTags } from '@/lib/storage'
import { requireAuth } from '@/lib/api-auth'
import type { Tag } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  const tags = await getTags()
  return NextResponse.json(tags)
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request)
  if (authError) return authError

  const data = await request.json()
  const tags = await getTags()

  const newTag: Tag = {
    id: uuidv4(),
    name: data.name ?? 'New Tag',
    color: data.color ?? 'black',
  }

  tags.push(newTag)
  await setTags(tags)
  return NextResponse.json(newTag, { status: 201 })
}
