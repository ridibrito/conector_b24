import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const B24_ENDPOINT = process.env.B24_ENDPOINT || ''
  const flags = {
    B24_ENDPOINT: B24_ENDPOINT ? (B24_ENDPOINT.endsWith('/') ? 'ok-with-trailing-slash' : 'ok-but-missing-trailing-slash') : 'missing',
    B24_LINE_ID: !!process.env.B24_LINE_ID,
    CONNECTOR_SEND_ID: !!process.env.CONNECTOR_SEND_ID,
    B24_CLIENT_ID: !!process.env.B24_CLIENT_ID,
    B24_CLIENT_SECRET: !!process.env.B24_CLIENT_SECRET,
    B24_REFRESH_TOKEN: !!process.env.B24_REFRESH_TOKEN,
  }
  return NextResponse.json({ ok: true, env: flags })
}
