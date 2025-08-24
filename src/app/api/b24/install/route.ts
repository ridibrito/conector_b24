import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const event = searchParams.get('event');
  // const auth = searchParams.get('auth'); // Para uso futuro

  // Se for uma instalação, redireciona para a página de sucesso
  if (event === 'ONAPPINSTALL') {
    return NextResponse.redirect(new URL('/install/success', req.url));
  }

  // Se for uma desinstalação, redireciona para a página de desinstalação
  if (event === 'ONAPPUNINSTALL') {
    return NextResponse.redirect(new URL('/install/uninstall', req.url));
  }

  // Caso padrão, mostra a página de instalação
  return NextResponse.redirect(new URL('/install', req.url));
}
