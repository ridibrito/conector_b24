import { NextRequest, NextResponse } from "next/server";
import { Store } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level') || 'all';
    const source = searchParams.get('source') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Buscar logs reais do banco
    const logs = await Store.getLogs({ level, source, limit });
    
    return NextResponse.json(logs);

  } catch (error) {
    console.error('[LOGS GET] Erro:', error);
    return NextResponse.json([]);
  }
}
