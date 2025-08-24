'use client'

import { useState } from 'react'
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
    evolutionUrl: 'https://sua-evolution:port',
    evolutionToken: 'seu_token_aqui',
    webhookUrl: 'https://seu-projeto.vercel.app/api/wa/webhook-in',
    autoReconnect: true,
    logLevel: 'info',
    maxRetries: 3
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaveStatus('success')
      
      // Reset status após 3 segundos
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    // Simular teste de conexão
    alert('Teste de conexão iniciado...')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
                ← Voltar ao Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
                <p className="text-sm text-gray-600">Configurações avançadas do sistema</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleTestConnection}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                🧪 Testar Conexão
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {isSaving ? '💾 Salvando...' : '💾 Salvar'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Configurações da API</h2>
              
              <div className="space-y-6">
                {/* Evolution API */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL da Evolution API
                  </label>
                  <input
                    type="url"
                    value={settings.evolutionUrl}
                    onChange={(e) => setSettings({...settings, evolutionUrl: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://sua-evolution:port"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL base da sua instância Evolution API
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token da Evolution API
                  </label>
                  <input
                    type="password"
                    value={settings.evolutionToken}
                    onChange={(e) => setSettings({...settings, evolutionToken: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Seu token aqui"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Token de autenticação da Evolution API
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL do Webhook
                  </label>
                  <input
                    type="url"
                    value={settings.webhookUrl}
                    onChange={(e) => setSettings({...settings, webhookUrl: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://seu-projeto.vercel.app/api/wa/webhook-in"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL que a Evolution API deve chamar para enviar mensagens
                  </p>
                </div>

                {/* Advanced Settings */}
                <div className="border-t pt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Configurações Avançadas</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Reconexão Automática</label>
                        <p className="text-xs text-gray-500">Tentar reconectar automaticamente em caso de falha</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoReconnect}
                          onChange={(e) => setSettings({...settings, autoReconnect: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nível de Log
                      </label>
                      <select
                        value={settings.logLevel}
                        onChange={(e) => setSettings({...settings, logLevel: e.target.value as 'debug' | 'info' | 'warning' | 'error'})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="debug">Debug</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Máximo de Tentativas
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={settings.maxRetries}
                        onChange={(e) => setSettings({...settings, maxRetries: parseInt(e.target.value)})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Número máximo de tentativas em caso de falha
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Status */}
              {saveStatus === 'success' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">✅ Configurações salvas com sucesso!</p>
                </div>
              )}
              
              {saveStatus === 'error' && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">❌ Erro ao salvar configurações. Tente novamente.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Rápidas</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status da API</span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-green-600">Online</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Última Sincronização</span>
                  <span className="text-sm text-gray-500">2 min atrás</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Versão</span>
                  <span className="text-sm text-gray-500">1.0.0</span>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Ajuda</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <p>• Configure a URL da Evolution API corretamente</p>
                <p>• O token deve ter permissões de envio</p>
                <p>• Teste a conexão após salvar</p>
                <p>• Verifique os logs em caso de erro</p>
              </div>
            </div>

            {/* Documentation */}
            <div className="bg-gray-50 rounded-xl border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Documentação</h3>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">
                  Guia de Configuração
                </a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">
                  Troubleshooting
                </a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">
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
