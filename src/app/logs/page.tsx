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
      case 'success': return 'bg-[#e8f5e8] text-[#2e7d32] border-[#4caf50]'
      case 'warning': return 'bg-[#fff8e1] text-[#f57c00] border-[#ff9800]'
      case 'error': return 'bg-[#ffebee] text-[#c62828] border-[#f44336]'
      case 'info': return 'bg-[#e3f2fd] text-[#1565c0] border-[#2196f3]'
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
                <h1 className="text-lg font-medium text-[#535c69]">Logs do Sistema</h1>
                <p className="text-xs text-[#7f8c8d]">Monitoramento de atividades</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={loadLogs}
                className="bg-[#2067b0] hover:bg-[#1a5a9c] text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                🔄 Atualizar
              </button>
              <button className="bg-[#ecf0f1] hover:bg-[#d5dbdb] text-[#535c69] px-3 py-1.5 rounded text-xs font-medium transition-colors">
                📥 Exportar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded shadow-sm border border-[#e8e8e8] p-4 mb-4">
          <h2 className="text-sm font-medium text-[#535c69] mb-3">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#535c69] mb-1.5">Nível</label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as 'all' | 'info' | 'warning' | 'error' | 'success')}
                className="w-full border border-[#d5dbdb] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#2067b0] focus:border-[#2067b0]"
              >
                <option value="all">Todos os níveis</option>
                <option value="success">Sucesso</option>
                <option value="info">Informação</option>
                <option value="warning">Aviso</option>
                <option value="error">Erro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#535c69] mb-1.5">Origem</label>
              <select 
                value={sourceFilter} 
                onChange={(e) => setSourceFilter(e.target.value as 'all' | 'evolution' | 'bitrix24' | 'system')}
                className="w-full border border-[#d5dbdb] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#2067b0] focus:border-[#2067b0]"
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
        <div className="bg-white rounded shadow-sm border border-[#e8e8e8]">
          <div className="p-4 border-b border-[#e8e8e8]">
            <h2 className="text-sm font-medium text-[#535c69]">
              Logs ({filteredLogs.length} registros)
            </h2>
          </div>
          
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2067b0] mx-auto"></div>
              <p className="text-[#7f8c8d] mt-2 text-xs">Carregando logs...</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e8e8e8]">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-3 hover:bg-[#f8f9fa] transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <span className="text-sm">{getSourceIcon(log.source)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${getLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                        <span className="text-xs text-[#7f8c8d]">{log.timestamp}</span>
                        <span className="text-xs text-[#bdc3c7]">•</span>
                        <span className="text-xs text-[#7f8c8d] capitalize">{log.source}</span>
                      </div>
                      <p className="text-xs font-medium text-[#535c69] mb-1">{log.message}</p>
                      {log.details && (
                        <p className="text-xs text-[#7f8c8d] bg-[#f8f9fa] p-1.5 rounded">
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
