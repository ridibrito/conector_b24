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
const LINE_ID = 1 // ajuste se sua Open Line for outra

export default function ConnectorSettings() {
  const [ready, setReady] = useState(false)
  const [status, setStatus] = useState<'unknown'|'connected'|'disconnected'>('unknown')
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const inited = useRef(false)

  useEffect(() => {
    if (inited.current) return
    inited.current = true

    // injeta o SDK JS do Bitrix no iframe
    const s = document.createElement('script')
    s.src = 'https://api.bitrix24.com/api/v1/'
    s.onload = () => {
      try {
        window.BX24?.init(() => {
          setReady(true)
          checkStatus()
          // ajusta o tamanho do iframe
          try { window.BX24?.resizeWindow(document.body.clientWidth, document.body.clientHeight) } catch {}
        })
      } catch (e) {
        pushLog('Falha ao inicializar BX24: ' + (e as Error)?.message)
      }
    }
    s.onerror = () => pushLog('Não foi possível carregar o SDK do Bitrix (api/v1)')
    document.head.appendChild(s)
  }, [])

  function pushLog(line: string) {
    setLog(prev => [line, ...prev].slice(0, 50))
  }

  function call(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
    return new Promise((resolve, reject) => {
      window.BX24?.callMethod(method, params, (res: { data?: () => unknown; error?: () => unknown }) => {
        const err = res?.error?.()
        if (err) {
          const errObj = err as Record<string, unknown>
          const errorMsg = (errObj?.ex as Record<string, unknown>)?.error_description || 
                          (errObj?.ex as Record<string, unknown>)?.error || 
                          JSON.stringify(err)
          pushLog(`${method} ERROR: ${errorMsg}`)
          reject(errObj?.ex || err)
        } else {
          const data = res?.data?.()
          pushLog(`${method} OK`)
          resolve(data)
        }
      })
    })
  }

  async function checkStatus() {
    try {
      const data = await call('imconnector.status', { LINE: LINE_ID, CONNECTOR: CONNECTOR_ID }) as Record<string, unknown>
      const connected = !!(data?.STATUS) && !!(data?.CONFIGURED) && data?.ERROR === false
      setStatus(connected ? 'connected' : 'disconnected')
    } catch {
      setStatus('disconnected')
    }
  }

  async function doActivate() {
    setLoading(true)
    try {
      await call('imconnector.activate', { LINE: LINE_ID, CONNECTOR: CONNECTOR_ID, ACTIVE: 1 })
      await checkStatus()
    } finally {
      setLoading(false)
      try { window.BX24?.resizeWindow(document.body.clientWidth, document.body.clientHeight) } catch {}
    }
  }

  async function doDeactivate() {
    setLoading(true)
    try {
      await call('imconnector.deactivate', { LINE: LINE_ID, CONNECTOR: CONNECTOR_ID })
      await checkStatus()
    } finally {
      setLoading(false)
      try { window.BX24?.resizeWindow(document.body.clientWidth, document.body.clientHeight) } catch {}
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded shadow-sm border border-[#e8e8e8] p-4">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#e8e8e8]">
              <Image src="/evo_logo.png" alt="Evolution Logo" width={32} height={32} />
            </div>
            <div>
              <h1 className="text-lg font-medium text-[#535c69]">Evolution WhatsApp</h1>
              <p className="text-xs text-[#7f8c8d]">Use este conector com seu Canal Aberto para postar mensagens no bate-papo do Bitrix24.</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-xs text-[#535c69]">Status:</span>
            <span className={`text-xs font-medium ${
              status === 'connected' ? 'text-[#27ae60]' : 
              status === 'disconnected' ? 'text-[#e74c3c]' : 
              'text-[#7f8c8d]'
            }`}>
              {status === 'unknown' ? 'verificando…' : 
               status === 'connected' ? 'Conectado' : 
               'Desconectado'}
            </span>
            {status !== 'unknown' && (
              <div className={`w-1.5 h-1.5 rounded-full ${
                status === 'connected' ? 'bg-[#27ae60]' : 'bg-[#e74c3c]'
              }`}></div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-2 mb-4">
            <button 
              onClick={doActivate} 
              disabled={!ready || loading || status === 'connected'}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                !ready || loading || status === 'connected'
                  ? 'bg-[#bdc3c7] text-[#7f8c8d] cursor-not-allowed'
                  : 'bg-[#27ae60] hover:bg-[#229954] text-white'
              }`}
            >
              {loading ? 'Processando…' : 'Conectar'}
            </button>
            <button 
              onClick={doDeactivate} 
              disabled={!ready || loading || status === 'disconnected'}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                !ready || loading || status === 'disconnected'
                  ? 'bg-[#bdc3c7] text-[#7f8c8d] cursor-not-allowed'
                  : 'bg-[#e74c3c] hover:bg-[#c0392b] text-white'
              }`}
            >
              {loading ? 'Processando…' : 'Desconectar'}
            </button>
          </div>

          {/* Log */}
          <div>
            <h2 className="text-sm font-medium text-[#535c69] mb-2">Log de Atividades</h2>
                         <div className="bg-[#0f172a] text-[#e5e7eb] p-3 rounded text-xs max-h-48 overflow-auto font-mono">
               <div className="text-[#7f8c8d] mb-2">{'// Status da API'}</div>
               <div className="text-[#27ae60]">{JSON.stringify({ ok: true }, null, 2)}</div>
               <div className="text-[#7f8c8d] mt-2 mb-1">{'// Log de operações'}</div>
               {log.length === 0 ? (
                 <div className="text-[#7f8c8d] italic">Nenhuma operação realizada ainda...</div>
               ) : (
                 log.map((l, i) => (
                   <div key={i} className="text-[#e5e7eb] mb-1">
                     <span className="text-[#7f8c8d]">•</span> {l}
                   </div>
                 ))
               )}
             </div>
          </div>

          {/* Info */}
          <div className="mt-4 p-3 bg-[#e3f2fd] rounded border border-[#2196f3]">
            <h3 className="text-xs font-medium text-[#1565c0] mb-2">💡 Informações</h3>
                         <div className="text-xs text-[#1565c0] space-y-1">
               <p>• Este conector permite integrar mensagens do WhatsApp com o Bitrix24</p>
               <p>• As mensagens aparecerão no canal &quot;Evolution WhatsApp&quot; no chat</p>
               <p>• Configure o webhook na Evolution API para: <code className="bg-[#1565c0] bg-opacity-20 px-1 rounded">https://seu-projeto.vercel.app/api/wa/webhook-in</code></p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
