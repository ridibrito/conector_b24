import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || ''
  let parsed: unknown = null
  let raw = ''
  try {
    raw = await req.text()
    parsed = JSON.parse(raw)
  } catch {
    parsed = raw
  }
  return NextResponse.json({
    ok: true,
    contentType,
    headers: Object.fromEntries(req.headers.entries()),
    body: parsed,
  })
}
