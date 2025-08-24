'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Settings {
  evolutionUrl: string
  evolutionToken: string
  webhookUrl: string
  autoReconnect: boolean
  logLevel: 'debug' | 'info' | 'warning' | 'error'
  maxRetries: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    evolutionUrl: '',
    evolutionToken: '',
    webhookUrl: '',
    autoReconnect: true,
    logLevel: 'info',
    maxRetries: 3
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isLoading, setIsLoading] = useState(false)

  // Carregar configurações ao montar o componente
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()
      
      if (result.success) {
        alert(`✅ ${result.message}`)
      } else {
        alert(`❌ ${result.error}`)
      }
    } catch (error) {
      alert('❌ Erro ao testar conexão')
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#e8e8e8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="text-[#7f8c8d] hover:text-[#535c69] text-xs">
                ← Voltar ao Dashboard
              </Link>
              <div>
                <h1 className="text-lg font-medium text-[#535c69]">Configurações</h1>
                <p className="text-xs text-[#7f8c8d]">Configurações avançadas do sistema</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleTestConnection}
                className="bg-[#27ae60] hover:bg-[#229954] text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                🧪 Testar Conexão
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#2067b0] hover:bg-[#1a5a9c] disabled:bg-[#bdc3c7] text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                {isSaving ? '💾 Salvando...' : '💾 Salvar'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Settings Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded shadow-sm border border-[#e8e8e8] p-4">
              <h2 className="text-sm font-medium text-[#535c69] mb-4">Configurações da API</h2>
              
                             <div className="space-y-4">
                 {/* Evolution API */}
                 <div>
                   <label className="block text-xs font-medium text-[#535c69] mb-1.5">
                     URL da Evolution API
                   </label>
                   <input
                     type="url"
                     value={settings.evolutionUrl}
                     onChange={(e) => setSettings({...settings, evolutionUrl: e.target.value})}
                     className="w-full border border-[#d5dbdb] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#2067b0] focus:border-[#2067b0]"
                     placeholder="https://sua-evolution:port"
                   />
                   <p className="text-xs text-[#7f8c8d] mt-1">
                     URL base da sua instância Evolution API
                   </p>
                 </div>

                 <div>
                   <label className="block text-xs font-medium text-[#535c69] mb-1.5">
                     Token da Evolution API
                   </label>
                   <input
                     type="password"
                     value={settings.evolutionToken}
                     onChange={(e) => setSettings({...settings, evolutionToken: e.target.value})}
                     className="w-full border border-[#d5dbdb] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#2067b0] focus:border-[#2067b0]"
                     placeholder="Seu token aqui"
                   />
                   <p className="text-xs text-[#7f8c8d] mt-1">
                     Token de autenticação da Evolution API
                   </p>
                 </div>

                 <div>
                   <label className="block text-xs font-medium text-[#535c69] mb-1.5">
                     URL do Webhook
                   </label>
                   <input
                     type="url"
                     value={settings.webhookUrl}
                     onChange={(e) => setSettings({...settings, webhookUrl: e.target.value})}
                     className="w-full border border-[#d5dbdb] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#2067b0] focus:border-[#2067b0]"
                     placeholder="https://seu-projeto.vercel.app/api/wa/webhook-in"
                   />
                   <p className="text-xs text-[#7f8c8d] mt-1">
                     URL que a Evolution API deve chamar para enviar mensagens
                   </p>
                 </div>

                 {/* Advanced Settings */}
                 <div className="border-t border-[#e8e8e8] pt-4">
                   <h3 className="text-xs font-medium text-[#535c69] mb-3">Configurações Avançadas</h3>
                  
                                     <div className="space-y-3">
                     <div className="flex items-center justify-between">
                       <div>
                         <label className="text-xs font-medium text-[#535c69]">Reconexão Automática</label>
                         <p className="text-xs text-[#7f8c8d]">Tentar reconectar automaticamente em caso de falha</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input
                           type="checkbox"
                           checked={settings.autoReconnect}
                           onChange={(e) => setSettings({...settings, autoReconnect: e.target.checked})}
                           className="sr-only peer"
                         />
                         <div className="w-9 h-5 bg-[#d5dbdb] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#2067b0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-[#d5dbdb] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2067b0]"></div>
                       </label>
                     </div>

                     <div>
                       <label className="block text-xs font-medium text-[#535c69] mb-1.5">
                         Nível de Log
                       </label>
                       <select
                         value={settings.logLevel}
                         onChange={(e) => setSettings({...settings, logLevel: e.target.value as 'debug' | 'info' | 'warning' | 'error'})}
                         className="w-full border border-[#d5dbdb] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#2067b0] focus:border-[#2067b0]"
                       >
                         <option value="debug">Debug</option>
                         <option value="info">Info</option>
                         <option value="warning">Warning</option>
                         <option value="error">Error</option>
                       </select>
                     </div>

                     <div>
                       <label className="block text-xs font-medium text-[#535c69] mb-1.5">
                         Máximo de Tentativas
                       </label>
                       <input
                         type="number"
                         min="1"
                         max="10"
                         value={settings.maxRetries}
                         onChange={(e) => setSettings({...settings, maxRetries: parseInt(e.target.value)})}
                         className="w-full border border-[#d5dbdb] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#2067b0] focus:border-[#2067b0]"
                       />
                       <p className="text-xs text-[#7f8c8d] mt-1">
                         Número máximo de tentativas em caso de falha
                       </p>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Save Status */}
               {saveStatus === 'success' && (
                 <div className="mt-4 p-3 bg-[#e8f5e8] border border-[#4caf50] rounded">
                   <p className="text-[#2e7d32] text-xs">✅ Configurações salvas com sucesso!</p>
                 </div>
               )}
               
               {saveStatus === 'error' && (
                 <div className="mt-4 p-3 bg-[#ffebee] border border-[#f44336] rounded">
                   <p className="text-[#c62828] text-xs">❌ Erro ao salvar configurações. Tente novamente.</p>
                 </div>
               )}
             </div>
           </div>

           {/* Sidebar */}
           <div className="space-y-4">
             {/* Quick Info */}
             <div className="bg-white rounded shadow-sm border border-[#e8e8e8] p-4">
               <h3 className="text-sm font-medium text-[#535c69] mb-3">Informações Rápidas</h3>
               <div className="space-y-2">
                 <div className="flex items-center justify-between">
                   <span className="text-xs text-[#535c69]">Status da API</span>
                   <span className="flex items-center">
                     <div className="w-1.5 h-1.5 bg-[#27ae60] rounded-full mr-1.5"></div>
                     <span className="text-xs font-medium text-[#27ae60]">Online</span>
                   </span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-xs text-[#535c69]">Última Sincronização</span>
                   <span className="text-xs text-[#7f8c8d]">2 min atrás</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-xs text-[#535c69]">Versão</span>
                   <span className="text-xs text-[#7f8c8d]">1.0.0</span>
                 </div>
               </div>
             </div>

             {/* Help */}
             <div className="bg-[#e3f2fd] rounded border border-[#2196f3] p-4">
               <h3 className="text-sm font-medium text-[#1565c0] mb-3">💡 Ajuda</h3>
               <div className="space-y-2 text-xs text-[#1565c0]">
                 <p>• Configure a URL da Evolution API corretamente</p>
                 <p>• O token deve ter permissões de envio</p>
                 <p>• Teste a conexão após salvar</p>
                 <p>• Verifique os logs em caso de erro</p>
               </div>
             </div>

             {/* Documentation */}
             <div className="bg-[#f8f9fa] rounded border border-[#e8e8e8] p-4">
               <h3 className="text-sm font-medium text-[#535c69] mb-3">📚 Documentação</h3>
               <div className="space-y-1">
                 <a href="#" className="block text-xs text-[#2067b0] hover:text-[#1a5a9c]">
                   Guia de Configuração
                 </a>
                 <a href="#" className="block text-xs text-[#2067b0] hover:text-[#1a5a9c]">
                   Troubleshooting
                 </a>
                 <a href="#" className="block text-xs text-[#2067b0] hover:text-[#1a5a9c]">
                   API Reference
                 </a>
               </div>
             </div>
           </div>
         </div>
       </main>
     </div>
   )
}
