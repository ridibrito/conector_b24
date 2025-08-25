import { NextRequest, NextResponse } from 'next/server'

const CONNECTOR = (process.env.CONNECTOR_SEND_ID || 'evolution_custom').toLowerCase()
const SEND_STYLE = (process.env.EVOLUTION_SEND_STYLE || 'remoteJid').toLowerCase()
const SEND_PATH  = process.env.EVOLUTION_SEND_PATH || '/messages/sendText'

function extractText(msg: any): string | null {
  if (!msg) return null
  return msg.text ?? msg.MESSAGE ?? msg.message ?? msg.body ?? null
}

function extractRemoteJid(payload: any): string | null {
  const userId: string | undefined =
    payload?.USER?.ID ?? payload?.user?.id ?? payload?.USER_ID ?? payload?.user_id
  const chatId: string | undefined =
    payload?.CHAT?.ID ?? payload?.chat?.id
  const raw = String(userId || chatId || '')
  if (!raw) return null
  const digits = raw.replace(/\D+/g, '')
  if (!digits) return null
  return `${digits}@s.whatsapp.net`
}

function buildBody(jid: string, text: string) {
  const digits = jid.replace(/\D+/g, '')
  const plusE164 = digits.startsWith('+') ? digits : `+${digits}`
  switch (SEND_STYLE) {
    case 'number':  return { number: digits, text }
    case 'toe164':  return { to: plusE164, text }
    case 'jid':     return { jid, message: text }
    default:        return { remoteJid: jid, text }
  }
}

async function sendToEvolution(remoteJid: string, text: string) {
  const base = process.env.EVOLUTION_URL || ''
  if (!base) throw new Error('EVOLUTION_URL ausente')
  const url = base.replace(/\/$/, '') + SEND_PATH

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (process.env.EVOLUTION_TOKEN) headers.Authorization = `Bearer ${process.env.EVOLUTION_TOKEN}`

  const bodyObj = buildBody(remoteJid, text)
  const body = JSON.stringify(bodyObj)

  const r = await fetch(url, { method: 'POST', headers, body })
  const txt = await r.text()
  let parsed: any = null
  try { parsed = JSON.parse(txt) } catch { parsed = { raw: txt } }

  if (!r.ok) {
    throw new Error(`Evolution send falhou: ${r.status} ${JSON.stringify(parsed)}`)
  }
  return parsed
}

export async function POST(req: NextRequest) {
  let body: any = null
  try { body = await req.json() } catch { body = {} }

  const event = String(body?.event || body?.EVENT || '')
  const data  = body?.data || body?.DATA || {}

  const connector = String(data?.CONNECTOR || '').toLowerCase()
  if (!connector || connector !== CONNECTOR) {
    return NextResponse.json({ ok: true, skipped: 'connector_mismatch' })
  }
  if (!/OnImConnectorMessageAdd/i.test(event)) {
    return NextResponse.json({ ok: true, skipped: 'event_ignored', event })
  }

  const text = extractText(data?.MESSAGE)
  const remoteJid = extractRemoteJid(data)
  if (!text || !remoteJid) {
    return NextResponse.json({ ok: false, error: 'MISSING_FIELDS', have: { text: !!text, remoteJid: !!remoteJid } }, { status: 200 })
  }

  try {
    const evo = await sendToEvolution(remoteJid, text)
    return NextResponse.json({ ok: true, sent: { remoteJid, text, style: SEND_STYLE, path: SEND_PATH }, evo })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'EVOLUTION_SEND_ERROR', detail: e?.message ?? String(e) }, { status: 502 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, handler: 'b24/events/imconnector', style: SEND_STYLE, path: SEND_PATH })
}

