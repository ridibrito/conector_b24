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
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'error': return 'bg-red-50 border-red-200 text-red-800'
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getStatusIconColor = (status: StatusCard['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-600'
      case 'warning': return 'bg-yellow-100 text-yellow-600'
      case 'error': return 'bg-red-100 text-red-600'
      case 'info': return 'bg-blue-100 text-blue-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📱</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bridge WhatsApp</h1>
                <p className="text-sm text-gray-600">Bitrix24 ↔ Evolution API</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/settings"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Configurações
              </Link>
              <Link 
                href="/logs"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logs
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statusCards.map((card, index) => (
            <div key={index} className={`rounded-xl border p-6 ${getStatusColor(card.status)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{isLoading ? '...' : card.value}</p>
                  <p className="text-xs mt-1 opacity-75">{card.description}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusIconColor(card.status)}`}>
                  <span className="text-xl">{card.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                🚀 Testar Conexão
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                📊 Ver Estatísticas
              </button>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                ⚙️ Configurar Webhook
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status do Sistema</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Evolution API</span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">Conectado</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Bitrix24</span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">Conectado</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Webhook</span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">Ativo</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Última Sincronização</span>
                <span className="text-sm text-gray-500">2 min atrás</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">📱</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Mensagem recebida</p>
                <p className="text-xs text-gray-500">De: +55 11 99999-9999 • 2 min atrás</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Processada</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Mensagem enviada</p>
                <p className="text-xs text-gray-500">Para: +55 11 99999-9999 • 5 min atrás</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Entregue</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm">⚠️</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Tentativa de reconexão</p>
                <p className="text-xs text-gray-500">Evolution API • 10 min atrás</p>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Resolvido</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
