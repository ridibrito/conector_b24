// src/lib/types.ts

export interface BitrixAuth {
  access_token: string;
  refresh_token: string;
  client_endpoint: string;
  member_id: string;
  expires_in?: number;
}

export interface BitrixPayload {
  auth?: BitrixAuth;
  AUTH?: BitrixAuth;
  event?: string;
  data?: Record<string, unknown>;
  FIELDS?: Record<string, unknown>;
  message?: Record<string, unknown>;
  MESSAGE?: Record<string, unknown>;
  user?: Record<string, unknown>;
  USER_ID?: string;
  from?: string;
  client_endpoint?: string;
}

export interface EvolutionPayload {
  portal_domain: string;
  from: string;
  chatId?: string;
  type: "text" | "image" | "document" | "audio" | "sticker" | "video";
  text?: string;
  mediaUrl?: string;
  filename?: string;
}

export interface ConnectorMessage {
  CONNECTOR: string;
  CHAT: { id: string };
  USER: { id: string };
  MESSAGE: {
    text?: string;
    files?: Array<{ url: string; name?: string }>;
  };
}

export interface ConnectorStatus {
  CONNECTOR: string;
  CHAT: { id: string };
  USER: { id: string };
  MESSAGE: { id: string };
  STATUS: string;
}
