import { NextResponse } from "next/server";
import { Store } from "@/lib/store";

export async function GET() {
  try {
    // Buscar estatísticas reais do banco
    const stats = await Store.getStats();
    
    return NextResponse.json({
      total: stats.total || 0,
      today: stats.today || 0,
      pending: stats.pending || 0,
      resolved: stats.resolved || 0,
      lastSync: stats.lastSync || null
    });

  } catch (error) {
    console.error('[STATS GET] Erro:', error);
    return NextResponse.json({ 
      total: 0,
      today: 0,
      pending: 0,
      resolved: 0,
      lastSync: null
    });
  }
}
