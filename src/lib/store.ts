// src/lib/store.ts
import { createClient } from "@supabase/supabase-js";

const supa = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE
  ? createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!)
  : null;

export type PortalAuth = {
  portal_domain: string;
  client_endpoint: string;
  member_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string; // ISO
};

export const Store = {
  async upsertPortalAuth(data: PortalAuth) {
    if (!supa) throw new Error("Supabase não configurado");
    await supa.from("b24_portals").upsert(data);
  },
  async getPortalAuth(portal_domain: string): Promise<PortalAuth | null> {
    if (!supa) throw new Error("Supabase não configurado");
    const { data } = await supa.from("b24_portals").select("*").eq("portal_domain", portal_domain).single();
    return data as PortalAuth | null;
  },
  async updateTokens(portal_domain: string, patch: Partial<PortalAuth>) {
    if (!supa) throw new Error("Supabase não configurado");
    await supa.from("b24_portals").update(patch).eq("portal_domain", portal_domain);
  },
  async upsertChatMap(portal_domain: string, external_chat_id: string, phone?: string) {
    if (!supa) return;
    await supa.from("chat_map").upsert({ portal_domain, external_chat_id, phone });
  },
};
