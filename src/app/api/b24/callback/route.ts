import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const ct = req.headers.get("content-type") || "";
  let body: Record<string, unknown> = {};
  if (ct.includes("application/json")) body = await req.json();
  else body = Object.fromEntries(new URLSearchParams(await req.text()));
  
  console.log("[B24 CALLBACK]", body);
  
  // Se for uma instalação, redireciona para a página de sucesso
  if (body.event === 'ONAPPINSTALL') {
    return NextResponse.redirect(new URL('/install/success', req.url));
  }
  
  // Salva os tokens no Supabase (implementação futura)
  // await Store.upsertPortalAuth(auth);
  
  // Retorna JSON para compatibilidade com API
  return NextResponse.json({ ok: true });
}
