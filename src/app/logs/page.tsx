'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  source: 'evolution' | 'bitrix24' | 'system'
  details?: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'evolution' | 'bitrix24' | 'system'>('all')
  const [isLoading, setIsLoading] = useState(true)

  const loadLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('level', filter)
      if (sourceFilter !== 'all') params.append('source', sourceFilter)
      
      const response = await fetch(`/api/logs?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filter, sourceFilter])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getSourceIcon = (source: LogEntry['source']) => {
    switch (source) {
      case 'evolution': return '📱'
      case 'bitrix24': return '🔗'
      case 'system': return '⚙️'
    }
  }

  const filteredLogs = logs.filter(log => {
    const levelMatch = filter === 'all' || log.level === filter
    const sourceMatch = sourceFilter === 'all' || log.source === sourceFilter
    return levelMatch && sourceMatch
  })

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
                <h1 className="text-2xl font-bold text-gray-900">Logs do Sistema</h1>
                <p className="text-sm text-gray-600">Monitoramento de atividades</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                🔄 Atualizar
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                📥 Exportar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nível</label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as 'all' | 'info' | 'warning' | 'error' | 'success')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os níveis</option>
                <option value="success">Sucesso</option>
                <option value="info">Informação</option>
                <option value="warning">Aviso</option>
                <option value="error">Erro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Origem</label>
              <select 
                value={sourceFilter} 
                onChange={(e) => setSourceFilter(e.target.value as 'all' | 'evolution' | 'bitrix24' | 'system')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as origens</option>
                <option value="evolution">Evolution API</option>
                <option value="bitrix24">Bitrix24</option>
                <option value="system">Sistema</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Logs ({filteredLogs.length} registros)
            </h2>
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Carregando logs...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <span className="text-lg">{getSourceIcon(log.source)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">{log.timestamp}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-500 capitalize">{log.source}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">{log.message}</p>
                      {log.details && (
                        <p className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
