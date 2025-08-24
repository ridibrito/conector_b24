import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Libera o embed em iframe pelo Bitrix24
export function middleware(_req: NextRequest) {
  const res = NextResponse.next()
  // Remover/neutralizar X-Frame-Options (SAMEORIGIN bloqueia o Bitrix)
  res.headers.set('X-Frame-Options', 'ALLOWALL') // valor "liberado" (navegadores modernos usam CSP abaixo)
  // Autoriza ancestrais (quem pode embeber) — inclua domínios Bitrix comuns
  res.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.bitrix24.com https://*.bitrix24.com.br https://*.bitrix24.ru https://*.bitrix24.de https://*.bitrix24.es;"
  )
  return res
}

// Garante que essas rotas recebam os headers (página de settings e afins)
export const config = {
  matcher: ['/connector/:path*', '/api/:path*', '/'],
}
