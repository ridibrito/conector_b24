-- Schema para Bridge Bitrix24 ↔ Evolution API
-- Execute este SQL no seu Supabase

-- Tabela para autenticação dos portais Bitrix24
CREATE TABLE IF NOT EXISTS b24_portals (
  portal_domain TEXT PRIMARY KEY,
  client_endpoint TEXT NOT NULL,
  member_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para mapeamento de chats
CREATE TABLE IF NOT EXISTS chat_map (
  portal_domain TEXT NOT NULL,
  external_chat_id TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (portal_domain, external_chat_id),
  FOREIGN KEY (portal_domain) REFERENCES b24_portals(portal_domain) ON DELETE CASCADE
);

-- Tabela para configurações do sistema
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  evolution_url TEXT,
  evolution_token TEXT,
  webhook_url TEXT,
  auto_reconnect BOOLEAN DEFAULT true,
  log_level TEXT DEFAULT 'info',
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para mensagens
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  portal_domain TEXT NOT NULL,
  external_chat_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  message_type TEXT NOT NULL, -- 'incoming' | 'outgoing'
  content TEXT,
  media_url TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  source TEXT NOT NULL, -- 'evolution' | 'bitrix24'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (portal_domain) REFERENCES b24_portals(portal_domain) ON DELETE CASCADE
);

-- Tabela para logs do sistema
CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  level TEXT NOT NULL, -- 'debug' | 'info' | 'warning' | 'error' | 'success'
  message TEXT NOT NULL,
  source TEXT NOT NULL, -- 'evolution' | 'bitrix24' | 'system'
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_messages_portal_domain ON messages(portal_domain);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_source ON logs(source);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_b24_portals_updated_at BEFORE UPDATE ON b24_portals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir configurações padrão
INSERT INTO settings (id, evolution_url, evolution_token, webhook_url, auto_reconnect, log_level, max_retries)
VALUES (1, '', '', '', true, 'info', 3)
ON CONFLICT (id) DO NOTHING;
