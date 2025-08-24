'use client'

import Script from 'next/script'
import { useEffect, useMemo, useState } from 'react'

// Tipos mínimos para BX24
declare global {
  interface Window {
    BX24: any
  }
}

function LabelValue({ label, value, copy = true }: { label: string; value: string | number | undefined | null; copy?: boolean }) {
  return (
    <div className="mb-3">
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <code className="rounded-xl bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm break-all">{String(value ?? '')}</code>
        {copy && (
          <button
            onClick={() => navigator.clipboard.writeText(String(value ?? ''))}
            className="text-xs rounded-lg border px-2 py-1 hover:bg-gray-50 active:opacity-80"
          >
            Copiar
          </button>
        )}
      </div>
    </div>
  )
}

export default function ConnectorSettings() {
  const [bxReady, setBxReady] = useState(false)
  const [installed, setInstalled] = useState<null | boolean>(null)
  const [auth, setAuth] = useState<any>(null)
  const [domain, setDomain] = useState<string>('')
  const [lineId, setLineId] = useState<string>('1')
  const connectorId = 'EVOLUTION_CUSTOM' // para registro
  const connectorSendId = 'evolution_custom' // para envio
  const placementUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/connector/settings`
  }, [])
  const handlerUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/api/b24/events/imconnector`
  }, [])

  useEffect(() => {
    // Ajusta o tamanho do slider
    const resize = () => {
      try { window.BX24?.resizeWindow?.(860, 620) } catch {}
    }

    const initBX = () => {
      if (!window.BX24) return
      window.BX24.init(async () => {
        setBxReady(true)
        resize()
        try {
          const a = window.BX24.getAuth?.()
          setAuth(a)
        } catch {}
        try {
          const d = window.BX24.getDomain?.()
          if (d) setDomain(d)
        } catch {}
        try {
          window.BX24.callMethod('app.info', {}, (res: any) => {
            const r = res?.data?.() || res?.answer?.result
            setInstalled(Boolean(r?.INSTALLED))
          })
        } catch {}
      })
    }

    initBX()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 p-6">
      <Script src="https://api.bitrix24.com/api/v1/" strategy="afterInteractive" onLoad={() => setBxReady(true)} />

      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Evolution WhatsApp — Configurações</h1>
          <p className="text-sm text-gray-600">
            Esta tela serve como <span className="font-medium">PLACEMENT_HANDLER</span> do conector custom no Bitrix24 (abre no side slider).
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-white/70 dark:bg-gray-950/60 p-4 shadow-sm">
            <h2 className="font-medium mb-3">Status</h2>
            <div className="flex items-center gap-2 mb-2">
              <span className={`h-2 w-2 rounded-full ${installed ? 'bg-emerald-500' : installed === false ? 'bg-amber-500' : 'bg-gray-400'}`}></span>
              <span className="text-sm">
                App instalado: {installed === null ? 'verificando…' : installed ? 'SIM' : 'NÃO'}
              </span>
            </div>
            <div className="text-xs text-gray-500">BX24 carregado: {bxReady ? 'sim' : 'não'}</div>
          </div>

          <div className="rounded-2xl border bg-white/70 dark:bg-gray-950/60 p-4 shadow-sm">
            <h2 className="font-medium mb-3">Conector</h2>
            <LabelValue label="Connector ID (registro)" value={connectorId} />
            <LabelValue label="Connector ID (envio)" value={connectorSendId} />
            <LabelValue label="Handler URL (eventos)" value={handlerUrl} />
            <LabelValue label="Placement URL (esta página)" value={placementUrl} />
          </div>
        </section>

        <section className="mt-4 rounded-2xl border bg-white/70 dark:bg-gray-950/60 p-4 shadow-sm">
          <h2 className="font-medium mb-3">Open Line</h2>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 w-28">LINE ID</label>
            <input
              value={lineId}
              onChange={(e) => setLineId(e.target.value)}
              className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="1"
              inputMode="numeric"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">Use o ID da Linha associada ao conector (ex.: 1).</p>
        </section>

        <section className="mt-4 rounded-2xl border bg-white/70 dark:bg-gray-950/60 p-4 shadow-sm">
          <h2 className="font-medium mb-3">Ações rápidas</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const payload = {
                  register: {
                    method: 'imconnector.register',
                    body: {
                      ID: connectorId,
                      NAME: 'Evolution WhatsApp',
                      ICON: { DATA_IMAGE: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCc+PGNpcmNsZSBjeD0nMTInIGN5PScxMicgcj0nMTAnIGZpbGw9JyMyNUQzNjYnLz48dGV4dCB4PScxMicgeT0nMTYnIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0nMTAnIGZpbGw9J3doaXRlJz5XQTwvdGV4dD48L3N2Zz4=' },
                      PLACEMENT_HANDLER: placementUrl,
                    },
                  },
                  activate: {
                    method: 'imconnector.activate',
                    body: { LINE: Number(lineId || '1'), CONNECTOR: connectorId, ACTIVE: 1 },
                  },
                }
                navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
                alert('JSON de registro/ativação copiado para a área de transferência. Use via PowerShell/POST.')
              }}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Copiar JSON de registro/ativação
            </button>

            <button
              onClick={() => {
                try { window.BX24?.resizeWindow?.(860, 620) } catch {}
                alert('Solicitada a atualização de tamanho do slider.')
              }}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Ajustar tamanho do slider
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">No MVP, as chamadas são feitas pelo backend/PowerShell. Esta página é apenas a UI de configuração exigida pelo Bitrix.</p>
        </section>

        <footer className="mt-6 text-xs text-gray-500">
          <p>Portal detectado: {domain || '—'} | Member ID: {auth?.member_id || '—'}</p>
        </footer>
      </div>
    </main>
  )
}
