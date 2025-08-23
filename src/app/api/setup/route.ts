import { NextRequest, NextResponse } from "next/server";

async function b24Call(clientEndpoint: string, accessToken: string, method: string, params: Record<string, unknown>) {
  const url = `${clientEndpoint}${method}`;
  const form = new URLSearchParams({ auth: accessToken });
  for (const [k, v] of Object.entries(params)) form.append(k, typeof v === "string" ? v : JSON.stringify(v));
  const res = await fetch(url, { method: "POST", body: form });
  const json = await res.json();
  if (json.error) throw new Error(`${json.error}: ${json.error_description}`);
  return json;
}

export async function POST(req: NextRequest) {
  try {
    const { clientEndpoint, accessToken, connectorId = "EVOLUTION_CUSTOM", name = "Evolution WhatsApp" } = await req.json();
    if (!clientEndpoint || !accessToken) {
      return NextResponse.json({ ok: false, error: "clientEndpoint e accessToken são obrigatórios" }, { status: 400 });
    }

    // 1) registrar + 2) ativar conector personalizado
    await b24Call(clientEndpoint, accessToken, "imconnector.register", { CONNECTOR: connectorId, NAME: name });
    await b24Call(clientEndpoint, accessToken, "imconnector.activate", { CONNECTOR: connectorId });

    // 3) bind dos eventos para o handler público
    const handler = `${process.env.BASE_URL}/api/b24/events/imconnector`;
    for (const ev of ["OnImConnectorMessageAdd", "OnImConnectorMessageUpdate", "OnImConnectorDialogFinish"]) {
      await b24Call(clientEndpoint, accessToken, "event.bind", { EVENT: ev, HANDLER: handler });
    }

    return NextResponse.json({ ok: true, connectorId, handler });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Erro desconhecido';
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}
