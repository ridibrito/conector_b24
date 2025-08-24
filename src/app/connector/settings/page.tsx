'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

declare global {
  interface Window {
    BX24: {
      init: (cb: () => void) => void
      callMethod: (m: string, p: Record<string, unknown>, cb: (r: { data?: () => unknown; error?: () => unknown }) => void) => void
      resizeWindow: (w: number, h: number) => void
    }
  }
}

const CONNECTOR_ID = 'EVOLUTION_CUSTOM'

type Line = { ID: number; NAME: string }
type EvoSettings = { apiKey: string; subjectId: string; evolutionUrl: string; webhookUrl: string }

export default function SettingsPage() {
  const [ready, setReady]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'unknown'|'connected'|'disconnected'>('unknown')
  const [lines, setLines]   = useState<Line[]>([{ ID: 1, NAME: 'Canal Aberto 1' }])
  const [lineId, setLineId] = useState<number>(1)
  const [log, setLog]       = useState<string[]>([])
  const once = useRef(false)

  const [evo, setEvo] = useState<EvoSettings>({ apiKey:'', subjectId:'', evolutionUrl:'', webhookUrl:'' })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<'idle'|'ok'|'err'>('idle')

  useEffect(() => {
    if (once.current) return
    once.current = true

    loadEvo()

    const s = document.createElement('script')
    s.src = 'https://api.bitrix24.com/api/v1/'
    s.onload = () => {
      try {
        window.BX24?.init(async () => {
          push('BX24 init OK')
          setReady(true)
          await loadLines()
          await check(lineId)
          safeResize()
        })
      } catch (e: unknown) { push('Falha init BX24: '+(e as Error)?.message) }
    }
    s.onerror = () => push('Falha ao carregar SDK BX24 (api/v1)')
    document.head.appendChild(s)
  }, [])

  function push(m:string){ setLog(p => [m, ...p].slice(0,120)) }
  function safeResize(){ try{ window.BX24?.resizeWindow(document.body.clientWidth, document.body.clientHeight) }catch{} }

  function call(method:string, params:Record<string, unknown> = {}): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!window.BX24) return reject(new Error('BX24 indisponível'))
      window.BX24.callMethod(method, params, (r: { data?: () => unknown; error?: () => unknown }) => {
        const err = r?.error?.()
        if (err) {
          const errObj = err as Record<string, unknown>
          const txt = (errObj?.ex as Record<string, unknown>)?.error_description || 
                      (errObj?.ex as Record<string, unknown>)?.error || 
                      JSON.stringify(err)
          push(`${method} ERROR: ${txt}`)
          reject(errObj?.ex || err)
        } else {
          push(`${method} OK`)
          resolve(r.data?.())
        }
      })
    })
  }

  async function loadLines() {
    try {
      const res = await call('imopenlines.config.list.get', {}) as Record<string, unknown>
      // normaliza o retorno em lista com ID/NAME
      const parsed: Line[] = Object
        .values(res || {})
        .map((cfg: unknown) => ({ 
          ID: Number((cfg as Record<string, unknown>).ID), 
          NAME: String((cfg as Record<string, unknown>).LINE_NAME || `Canal Aberto ${(cfg as Record<string, unknown>).ID}`) 
        }))
        .sort((a, b) => a.ID - b.ID)
      if (parsed.length) {
        setLines(parsed)
        const l10 = parsed.find(l => l.ID === 10)
        setLineId(l10 ? l10.ID : parsed[0].ID)
      }
      push(`Linhas carregadas: ${parsed.length || 1}`)
    } catch (e) {
      push('Não consegui listar Canais Abertos: ' + (e as Error)?.message)
      setLines([{ ID:1, NAME:'Canal Aberto 1' }]); setLineId(1)
    }
  }

  async function check(line:number) {
    setStatus('unknown')
    try {
      const d = await call('imconnector.status', { LINE: line, CONNECTOR: CONNECTOR_ID }) as Record<string, unknown>
      const ok = !!(d?.STATUS) && !!(d?.CONFIGURED) && d?.ERROR === false
      setStatus(ok ? 'connected' : 'disconnected')
    } catch { setStatus('disconnected') }
  }

  async function connect() {
    setLoading(true)
    try {
      await call('imconnector.activate', { LINE: lineId, CONNECTOR: CONNECTOR_ID, ACTIVE: 1 })
      await check(lineId)
    } finally { setLoading(false); safeResize() }
  }

  async function disconnect() {
    setLoading(true)
    try {
      await call('imconnector.deactivate', { LINE: lineId, CONNECTOR: CONNECTOR_ID })
      await check(lineId)
    } finally { setLoading(false); safeResize() }
  }

  // Settings (mantém seu MVP)
  async function loadEvo(){
    try {
      const r = await fetch('/api/settings')
      if (r.ok){ const d = await r.json(); setEvo({
        apiKey: d.evolutionToken || '', subjectId: d.subjectId || '', evolutionUrl: d.evolutionUrl || '', webhookUrl: d.webhookUrl || ''
      })}
    } catch(e: unknown){ push('Erro ao carregar settings: '+(e as Error)?.message) }
  }
  async function saveEvo(){
    setSaving(true); setSaveMsg('idle')
    try {
      const r = await fetch('/api/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        evolutionToken: evo.apiKey, subjectId: evo.subjectId, evolutionUrl: evo.evolutionUrl, webhookUrl: evo.webhookUrl
      })})
      if(!r.ok) throw new Error((await r.json()).error || 'Falha ao salvar')
      setSaveMsg('ok'); push('Configurações salvas'); setTimeout(()=>setSaveMsg('idle'),2500)
    } catch(e: unknown){ setSaveMsg('err'); push('Erro ao salvar: '+(e as Error)?.message) }
    finally{ setSaving(false) }
  }

  return (
    <div style={wrap}>
      <header style={hdr}>
        <Image src="/evo_logo.png" alt="Evotrix" width={56} height={56} style={logo}/>
        <div>
          <div style={title}>Evotrix</div>
          <div style={sub}>Conecte o Evotrix ao Bitrix24</div>
        </div>
      </header>

      <section style={card}>
        <label style={label}>Canal Aberto</label>
        <div style={{display:'flex', gap:8}}>
          <select value={lineId} onChange={e=>setLineId(Number(e.target.value))} disabled={!ready||loading} style={input}>
            {lines.map(l=> <option key={l.ID} value={l.ID}>{l.NAME} (ID {l.ID})</option>)}
          </select>
          <button onClick={()=>check(lineId)} disabled={!ready||loading} style={btn('#0ea5e9')}>Ver status</button>
        </div>

        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <span>Status:</span>
          <b style={{color: status==='connected' ? '#16a34a' : status==='unknown' ? '#6b7280' : '#ef4444'}}>
            {status==='unknown' ? 'verificando…' : status==='connected' ? 'Conectado' : 'Desconectado'}
          </b>
        </div>

        <div style={{display:'flex', gap:12}}>
          <button onClick={connect}    disabled={!ready||loading} style={btn('#16a34a')}>{loading?'Processando…':'Conectar'}</button>
          <button onClick={disconnect} disabled={!ready||loading} style={btn('#ef4444')}>{loading?'Processando…':'Desconectar'}</button>
        </div>
      </section>

      <section style={card}>
        <div style={{fontWeight:700}}>Evolution API (opcional no MVP)</div>
        <label style={label}>Chave da API</label>
        <input type="password" value={evo.apiKey} onChange={e=>setEvo({...evo, apiKey:e.target.value})} placeholder="Chave..." style={input}/>
        <label style={label}>Subject ID</label>
        <input value={evo.subjectId} onChange={e=>setEvo({...evo, subjectId:e.target.value})} placeholder="Subject ID..." style={input}/>
        <label style={label}>Evolution URL</label>
        <input value={evo.evolutionUrl} onChange={e=>setEvo({...evo, evolutionUrl:e.target.value})} placeholder="https://..." style={input}/>
        <label style={label}>Webhook URL</label>
        <input value={evo.webhookUrl} onChange={e=>setEvo({...evo, webhookUrl:e.target.value})} placeholder="https://..." style={input}/>
        <div style={{display:'flex', gap:12}}>
          <button onClick={saveEvo} disabled={saving} style={btn('#2563eb')}>{saving?'Salvando…':'Salvar'}</button>
          {saveMsg==='ok' && <span style={{color:'#16a34a'}}>Salvo!</span>}
          {saveMsg==='err'&& <span style={{color:'#ef4444'}}>Erro ao salvar</span>}
        </div>
      </section>

      <section style={{marginTop:16}}>
        <div style={{fontWeight:700, marginBottom:6}}>Log</div>
        <pre style={logbox}>{log.map(l=>`• ${l}\n`)}</pre>
      </section>
    </div>
  )
}

const wrap:  React.CSSProperties = { background:'#fff', padding:24, border:'1px solid #e5e7eb', borderRadius:12, fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }
const hdr:   React.CSSProperties = { display:'flex', gap:16, alignItems:'center', marginBottom:16 }
const title: React.CSSProperties = { fontSize:20, fontWeight:700 }
const sub:   React.CSSProperties = { color:'#6b7280' }
const card:  React.CSSProperties = { display:'grid', gap:10, marginBottom:14 }
const label: React.CSSProperties = { fontWeight:600 }
const input: React.CSSProperties = { width:360, padding:'9px 11px', border:'1px solid #e5e7eb', borderRadius:8 }
const logo:  React.CSSProperties = { borderRadius:12, objectFit:'contain', background:'#fff', border:'1px solid #e5e7eb' }
const logbox:React.CSSProperties = { background:'#0f172a', color:'#e5e7eb', padding:12, borderRadius:8, maxHeight:220, overflow:'auto' }
function btn(bg:string): React.CSSProperties { return { background:bg, color:'#fff', padding:'9px 14px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:600 } }
