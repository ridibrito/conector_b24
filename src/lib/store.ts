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

  // Novos métodos para configurações
  async saveSettings(settings: Record<string, unknown> | { [key: string]: unknown }) {
    if (!supa) throw new Error("Supabase não configurado");
    await supa.from("settings").upsert({ id: 1, ...settings });
  },
  async getSettings() {
    if (!supa) throw new Error("Supabase não configurado");
    const { data } = await supa.from("settings").select("*").eq("id", 1).single();
    return data;
  },

  // Métodos para estatísticas
  async getStats() {
    if (!supa) return { total: 0, today: 0, pending: 0, resolved: 0 };
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data: totalData } = await supa.from("messages").select("id", { count: "exact" });
    const { data: todayData } = await supa.from("messages").select("id", { count: "exact" }).gte("created_at", today);
    const { data: pendingData } = await supa.from("messages").select("id", { count: "exact" }).eq("status", "pending");
    const { data: resolvedData } = await supa.from("messages").select("id", { count: "exact" }).eq("status", "resolved");
    
    return {
      total: totalData?.length || 0,
      today: todayData?.length || 0,
      pending: pendingData?.length || 0,
      resolved: resolvedData?.length || 0,
      lastSync: new Date().toISOString()
    };
  },

  // Métodos para logs
  async getLogs({ level = 'all', source = 'all', limit = 50 }: { level?: string, source?: string, limit?: number }) {
    if (!supa) return [];
    
    let query = supa.from("logs").select("*").order("created_at", { ascending: false }).limit(limit);
    
    if (level !== 'all') {
      query = query.eq("level", level);
    }
    if (source !== 'all') {
      query = query.eq("source", source);
    }
    
    const { data } = await query;
    return data || [];
  },

  async addLog(log: { level: string, message: string, source: string, details?: string }) {
    if (!supa) return;
    await supa.from("logs").insert({
      ...log,
      created_at: new Date().toISOString()
    });
  }
};
