// src/app/api/wa/webhook-in/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Bitrix } from "@/lib/bitrix";
import { Store } from "@/lib/store";
import { EvolutionPayload } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as EvolutionPayload;
  const { portal_domain, from, chatId, type, text, mediaUrl, filename } = body;
  if (!portal_domain || !from) return NextResponse.json({ ok:false }, { status:400 });

  const b24 = await Bitrix.forPortal(portal_domain);

  const files = mediaUrl ? [{ url: mediaUrl, name: filename }] : undefined;
  const message = (type === "text" && text) ? { text } : { files };

  // Mapeamento mínimo exigido pelo imconnector: IDs externos de USER e CHAT
  await b24.sendIntoOpenLine({
    CONNECTOR: "EVOLUTION_CUSTOM", // defina seu id lógico
    USER: { id: from },
    CHAT: { id: chatId || from },
    MESSAGE: message
  });

  // Atualize seu map de chat, se quiser.
  await Store.upsertChatMap(portal_domain, chatId || from, from);

  return NextResponse.json({ ok:true });
}
