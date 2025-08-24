'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface StatusCard {
  title: string
  value: string | number
  status: 'success' | 'warning' | 'error' | 'info'
  icon: string
  description: string
}

interface MessageStats {
  total: number
  today: number
  pending: number
  resolved: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<MessageStats>({
    total: 0,
    today: 0,
    pending: 0,
    resolved: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statusCards: StatusCard[] = [
    {
      title: 'Status do Conector',
      value: 'Ativo',
      status: 'success',
      icon: '🔗',
      description: 'Conectado com Evolution API'
    },
    {
      title: 'Mensagens Hoje',
      value: stats.today,
      status: 'info',
      icon: '💬',
      description: 'Mensagens recebidas hoje'
    },
    {
      title: 'Pendentes',
      value: stats.pending,
      status: 'warning',
      icon: '⏳',
      description: 'Aguardando resposta'
    },
    {
      title: 'Resolvidas',
      value: stats.resolved,
      status: 'success',
      icon: '✅',
      description: 'Atendimentos concluídos'
    }
  ]

  const getStatusColor = (status: StatusCard['status']) => {
    switch (status) {
      case 'success': return 'bg-[#e8f5e8] border-[#4caf50] text-[#2e7d32]'
      case 'warning': return 'bg-[#fff8e1] border-[#ff9800] text-[#f57c00]'
      case 'error': return 'bg-[#ffebee] border-[#f44336] text-[#c62828]'
      case 'info': return 'bg-[#e3f2fd] border-[#2196f3] text-[#1565c0]'
    }
  }

  const getStatusIconColor = (status: StatusCard['status']) => {
    switch (status) {
      case 'success': return 'bg-[#4caf50] text-white'
      case 'warning': return 'bg-[#ff9800] text-white'
      case 'error': return 'bg-[#f44336] text-white'
      case 'info': return 'bg-[#2196f3] text-white'
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#e8e8e8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#2067b0] rounded flex items-center justify-center">
                <span className="text-white text-sm">📱</span>
              </div>
              <div>
                <h1 className="text-lg font-medium text-[#535c69]">Bridge WhatsApp</h1>
                <p className="text-xs text-[#7f8c8d]">Bitrix24 ↔ Evolution API</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link 
                href="/settings"
                className="bg-[#2067b0] hover:bg-[#1a5a9c] text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                Configurações
              </Link>
              <Link 
                href="/logs"
                className="bg-[#ecf0f1] hover:bg-[#d5dbdb] text-[#535c69] px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                Logs
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {statusCards.map((card, index) => (
            <div key={index} className={`rounded border p-3 ${getStatusColor(card.status)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium opacity-80">{card.title}</p>
                  <p className="text-lg font-bold mt-1">{isLoading ? '...' : card.value}</p>
                  <p className="text-xs mt-1 opacity-70">{card.description}</p>
                </div>
                <div className={`w-8 h-8 rounded flex items-center justify-center ${getStatusIconColor(card.status)}`}>
                  <span className="text-sm">{card.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded shadow-sm border border-[#e8e8e8] p-4">
            <h2 className="text-sm font-medium text-[#535c69] mb-3">Ações Rápidas</h2>
            <div className="space-y-2">
              <button className="w-full bg-[#27ae60] hover:bg-[#229954] text-white py-1.5 px-3 rounded text-xs font-medium transition-colors">
                🚀 Testar Conexão
              </button>
              <button className="w-full bg-[#2067b0] hover:bg-[#1a5a9c] text-white py-1.5 px-3 rounded text-xs font-medium transition-colors">
                📊 Ver Estatísticas
              </button>
              <button className="w-full bg-[#8e44ad] hover:bg-[#7d3c98] text-white py-1.5 px-3 rounded text-xs font-medium transition-colors">
                ⚙️ Configurar Webhook
              </button>
            </div>
          </div>

          <div className="bg-white rounded shadow-sm border border-[#e8e8e8] p-4">
            <h2 className="text-sm font-medium text-[#535c69] mb-3">Status do Sistema</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#535c69]">Evolution API</span>
                <span className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-[#27ae60] rounded-full mr-1.5"></div>
                  <span className="text-xs font-medium text-[#27ae60]">Conectado</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#535c69]">Bitrix24</span>
                <span className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-[#27ae60] rounded-full mr-1.5"></div>
                  <span className="text-xs font-medium text-[#27ae60]">Conectado</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#535c69]">Webhook</span>
                <span className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-[#27ae60] rounded-full mr-1.5"></div>
                  <span className="text-xs font-medium text-[#27ae60]">Ativo</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#535c69]">Última Sincronização</span>
                <span className="text-xs text-[#7f8c8d]">2 min atrás</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded shadow-sm border border-[#e8e8e8] p-4">
          <h2 className="text-sm font-medium text-[#535c69] mb-3">Atividade Recente</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-2 bg-[#f8f9fa] rounded">
              <div className="w-6 h-6 bg-[#e3f2fd] rounded-full flex items-center justify-center">
                <span className="text-[#2196f3] text-xs">📱</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-[#535c69]">Mensagem recebida</p>
                <p className="text-xs text-[#7f8c8d]">De: +55 11 99999-9999 • 2 min atrás</p>
              </div>
              <span className="text-xs bg-[#e8f5e8] text-[#2e7d32] px-1.5 py-0.5 rounded">Processada</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-[#f8f9fa] rounded">
              <div className="w-6 h-6 bg-[#e8f5e8] rounded-full flex items-center justify-center">
                <span className="text-[#4caf50] text-xs">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-[#535c69]">Mensagem enviada</p>
                <p className="text-xs text-[#7f8c8d]">Para: +55 11 99999-9999 • 5 min atrás</p>
              </div>
              <span className="text-xs bg-[#e3f2fd] text-[#1565c0] px-1.5 py-0.5 rounded">Entregue</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-[#f8f9fa] rounded">
              <div className="w-6 h-6 bg-[#fff8e1] rounded-full flex items-center justify-center">
                <span className="text-[#ff9800] text-xs">⚠️</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-[#535c69]">Tentativa de reconexão</p>
                <p className="text-xs text-[#7f8c8d]">Evolution API • 10 min atrás</p>
              </div>
              <span className="text-xs bg-[#fff8e1] text-[#f57c00] px-1.5 py-0.5 rounded">Resolvido</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
