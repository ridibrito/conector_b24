// src/app/api/b24/events/imconnector/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Evolution } from "@/lib/evolution";
import { Bitrix } from "@/lib/bitrix";
import { BitrixPayload } from "@/lib/types";

export async function POST(req: NextRequest) {
  const ct = req.headers.get("content-type") || "";
  let body: Record<string, unknown> = {};
  if (ct.includes("application/json")) body = await req.json();
  else body = Object.fromEntries(new URLSearchParams(await req.text()));
  
  console.log("[B24 EVENT imconnector]", body);
  
  const payload = body as BitrixPayload;
  const auth = payload.auth || payload.AUTH;
  const client_endpoint = auth?.client_endpoint as string;
  
  if (!client_endpoint) {
    console.error("[B24 EVENT] Sem client_endpoint");
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const data = payload.data?.FIELDS as Record<string, unknown>;
    const message = data?.MESSAGE as Record<string, unknown>;
    const user = message?.user as Record<string, unknown>;
    const text = message?.text as string;
    const phone = user?.id as string;
    const files = data?.FILES as Array<Record<string, unknown>>;

    if (!phone || !text) {
      console.error("[B24 EVENT] Sem phone ou text");
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Envia para Evolution API
    if (files && files.length > 0) {
      // Envia arquivos
      for (const f of files) {
        const url = String(f.url || f.URL || '');
        if (url) {
          await Evolution.sendMedia(phone, url);
        }
      }
    } else {
      // Envia texto
      await Evolution.sendText(phone, text);
    }

    // Confirma entrega no Bitrix24
    const b24 = await Bitrix.forPortal(client_endpoint);
    await b24.confirmDelivery({
      CONNECTOR: "evolution_custom",
      USER: { id: phone },
      CHAT: { id: phone },
      MESSAGE: { id: message?.id as string }
    });

    // Confirma leitura
    await b24.confirmReading({
      CONNECTOR: "evolution_custom", 
      USER: { id: phone },
      CHAT: { id: phone },
      MESSAGE: { id: message?.id as string }
    });

    return NextResponse.json({ ok: true });

  } catch (e: unknown) {
    console.error("[B24 EVENT] Erro:", e instanceof Error ? e.message : 'Erro desconhecido');
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
