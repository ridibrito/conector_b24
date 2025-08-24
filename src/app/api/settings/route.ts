import { NextRequest, NextResponse } from "next/server";
import { Store } from "@/lib/store";

interface Settings {
  evolutionUrl: string;
  evolutionToken: string;
  webhookUrl: string;
  autoReconnect: boolean;
  logLevel: 'debug' | 'info' | 'warning' | 'error';
  maxRetries: number;
}

export async function GET() {
  try {
    // Buscar configurações do Supabase
    const settings = await Store.getSettings();
    return NextResponse.json(settings || {
      evolutionUrl: '',
      evolutionToken: '',
      webhookUrl: '',
      autoReconnect: true,
      logLevel: 'info',
      maxRetries: 3
    });
  } catch (error) {
    console.error('[SETTINGS GET] Erro:', error);
    return NextResponse.json({ error: 'Erro ao carregar configurações' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const settings: Settings = await req.json();
    
    // Validar dados obrigatórios
    if (!settings.evolutionUrl || !settings.evolutionToken) {
      return NextResponse.json({ error: 'URL e Token da Evolution API são obrigatórios' }, { status: 400 });
    }

    // Salvar no Supabase
    await Store.saveSettings(settings as unknown as Record<string, unknown>);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SETTINGS POST] Erro:', error);
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 });
  }
}
