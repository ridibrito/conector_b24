// src/lib/bitrix.ts
import { Store, PortalAuth } from "./store";

const OAUTH_URL = "https://oauth.bitrix.info/oauth/token/"; // refresh oficial

export class Bitrix {
  constructor(private auth: PortalAuth) {}

  static async forPortal(portal_domain: string) {
    const auth = await Store.getPortalAuth(portal_domain);
    if (!auth) throw new Error("Portal não encontrado");
    return new Bitrix(auth);
  }

  private async refreshIfNeeded() {
    const exp = new Date(this.auth.expires_at).getTime();
    if (Date.now() < exp - 30_000) return;

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.B24_CLIENT_ID!,
      client_secret: process.env.B24_CLIENT_SECRET!,
      refresh_token: this.auth.refresh_token,
    });

    const r = await fetch(`${OAUTH_URL}?${params}`, { method: "GET" });
    const j = await r.json();
    if (!j.access_token) throw new Error("Falha ao renovar token");

    this.auth.access_token = j.access_token;
    this.auth.refresh_token = j.refresh_token;
    this.auth.client_endpoint = j.client_endpoint;
    this.auth.expires_at = new Date(Date.now() + (j.expires_in * 1000)).toISOString();
    await Store.updateTokens(this.auth.portal_domain, {
      access_token: this.auth.access_token,
      refresh_token: this.auth.refresh_token,
      client_endpoint: this.auth.client_endpoint,
      expires_at: this.auth.expires_at,
    });
  }

  private async call(method: string, params: Record<string, unknown>) {
    await this.refreshIfNeeded();
    const url = `${this.auth.client_endpoint}${method}`;
    const body = new URLSearchParams({ ...Object.fromEntries(Object.entries(params).map(([k,v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])), auth: this.auth.access_token });
    const res = await fetch(url, { method: "POST", body });
    const json = await res.json();
    if (json.error) throw new Error(`${json.error}: ${json.error_description}`);
    return json;
  }

  // ---- Setup (1x) ----
  registerConnector(connectorId: string, name: string) {
    return this.call("imconnector.register", { CONNECTOR: connectorId, NAME: name });
  }
  activateConnector(connectorId: string) {
    return this.call("imconnector.activate", { CONNECTOR: connectorId });
  }
  setConnectorData(connectorId: string, data: Record<string, unknown>) {
    return this.call("imconnector.connector.data.set", { CONNECTOR: connectorId, DATA: data });
  }
  bindEvent(event: string, handler: string) {
    return this.call("event.bind", { EVENT: event, HANDLER: handler });
  }

  // ---- Mensagens ----
  sendIntoOpenLine(payload: {
    CONNECTOR: string,
    CHAT: { id: string }, USER: { id: string },
    MESSAGE: { text?: string, files?: Array<{ url: string, name?: string }> }
  }) {
    return this.call("imconnector.send.messages", payload);
  }

  confirmDelivery(payload: Record<string, unknown>) {
    return this.call("imconnector.send.status.delivery", payload);
  }
  confirmReading(payload: Record<string, unknown>) {
    return this.call("imconnector.send.status.reading", payload);
  }
}
