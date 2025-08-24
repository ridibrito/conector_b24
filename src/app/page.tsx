'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redireciona para o dashboard
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Loading */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Carregando Dashboard...
        </h1>
        
        <p className="text-gray-600">
          Redirecionando para a interface principal
        </p>
      </div>
    </div>
  )
}
