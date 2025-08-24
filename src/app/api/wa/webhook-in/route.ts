import { NextRequest, NextResponse } from 'next/server'

/* eslint-disable @typescript-eslint/no-explicit-any */

type Inbound = {
  from: string
  chatId: string
  text: string
  messageId: string
  timestamp: number
  lineId?: number
}

function onlyDigits(s: string) {
  return (s || '').replace(/\D+/g, '')
}

function unixNow() {
  return Math.floor(Date.now() / 1000)
}

// ------------ Parsers --------------

// 1) Nosso formato "simples"
function parseSimple(body: any): Inbound | null {
  if (!body) return null
  if (!body.from || !(body.text || body.caption)) return null
  const ts = Number(body.timestamp ?? unixNow())
  return {
    from: body.from,
    chatId: body.chatId || `wa-chat-${onlyDigits(String(body.from))}`,
    text: String(body.text ?? body.caption ?? ''),
    messageId: String(body.messageId ?? `msg-${Date.now()}`),
    timestamp: isNaN(ts) ? unixNow() : ts,
    lineId: body.lineId ? Number(body.lineId) : undefined,
  }
}

// 2) Evolution API (messages.upsert / message_upsert)
function extractTextFromMessage(msg: any): string | null {
  if (!msg) return null
  const m = msg.message ?? msg
  return (
    m?.conversation ??
    m?.extendedTextMessage?.text ??
    m?.imageMessage?.caption ??
    m?.videoMessage?.caption ??
    m?.documentMessage?.caption ??
    m?.buttonsResponseMessage?.selectedDisplayText ??
    m?.templateButtonReplyMessage?.selectedId ??
    null
  )
}

function parseEvolution(body: any): Inbound | null {
  if (!body) return null

  // Sinais típicos
  const isUpsert =
    String(body?.event || body?.type || '').toLowerCase().includes('message') ||
    body?.data?.messages ||
    body?.messages

  if (!isUpsert) return null

  // Pega o primeiro "message" onde geralmente está a carga útil
  const candidate =
    body?.data?.messages?.[0] ??
    body?.messages?.[0] ??
    body?.data ??
    body?.message ??
    null

  if (!candidate) return null

  // remoteJid: "5511999999999@s.whatsapp.net" | "xxxx@g.us"
  const remoteJid =
    candidate?.key?.remoteJid ??
    candidate?.remoteJid ??
    body?.remoteJid ??
    null
  if (!remoteJid) return null

  const isGroup = String(remoteJid).includes('@g.us')
  const bare = onlyDigits(String(remoteJid))
  const numberId = bare || String(remoteJid).split('@')[0]
  const from = `wa-${numberId}`
  const chatId = isGroup ? `wa-chat-${numberId}` : `wa-chat-${numberId}`

  const messageId =
    candidate?.key?.id ??
    candidate?.id ??
    body?.messageId ??
    `msg-${Date.now()}`

  const timestamp =
    Number(candidate?.messageTimestamp ?? candidate?.timestamp ?? body?.timestamp ?? unixNow()) ||
    unixNow()

  const text =
    extractTextFromMessage(candidate) ??
    extractTextFromMessage(candidate?.messages?.[0]) ??
    extractTextFromMessage(body) ??
    '(mensagem recebida)'

  const lineId =
    Number(body?.lineId ?? body?.LINE ?? body?.data?.lineId ?? body?.data?.LINE) || undefined

  return {
    from,
    chatId,
    text: String(text),
    messageId: String(messageId),
    timestamp,
    lineId,
  }
}

// ------------ Bitrix --------------

async function getAuth(): Promise<string> {
  const token = process.env.B24_TOKEN
  if (token) return token

  // Auto-refresh, se credenciais estiverem configuradas
  const cid = process.env.B24_CLIENT_ID
  const cs  = process.env.B24_CLIENT_SECRET
  const rt  = process.env.B24_REFRESH_TOKEN

  if (!cid || !cs || !rt) {
    throw new Error('B24 auth ausente (B24_TOKEN) e sem credenciais de refresh')
  }

  const url = `https://oauth.bitrix.info/oauth/token/?grant_type=refresh_token&client_id=${cid}&client_secret=${cs}&refresh_token=${rt}`
  const r = await fetch(url)
  const j = await r.json().catch(() => ({}))
  if (!j?.access_token) throw new Error('Falha no refresh OAuth do Bitrix')
  // Opcional: cache em variável global para a vida da request
  ;(globalThis as any).__B24_TOKEN = j.access_token
  return j.access_token
}

async function sendToBitrix(inb: Inbound) {
  const endpoint = process.env.B24_ENDPOINT || ''
  const line     = String(inb.lineId ?? process.env.B24_LINE_ID ?? '1')
  const connector = String(process.env.CONNECTOR_SEND_ID || 'evolution_custom').toLowerCase()

  if (!endpoint.endsWith('/')) {
    throw new Error('B24_ENDPOINT deve terminar com / (ex.: https://SEU.bitrix24.com.br/rest/ )')
  }

  const auth = await getAuth()
  const form = new URLSearchParams()
  form.set('auth', auth)
  form.set('CONNECTOR', connector)
  form.set('LINE', line)
  form.set('MESSAGES[0][user][id]', inb.from)
  form.set('MESSAGES[0][chat][id]', inb.chatId)
  form.set('MESSAGES[0][message][id]', inb.messageId)
  form.set('MESSAGES[0][message][date]', String(inb.timestamp))
  form.set('MESSAGES[0][message][text]', inb.text || '')

  const url = endpoint + 'imconnector.send.messages'
  let resp = await fetch(url, { method: 'POST', body: form })
  let json: any = await resp.json().catch(() => ({}))

  // Se expirou e temos credenciais, tenta 1 refresh
  if (resp.status === 401 || json?.error === 'expired_token') {
    ;(globalThis as any).__B24_TOKEN = undefined
    const auth2 = await getAuth()
    form.set('auth', auth2)
    resp = await fetch(url, { method: 'POST', body: form })
    json = await resp.json().catch(() => ({}))
  }

  return { status: resp.status, json }
}

// ------------ Handler -------------

export async function POST(req: NextRequest) {
  // Token opcional de segurança (defina EVOLUTION_WEBHOOK_TOKEN no Vercel e use header X-Webhook-Token no Manager)
  const requiredToken = process.env.EVOLUTION_WEBHOOK_TOKEN
  const got = req.headers.get('x-webhook-token')
  if (requiredToken && got !== requiredToken) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED_WEBHOOK' }, { status: 401 })
  }

  let body: any = null
  try {
    body = await req.json()
  } catch {
    // tenta application/x-www-form-urlencoded
    const text = await req.text().catch(() => '')
    try {
      body = JSON.parse(text)
    } catch {
      const params = new URLSearchParams(text)
      body = Object.fromEntries(params.entries())
    }
  }

  // Tenta ambos parsers
  const inbound = parseSimple(body) || parseEvolution(body)
  if (!inbound) {
    return NextResponse.json({ ok: false, error: 'UNSUPPORTED_PAYLOAD', body }, { status: 200 })
  }

  try {
    const b24 = await sendToBitrix(inbound)
    return NextResponse.json({ ok: true, inbound, b24 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'B24_ERROR', detail: e?.message ?? String(e) }, { status: 502 })
  }
}

// Saúde do endpoint
export async function GET() {
  return NextResponse.json({ ok: true, handler: 'wa/webhook-in' })
}
