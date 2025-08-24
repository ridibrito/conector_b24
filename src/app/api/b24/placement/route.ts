import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Redireciona para a página de configuração do conector
  return NextResponse.redirect(new URL('/connector/settings', req.url));
}

export async function POST(req: NextRequest) {
  // Redireciona para a página de configuração do conector
  return NextResponse.redirect(new URL('/connector/settings', req.url));
}
