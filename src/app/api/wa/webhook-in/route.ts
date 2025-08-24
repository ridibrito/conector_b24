import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// cache em memória (sobrevive a alguns requests no mesmo pod)
// eslint-disable-next-line prefer-const
let cachedAuth: { access_token?: string; expires_at?: number; refresh_token?: string; endpoint?: string } = {}

async function refreshToken() {
  const client_id = process.env.B24_CLIENT_ID!
  const client_secret = process.env.B24_CLIENT_SECRET!
  const refresh_token = cachedAuth.refresh_token || process.env.B24_REFRESH_TOKEN!
  const url = `https://oauth.bitrix.info/oauth/token/?grant_type=refresh_token&client_id=${encodeURIComponent(client_id)}&client_secret=${encodeURIComponent(client_secret)}&refresh_token=${encodeURIComponent(refresh_token)}`
  const resp = await fetch(url, { method: 'GET', cache: 'no-store' })
  const data = await resp.json()
  if (!resp.ok || !data.access_token) {
    throw new Error(`REFRESH_FAIL: ${resp.status} ${JSON.stringify(data)}`)
  }
  cachedAuth.access_token = data.access_token
  cachedAuth.refresh_token = data.refresh_token || refresh_token
  cachedAuth.endpoint = data.client_endpoint || process.env.B24_ENDPOINT
  // Bitrix costuma expirar ~3600s; guardo margem
  cachedAuth.expires_at = Math.floor(Date.now()/1000) + (data.expires_in ?? 3600) - 60
  return cachedAuth
}

function needRefresh() {
  if (!cachedAuth.access_token) return true
  const now = Math.floor(Date.now()/1000)
  return !cachedAuth.expires_at || cachedAuth.expires_at <= now
}

async function sendToBitrix(params: URLSearchParams) {
  const base = (cachedAuth.endpoint || process.env.B24_ENDPOINT || '').trim()
  const endpoint = base.endsWith('/') ? base : base + '/'
  const url = endpoint + 'imconnector.send.messages'
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
    cache: 'no-store',
  })
  const raw = await resp.text()
  let data: Record<string, unknown>; try { data = JSON.parse(raw) } catch { data = { raw } }
  return { ok: resp.ok, status: resp.status, data }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const from = body.from || body.userId || 'wa-unknown'
    const chatId = body.chatId || from
    const text: string | undefined = body.text
    const mediaUrl: string | undefined = body.mediaUrl
    const messageId: string = body.messageId || (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`)
    const ts: number = Number.isFinite(body.timestamp) ? body.timestamp : Math.floor(Date.now() / 1000)

    // ENVs base
    const B24_ENDPOINT = process.env.B24_ENDPOINT
    const B24_LINE_ID = Number(process.env.B24_LINE_ID || '1')
    const CONNECTOR_SEND_ID = process.env.CONNECTOR_SEND_ID || 'evolution_custom'
    const clientId = process.env.B24_CLIENT_ID
    const clientSecret = process.env.B24_CLIENT_SECRET
    const refreshEnv = process.env.B24_REFRESH_TOKEN

    const missing: string[] = []
    if (!B24_ENDPOINT) missing.push('B24_ENDPOINT')
    if (!B24_LINE_ID) missing.push('B24_LINE_ID')
    if (!CONNECTOR_SEND_ID) missing.push('CONNECTOR_SEND_ID')
    if (!clientId) missing.push('B24_CLIENT_ID')
    if (!clientSecret) missing.push('B24_CLIENT_SECRET')
    if (!refreshEnv && !cachedAuth.refresh_token) missing.push('B24_REFRESH_TOKEN')

    if (missing.length) {
      return NextResponse.json({ ok: false, error: 'MISSING_ENV', missing }, { status: 500 })
    }
    if (!text && !mediaUrl) {
      return NextResponse.json({ ok: false, error: 'NO_CONTENT', hint: 'Envie text ou mediaUrl' }, { status: 400 })
    }

    // garante token válido
    if (needRefresh()) {
      await refreshToken()
    }

    const params = new URLSearchParams()
    params.set('auth', cachedAuth.access_token!) // usa o token em memória
    params.set('CONNECTOR', CONNECTOR_SEND_ID)
    params.set('LINE', String(B24_LINE_ID))
    params.set('MESSAGES[0][user][id]', from)
    params.set('MESSAGES[0][chat][id]', chatId)
    params.set('MESSAGES[0][message][id]', messageId)
    params.set('MESSAGES[0][message][date]', String(ts))
    if (text) params.set('MESSAGES[0][message][text]', text)
    if (!text && mediaUrl) params.set('MESSAGES[0][message][files][0][url]', mediaUrl)

    // tenta 1x
    let res = await sendToBitrix(params)

    // se expirou no meio, faz refresh e re-tenta 1x
    const expired = (!res.ok && (res.status === 401 || res.data?.error === 'expired_token'))
    if (expired) {
      await refreshToken()
      params.set('auth', cachedAuth.access_token!)
      res = await sendToBitrix(params)
    }

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: 'B24_ERROR', status: res.status, data: res.data }, { status: 502 })
    }

    return NextResponse.json({ ok: true, b24: res.data })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'UNKNOWN' }, { status: 500 })
  }
}
