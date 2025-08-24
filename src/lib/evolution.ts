// src/lib/evolution.ts
export class Evolution {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl?: string, token?: string) {
    this.baseUrl = baseUrl || process.env.EVOLUTION_BASE_URL || '';
    this.token = token || process.env.EVOLUTION_TOKEN || '';
  }

  async sendText(phone: string, text: string) {
    const r = await fetch(`${this.baseUrl}/message/text`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.token}` },
      body: JSON.stringify({ to: phone, message: text }),
    });
    if (!r.ok) throw new Error("Evolution text send failed");
    return r.json();
  }

  async sendMedia(phone: string, url: string, filename?: string) {
    const r = await fetch(`${this.baseUrl}/message/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.token}` },
      body: JSON.stringify({ to: phone, mediaUrl: url, filename }),
    });
    if (!r.ok) throw new Error("Evolution media send failed");
    return r.json();
  }

  async testConnection() {
    try {
      // Tentar fazer uma chamada simples para testar a conexão
      const r = await fetch(`${this.baseUrl}/instance/connectionState`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.token}` },
      });
      
      if (!r.ok) {
        throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      }
      
      const data = await r.json();
      return { status: 'connected', data };
    } catch (error) {
      throw new Error(`Falha na conexão com Evolution API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}
