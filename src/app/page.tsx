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
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Loading */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-[#2067b0] rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#535c69] mb-4">
          Carregando Dashboard...
        </h1>
        
        <p className="text-[#535c69] font-medium">
          Redirecionando para a interface principal
        </p>
      </div>
    </div>
  )
}
