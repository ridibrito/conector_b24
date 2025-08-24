import { NextResponse } from "next/server";
import { Evolution } from "@/lib/evolution";
import { Store } from "@/lib/store";

export async function POST() {
  try {
    // Buscar configurações
    const settings = await Store.getSettings();
    if (!settings?.evolutionUrl || !settings?.evolutionToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configurações da Evolution API não encontradas' 
      }, { status: 400 });
    }

    // Testar conexão com Evolution API
    const evolution = new Evolution(settings.evolutionUrl, settings.evolutionToken);
    
    // Tentar fazer uma chamada de teste (ex: verificar status)
    const testResult = await evolution.testConnection();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Conexão com Evolution API estabelecida com sucesso!',
      details: testResult
    });

  } catch (error) {
    console.error('[TEST CONNECTION] Erro:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao testar conexão' 
    }, { status: 500 });
  }
}
