import { NextResponse } from 'next/server'

export const config = {
  // aplica em todas as páginas "normais" (deixe API e estáticos de fora)
  matcher: ['/((?!api|_next|favicon.ico|assets|public).*)'],
}

export function middleware() {
  const res = NextResponse.next()

  // Permite ser carregado em iframe pelo Bitrix
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self' https: data: blob:",
      // PERMITIR QUE O BITRIX IFRAME ESTA PÁGINA:
      "frame-ancestors 'self' https://*.bitrix24.com https://*.bitrix24.com.br https://*.bitrix24.ru https://*.bitrix24.de https://*.bitrix24.es https://*.bitrix24.ua",
    ].join('; ')
  )

  // Não imponha X-Frame-Options (alguns navegadores ainda checam)
  res.headers.delete('X-Frame-Options')

  // CORS básico para evitar bloqueios de fontes/imagens
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return res
}
