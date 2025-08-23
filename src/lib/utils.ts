// src/lib/utils.ts
export function parseBitrixAuth(body: Record<string, unknown>) {
  // Bitrix pode enviar como form-urlencoded. Normalize:
  const auth = (body?.auth || body) as Record<string, unknown>;
  return {
    access_token: auth?.access_token as string,
    refresh_token: auth?.refresh_token as string,
    client_endpoint: auth?.client_endpoint as string,
    member_id: auth?.member_id as string,
    portal_domain: new URL((auth?.client_endpoint as string) || "").host.replace("/rest", ""),
    expires_at: auth?.expires_in ? new Date(Date.now() + (auth.expires_in as number) * 1000).toISOString() : new Date(Date.now() + 3600_000).toISOString()
  };
}
