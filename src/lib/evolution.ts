// src/lib/evolution.ts
export const Evolution = {
  async sendText(phone: string, text: string) {
    const r = await fetch(`${process.env.EVOLUTION_BASE_URL}/message/text`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.EVOLUTION_TOKEN}` },
      body: JSON.stringify({ to: phone, message: text }),
    });
    if (!r.ok) throw new Error("Evolution text send failed");
    return r.json();
  },
  async sendMedia(phone: string, url: string, filename?: string) {
    const r = await fetch(`${process.env.EVOLUTION_BASE_URL}/message/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.EVOLUTION_TOKEN}` },
      body: JSON.stringify({ to: phone, mediaUrl: url, filename }),
    });
    if (!r.ok) throw new Error("Evolution media send failed");
    return r.json();
  },
};
