import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const B24_ENDPOINT = process.env.B24_ENDPOINT || ''
  const B24_TOKEN = process.env.B24_TOKEN
  const B24_LINE_ID = process.env.B24_LINE_ID
  const CONNECTOR_SEND_ID = process.env.CONNECTOR_SEND_ID

  return NextResponse.json({
    ok: true,
    env: {
      B24_ENDPOINT: B24_ENDPOINT ? (B24_ENDPOINT.endsWith('/') ? 'ok-with-trailing-slash' : 'ok-but-missing-trailing-slash') : 'missing',
      B24_TOKEN: !!B24_TOKEN,
      B24_LINE_ID: !!B24_LINE_ID,
      CONNECTOR_SEND_ID: !!CONNECTOR_SEND_ID,
    },
  })
}
