import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const from = body.from || body.userId || 'wa-unknown'
    const chatId = body.chatId || from
    const text: string | undefined = body.text
    const mediaUrl: string | undefined = body.mediaUrl
    const messageId: string = body.messageId || (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`)
    const ts: number = Number.isFinite(body.timestamp) ? body.timestamp : Math.floor(Date.now() / 1000)

    const B24_ENDPOINT = process.env.B24_ENDPOINT
    const B24_TOKEN = process.env.B24_TOKEN
    const B24_LINE_ID = Number(process.env.B24_LINE_ID || '1')
    const CONNECTOR_SEND_ID = process.env.CONNECTOR_SEND_ID || 'evolution_custom'

    const missing: string[] = []
    if (!B24_ENDPOINT) missing.push('B24_ENDPOINT')
    if (!B24_TOKEN) missing.push('B24_TOKEN')
    if (!B24_LINE_ID) missing.push('B24_LINE_ID')

    if (missing.length) {
      return NextResponse.json({ ok: false, error: 'MISSING_ENV', missing }, { status: 500 })
    }
    if (!text && !mediaUrl) {
      return NextResponse.json({ ok: false, error: 'NO_CONTENT', hint: 'Envie text ou mediaUrl' }, { status: 400 })
    }

    const base = B24_ENDPOINT!.endsWith('/') ? B24_ENDPOINT! : B24_ENDPOINT! + '/'
    const url = base + 'imconnector.send.messages'

    const params = new URLSearchParams()
    params.set('auth', B24_TOKEN!)
    params.set('CONNECTOR', CONNECTOR_SEND_ID)
    params.set('LINE', String(B24_LINE_ID))
    params.set('MESSAGES[0][user][id]', from)
    params.set('MESSAGES[0][chat][id]', chatId)
    params.set('MESSAGES[0][message][id]', messageId)
    params.set('MESSAGES[0][message][date]', String(ts))
    if (text) params.set('MESSAGES[0][message][text]', text)
    if (!text && mediaUrl) params.set('MESSAGES[0][message][files][0][url]', mediaUrl)

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
      cache: 'no-store',
    })

    const raw = await resp.text()
    let data: unknown = null
    try { data = JSON.parse(raw) } catch { data = { raw } }

    if (!resp.ok) {
      return NextResponse.json({ ok: false, error: 'B24_ERROR', status: resp.status, data }, { status: 502 })
    }

    return NextResponse.json({ ok: true, b24: data })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'UNKNOWN' }, { status: 500 })
  }
}
