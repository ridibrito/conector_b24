'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window { 
    BX24: {
      init: (callback: () => void) => void
      callMethod: (method: string, params: Record<string, unknown>, callback: (res: { data?: () => unknown; error?: () => unknown }) => void) => void
      resizeWindow: (width: number, height: number) => void
    }
  }
}

const CONNECTOR_ID = 'EVOLUTION_CUSTOM' // id do conector
const FALLBACK_LINE = 1                 // linha padrão se o usuário não digitar nada

export default function SettingsPage() {
  const [ready, setReady] = useState(false)
  const [lineId, setLineId] = useState<number>(FALLBACK_LINE)
  const [status, setStatus] = useState<'unknown'|'connected'|'disconnected'>('unknown')
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const inited = useRef(false)

  useEffect(() => {
    if (inited.current) return
    inited.current = true

    // carrega SDK do Bitrix
    const s = document.createElement('script')
    s.src = 'https://api.bitrix24.com/api/v1/'
    s.onload = () => {
      try {
        window.BX24?.init(() => {
          setReady(true)
          checkStatus(lineId)
          try { window.BX24.resizeWindow(document.body.clientWidth, document.body.clientHeight) } catch {}
        })
      } catch (e) {
        pushLog('Falha ao inicializar BX24: ' + (e as Error)?.message)
      }
    }
    s.onerror = () => pushLog('Não foi possível carregar o SDK do Bitrix (api/v1)')
    document.head.appendChild(s)
  }, [])

  function pushLog(line: string) {
    setLog(prev => [line, ...prev].slice(0, 60))
  }

  function call(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!window.BX24) return reject(new Error('BX24 indisponível'))
      window.BX24.callMethod(method, params, (res: { data?: () => unknown; error?: () => unknown }) => {
        const err = res?.error?.()
        if (err) {
          const errObj = err as Record<string, unknown>
          const msg = (errObj?.ex as Record<string, unknown>)?.error_description || 
                      (errObj?.ex as Record<string, unknown>)?.error || 
                      JSON.stringify(err)
          pushLog(`${method} ERROR: ${msg}`)
          reject(errObj?.ex || err)
        } else {
          pushLog(`${method} OK`)
          resolve(res.data?.())
        }
      })
    })
  }

  async function checkStatus(line: number) {
    if (!ready) return
    setStatus('unknown')
    try {
      const data = await call('imconnector.status', { LINE: line, CONNECTOR: CONNECTOR_ID }) as Record<string, unknown>
      const ok = !!(data?.STATUS) && !!(data?.CONFIGURED) && data?.ERROR === false
      setStatus(ok ? 'connected' : 'disconnected')
    } catch {
      setStatus('disconnected')
    }
  }

  async function doActivate() {
    if (!lineId) return
    setLoading(true)
    try {
      await call('imconnector.activate', { LINE: lineId, CONNECTOR: CONNECTOR_ID, ACTIVE: 1 })
      await checkStatus(lineId)
    } finally {
      setLoading(false)
      try { window.BX24?.resizeWindow(document.body.clientWidth, document.body.clientHeight) } catch {}
    }
  }

  async function doDeactivate() {
    if (!lineId) return
    setLoading(true)
    try {
      await call('imconnector.deactivate', { LINE: lineId, CONNECTOR: CONNECTOR_ID })
      await checkStatus(lineId)
    } finally {
      setLoading(false)
      try { window.BX24?.resizeWindow(document.body.clientWidth, document.body.clientHeight) } catch {}
    }
  }

  return (
    <div className="p-6 space-y-5" style={{ fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
      <header style={{ display:'flex', gap:16, alignItems:'center' }}>
        <div style={{ width:56, height:56, borderRadius:28, background:'#25D366', color:'#fff', display:'grid', placeItems:'center', fontWeight:700 }}>WA</div>
        <div>
          <div style={{ fontSize:20, fontWeight:700 }}>Evolution WhatsApp</div>
          <div style={{ color:'#6b7280' }}>Ative/desative o conector em uma Linha (Canal Aberto) específica.</div>
        </div>
      </header>

      <section style={{ display:'grid', gap:12 }}>
        <label style={{ fontWeight:600 }}>ID do Canal Aberto (LINE):</label>
        <input
          type="number"
          min={1}
          value={lineId}
          onChange={e => setLineId(Number(e.target.value))}
          disabled={!ready || loading}
          style={{ width:220, padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:8 }}
        />
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <span>Status:</span>
          <b style={{ color: status==='connected' ? '#16a34a' : status==='unknown' ? '#6b7280' : '#ef4444' }}>
            {status==='unknown' ? 'verificando…' : status==='connected' ? 'Conectado' : 'Desconectado'}
          </b>
          <button onClick={() => checkStatus(lineId)} disabled={!ready || loading} style={btn('#0ea5e9')}>Atualizar status</button>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={doActivate} disabled={!ready || loading} style={btn('#16a34a')}>
            {loading ? 'Processando…' : 'Conectar nesta linha'}
          </button>
          <button onClick={doDeactivate} disabled={!ready || loading} style={btn('#ef4444')}>
            {loading ? 'Processando…' : 'Desconectar desta linha'}
          </button>
        </div>
        <div style={{ color:'#6b7280', fontSize:13 }}>
          Dica: Se você usa múltiplos números/instâncias, ative o conector em cada linha e
          faça a Evolution enviar o <code>lineId</code> no webhook para direcionar corretamente.
        </div>
      </section>

      <section>
        <div style={{ fontWeight:700, marginBottom:8 }}>Log</div>
        <pre style={{ background:'#0f172a', color:'#e5e7eb', padding:12, borderRadius:8, maxHeight:220, overflow:'auto' }}>
{log.map((l)=>`• ${l}\n`)}
        </pre>
      </section>
    </div>
  )
}

function btn(bg:string): React.CSSProperties {
  return {
    background:bg, color:'#fff', padding:'8px 14px', borderRadius:8,
    border:'none', cursor:'pointer', fontWeight:600
  }
}
