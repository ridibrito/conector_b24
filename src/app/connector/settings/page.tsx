'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

declare global { 
  interface Window { 
    BX24: {
      init: (callback: () => void) => void
      callMethod: (method: string, params: Record<string, unknown>, callback: (res: { data?: () => unknown; error?: () => unknown }) => void) => void
      resizeWindow: (width: number, height: number) => void
    }
  } 
}

const CONNECTOR_ID = 'EVOLUTION_CUSTOM'
const FALLBACK_LINE = 1

interface EvolutionSettings {
  apiKey: string
  subjectId: string
  evolutionUrl: string
  webhookUrl: string
}

export default function SettingsPage() {
  const [ready, setReady] = useState(false)
  const [lineId, setLineId] = useState<number>(FALLBACK_LINE)
  const [status, setStatus] = useState<'unknown'|'connected'|'disconnected'>('unknown')
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const inited = useRef(false)

  // Evolution Settings
  const [evolutionSettings, setEvolutionSettings] = useState<EvolutionSettings>({
    apiKey: '',
    subjectId: '',
    evolutionUrl: '',
    webhookUrl: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (inited.current) return
    inited.current = true

    // Carregar configurações da Evolution
    loadEvolutionSettings()

    const s = document.createElement('script')
    s.src = 'https://api.bitrix24.com/api/v1/'
    s.onload = () => {
      try {
        window.BX24?.init(() => {
          setReady(true)
          checkStatus(FALLBACK_LINE)
          try { window.BX24.resizeWindow(document.body.clientWidth, document.body.clientHeight) } catch {}
        })
      } catch (e) {
        pushLog('Falha ao inicializar BX24: ' + (e as Error)?.message)
      }
    }
    s.onerror = () => pushLog('Não foi possível carregar o SDK do Bitrix (api/v1)')
    document.head.appendChild(s)
  }, [])

  // Carregar configurações da Evolution
  const loadEvolutionSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setEvolutionSettings({
          apiKey: data.evolutionToken || '',
          subjectId: data.subjectId || '',
          evolutionUrl: data.evolutionUrl || '',
          webhookUrl: data.webhookUrl || ''
        })
      }
    } catch (error) {
      pushLog('Erro ao carregar configurações: ' + (error as Error)?.message)
    }
  }

  // Salvar configurações da Evolution
  const saveEvolutionSettings = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evolutionToken: evolutionSettings.apiKey,
          subjectId: evolutionSettings.subjectId,
          evolutionUrl: evolutionSettings.evolutionUrl,
          webhookUrl: evolutionSettings.webhookUrl
        })
      })

      if (response.ok) {
        setSaveStatus('success')
        pushLog('Configurações salvas com sucesso')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setSaveStatus('error')
      pushLog('Erro ao salvar configurações: ' + (error as Error)?.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Testar conexão com Evolution
  const testEvolutionConnection = async () => {
    try {
      pushLog('Testando conexão com Evolution API...')
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()
      
      if (result.success) {
        pushLog('✅ Conexão com Evolution API: OK')
      } else {
        pushLog('❌ Conexão com Evolution API: ' + result.error)
      }
    } catch (error) {
      pushLog('❌ Erro ao testar conexão: ' + (error as Error)?.message)
    }
  }

  function pushLog(msg:string){ setLog(p => [msg, ...p].slice(0,80)) }

  function call(method:string, params: Record<string, unknown> = {}): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!window.BX24) return reject(new Error('BX24 indisponível'))
      window.BX24.callMethod(method, params, (res: { data?: () => unknown; error?: () => unknown }) => {
        const err = res?.error?.()
        if (err) {
          const errObj = err as Record<string, unknown>
          const txt = (errObj?.ex as Record<string, unknown>)?.error_description || 
                      (errObj?.ex as Record<string, unknown>)?.error || 
                      JSON.stringify(err)
          pushLog(`${method} ERROR: ${txt}`)
          reject(errObj?.ex || err)
        } else {
          pushLog(`${method} OK`)
          resolve(res.data?.())
        }
      })
    })
  }

  async function checkStatus(line:number) {
    if (!ready) return
    setStatus('unknown')
    try {
      const d = await call('imconnector.status', { LINE: line, CONNECTOR: CONNECTOR_ID }) as Record<string, unknown>
      const ok = !!(d?.STATUS) && !!(d?.CONFIGURED) && d?.ERROR === false
      setStatus(ok ? 'connected' : 'disconnected')
    } catch { setStatus('disconnected') }
  }

  async function doActivate() {
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
    <div style={{ background:'#fff', padding:'20px', fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <Image src="/evo_logo.png" alt="Evotrix" width={40} height={40} style={{ borderRadius:8, objectFit:'contain' }}/>
        <div>
          <div style={{ fontSize:18, fontWeight:600, color:'#333' }}>Evolution WhatsApp</div>
          <div style={{ fontSize:13, color:'#666' }}>Conecte sua Evolution API ao Bitrix24</div>
        </div>
      </div>

      {/* Configurações */}
      <div style={{ display:'grid', gap:16 }}>
        
        {/* Campo 1: Chave da API */}
        <div>
          <label style={{ display:'block', fontWeight:600, marginBottom:6, color:'#333' }}>Chave da API</label>
          <input 
            type="password" 
            value={evolutionSettings.apiKey}
            onChange={e => setEvolutionSettings(prev => ({ ...prev, apiKey: e.target.value }))}
            placeholder="Digite sua chave da Evolution API"
            style={{ width:'100%', padding:'10px 12px', border:'1px solid #ddd', borderRadius:6, fontSize:14 }}
          />
        </div>

        {/* Campo 2: Subject ID */}
        <div>
          <label style={{ display:'block', fontWeight:600, marginBottom:6, color:'#333' }}>Subject ID</label>
          <input 
            type="text" 
            value={evolutionSettings.subjectId}
            onChange={e => setEvolutionSettings(prev => ({ ...prev, subjectId: e.target.value }))}
            placeholder="Um Subject ID para um Canal Aberto"
            style={{ width:'100%', padding:'10px 12px', border:'1px solid #ddd', borderRadius:6, fontSize:14 }}
          />
        </div>

        {/* Campo 3: Canal Aberto */}
        <div>
          <label style={{ display:'block', fontWeight:600, marginBottom:6, color:'#333' }}>Canal Aberto</label>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <select 
              value={lineId}
              onChange={e => setLineId(Number(e.target.value))}
              style={{ flex:1, padding:'10px 12px', border:'1px solid #ddd', borderRadius:6, fontSize:14 }}
            >
              <option value={1}>Canal Aberto 1</option>
              <option value={2}>Canal Aberto 2</option>
              <option value={3}>Canal Aberto 3</option>
            </select>
            <button 
              onClick={() => checkStatus(lineId)}
              disabled={!ready || loading}
              style={{ padding:'10px 16px', background:'#f0f0f0', border:'1px solid #ddd', borderRadius:6, fontSize:14, cursor:'pointer' }}
            >
              CONFIGURAR
            </button>
          </div>
        </div>

        {/* Status */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:12, background:'#f8f9fa', borderRadius:6 }}>
          <span style={{ fontSize:14, color:'#666' }}>Status:</span>
          <span style={{ 
            fontSize:14, 
            fontWeight:600,
            color: status==='connected' ? '#28a745' : status==='unknown' ? '#6c757d' : '#dc3545' 
          }}>
            {status==='unknown' ? 'Verificando...' : status==='connected' ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        {/* Botões de Ação */}
        <div style={{ display:'flex', gap:12 }}>
          <button 
            onClick={doActivate} 
            disabled={!ready || loading || !evolutionSettings.apiKey}
            style={{ 
              flex:1,
              padding:'12px 20px', 
              background: (!ready || loading || !evolutionSettings.apiKey) ? '#e9ecef' : '#28a745',
              color: (!ready || loading || !evolutionSettings.apiKey) ? '#6c757d' : '#fff',
              border:'none', 
              borderRadius:6, 
              fontSize:14, 
              fontWeight:600,
              cursor: (!ready || loading || !evolutionSettings.apiKey) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processando...' : 'CONECTAR'}
          </button>
          
          <button 
            onClick={saveEvolutionSettings} 
            disabled={isSaving}
            style={{ 
              padding:'12px 20px', 
              background: isSaving ? '#e9ecef' : '#007bff',
              color: isSaving ? '#6c757d' : '#fff',
              border:'none', 
              borderRadius:6, 
              fontSize:14, 
              fontWeight:600,
              cursor: isSaving ? 'not-allowed' : 'pointer'
            }}
          >
            {isSaving ? 'Salvando...' : 'SALVAR'}
          </button>
        </div>

        {/* Mensagens de Status */}
        {saveStatus === 'success' && (
          <div style={{ padding:12, background:'#d4edda', border:'1px solid #c3e6cb', borderRadius:6, color:'#155724', fontSize:14 }}>
            ✅ Configurações salvas com sucesso!
          </div>
        )}
        
        {saveStatus === 'error' && (
          <div style={{ padding:12, background:'#f8d7da', border:'1px solid #f5c6cb', borderRadius:6, color:'#721c24', fontSize:14 }}>
            ❌ Erro ao salvar configurações
          </div>
        )}

        {/* Log */}
        <div style={{ marginTop:16 }}>
          <div style={{ fontWeight:600, marginBottom:8, color:'#333' }}>Log de Atividades</div>
          <pre style={{ 
            background:'#f8f9fa', 
            color:'#333', 
            padding:12, 
            borderRadius:6, 
            maxHeight:120, 
            overflow:'auto', 
            fontSize:12,
            border:'1px solid #e9ecef'
          }}>
{log.map(l => `• ${l}\n`)}
          </pre>
        </div>
      </div>
    </div>
  )
}
