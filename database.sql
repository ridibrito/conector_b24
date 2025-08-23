-- Esquema mínimo para o Supabase
-- Execute este SQL no seu projeto Supabase

create table b24_portals (
  portal_domain text primary key,
  client_endpoint text not null,
  member_id text not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null
);

create table b24_connectors (
  portal_domain text references b24_portals(portal_domain),
  connector_id text, -- id lógico interno do seu conector
  settings jsonb,
  primary key (portal_domain)
);

create table chat_map (
  portal_domain text references b24_portals(portal_domain),
  external_chat_id text, -- ex: JID/telefone da Evolution
  phone text,
  b24_dialog_id text, -- opcional
  primary key (portal_domain, external_chat_id)
);
