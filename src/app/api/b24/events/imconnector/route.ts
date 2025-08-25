import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CONNECTOR = (process.env.CONNECTOR_SEND_ID || 'evolution_custom').toLowerCase()

function ok(data: any, status = 200) {
  return NextResponse.json(data, { status })
}

/** tenta pegar texto de diferentes formatos do Bitrix */
function extractText(msg: any): string | null {
  if (!msg) return null
  return msg.text ?? msg.MESSAGE ?? msg.message ?? msg.body ?? null
}

/** converte user/chat "wa-5511..." -> "5511...@s.whatsapp.net" */
function extractRemoteJid(payload: any): string | null {
  const userId: string | undefined =
    payload?.USER?.ID ?? payload?.user?.id ?? payload?.USER_ID ?? payload?.user_id
  const chatId: string | undefined =
    payload?.CHAT?.ID ?? payload?.chat?.id

  const raw = String(userId || chatId || '')
  const digits = raw.replace(/\D+/g, '')
  if (!digits) return null
  return `${digits}@s.whatsapp.net`
}

async function sendToEvolution(remoteJid: string, text: string) {
  const base = (process.env.EVOLUTION_URL || '').replace(/\/$/, '')
  const path = process.env.EVOLUTION_SEND_PATH || '/messages/sendText'
  if (!base) return { ok: false, error: 'EVOLUTION_URL_MISSING' }

  const url = base + path
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (process.env.EVOLUTION_TOKEN) headers.Authorization = `Bearer ${process.env.EVOLUTION_TOKEN}`

  const body = JSON.stringify({ remoteJid, text })
  const r = await fetch(url, { method: 'POST', headers, body })
  const data = await r.json().catch(() => ({}))
  return r.ok ? { ok: true, data } : { ok: false, status: r.status, data }
}

export async function GET() {
  return ok({
    ok: true,
    handler: 'b24/events/imconnector',
    env: {
      CONNECTOR_SEND_ID: !!process.env.CONNECTOR_SEND_ID,
      EVOLUTION_URL: !!process.env.EVOLUTION_URL,
      EVOLUTION_SEND_PATH: process.env.EVOLUTION_SEND_PATH || '/messages/sendText',
      EVOLUTION_TOKEN: !!process.env.EVOLUTION_TOKEN,
    }
  })
}

export async function POST(req: NextRequest) {
  let body: any = null
  try { body = await req.json() } catch { return ok({ ok:false, error:'INVALID_JSON' }, 200) }

  const event = String(body?.event || body?.EVENT || '')
  const data  = body?.data || body?.DATA || {}

  const connector = String(data?.CONNECTOR || '').toLowerCase()
  if (connector !== CONNECTOR) {
    return ok({ ok:true, skipped:'connector_mismatch', expected: CONNECTOR, got: connector })
  }

  if (!/OnImConnectorMessageAdd/i.test(event)) {
    return ok({ ok:true, skipped:'event_ignored', event })
  }

  const text = extractText(data?.MESSAGE)
  const remoteJid = extractRemoteJid(data)
  if (!text || !remoteJid) {
    return ok({ ok:false, error:'MISSING_FIELDS', have:{ text:!!text, remoteJid:!!remoteJid } }, 200)
  }

  const evo = await sendToEvolution(remoteJid, text)
  return evo.ok
    ? ok({ ok:true, sent:{ remoteJid, text }, evo: evo.data })
    : ok({ ok:false, error:'EVOLUTION_SEND_ERROR', detail:evo }, 200)
}

