# Bridge Bitrix24 ↔ Evolution API (WhatsApp)

Bridge 100% back-end entre Bitrix24 (Open Channels) e Evolution API (WhatsApp não-oficial), sem UI.

## Arquitetura

```
WhatsApp (Evolution API) ⇄ Gateway Next.js (Vercel) ⇄ Bitrix24 REST
```

- **Entrada**: Evolution → `/api/wa/webhook-in` → `imconnector.send.messages` → Contact Center
- **Saída**: `OnImConnectorMessageAdd` → `/api/b24/events/imconnector` → Evolution → confirma delivery

## Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **Supabase** (persistência)
- **Vercel** (hospedagem)

## Pré-requisitos

1. **Bitrix24**: Portal com Open Channels habilitado
2. **Evolution API**: Instância rodando com webhook configurado
3. **Supabase**: Projeto criado com tabelas configuradas
4. **Vercel**: Conta para deploy

## Instalação

### 1. Clone e Configure

```bash
git clone <seu-repo>
cd conector_b24
npm install
```

### 2. Variáveis de Ambiente

Copie `env.example` para `.env.local` e configure:

```env
# Bitrix (do App Local criado no portal)
B24_CLIENT_ID=local.xxxxxxxxxxxxxxxxxx
B24_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
BASE_URL=https://seu-projeto.vercel.app

# Evolution API
EVOLUTION_BASE_URL=https://sua-evolution:port
EVOLUTION_TOKEN=seu_token_da_evolution

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGci...
```

### 3. Banco de Dados

Execute o SQL em `database.sql` no seu projeto Supabase.

### 4. Deploy na Vercel

```bash
vercel --prod
```

### 5. App Local Bitrix24

1. No portal Bitrix24: **Aplicativos** → **Recursos de desenvolvedor** → **Outros** → **Aplicativo local**
2. Configure:
   - **Installation callback URL**: `https://SEU_DOMINIO/api/b24/callback`
   - **Escopos**: `imconnector`, `imopenlines`
3. Instale o app

### 6. Setup do Conector

Execute uma vez:

```bash
curl -X POST https://SEU_DOMINIO/api/setup \
  -H "Content-Type: application/json" \
  -d '{"portal_domain": "SEU_PORTAL.bitrix24.com"}'
```

### 7. Open Channel

1. No Bitrix24: **Contact Center** → **Open Channels**
2. Crie novo canal
3. Associe o conector "Evolution WhatsApp"

### 8. Webhook Evolution

Configure o webhook da Evolution para:
```
POST https://SEU_DOMINIO/api/wa/webhook-in
```

## Estrutura do Projeto

```
src/
  app/
    api/
      b24/
        callback/route.ts          # Instalação OAuth
        events/imconnector/route.ts # Eventos Bitrix
      wa/
        webhook-in/route.ts        # Webhook Evolution
      setup/route.ts               # Setup inicial
  lib/
    bitrix.ts                      # Cliente Bitrix
    evolution.ts                   # Cliente Evolution
    store.ts                       # Persistência
    utils.ts                       # Helpers
```

## Fluxos

### Entrada (Cliente → Agente)
1. Cliente envia mensagem no WhatsApp
2. Evolution dispara webhook para `/api/wa/webhook-in`
3. Sistema chama `imconnector.send.messages`
4. Mensagem aparece no Contact Center

### Saída (Agente → Cliente)
1. Agente responde no Contact Center
2. Bitrix dispara evento `OnImConnectorMessageAdd`
3. Sistema recebe em `/api/b24/events/imconnector`
4. Envia via Evolution API
5. Confirma delivery com `imconnector.send.status.delivery`

## Teste

1. Envie mensagem do WhatsApp → veja entrar no Contact Center
2. Responda pelo Contact Center → veja no WhatsApp
3. Verifique status de entrega confirmado

## Notas Importantes

- **URLs de mídia** devem ser públicas para preview no Bitrix
- **Confirmação de delivery** é obrigatória para evitar status "não entregue"
- **Refresh de tokens** é automático via OAuth 2.0
- **Sem UI**: toda operação é no Contact Center/Open Channels

## Próximos Passos

- [ ] Vincular CRM (criar/achar contato por telefone)
- [ ] Regras de automação
- [ ] UI Admin embutida
- [ ] Switch para WhatsApp Cloud API

## Referências

- [Bitrix24 API Docs](https://apidocs.bitrix24.com)
- [Open Channels](https://helpdesk.bitrix24.com)
- [Evolution API](https://doc.evolution-api.com)
