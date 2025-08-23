# Deploy na Vercel

## 1. Preparação

### 1.1. Instalar Vercel CLI
```bash
npm i -g vercel
```

### 1.2. Login na Vercel
```bash
vercel login
```

## 2. Configuração do Projeto

### 2.1. Variáveis de Ambiente
Configure as seguintes variáveis no painel da Vercel:

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

### 2.2. Configurar no Painel da Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Vá em **Settings** → **Environment Variables**
3. Adicione cada variável acima

## 3. Deploy

### 3.1. Deploy Manual
```bash
vercel --prod
```

### 3.2. Deploy via Git
1. Conecte seu repositório GitHub/GitLab
2. Configure as variáveis de ambiente
3. Deploy automático será feito

## 4. Verificação

### 4.1. Testar Endpoints
```bash
# Testar callback
curl -X POST https://seu-projeto.vercel.app/api/b24/callback

# Testar setup
curl -X POST https://seu-projeto.vercel.app/api/setup \
  -H "Content-Type: application/json" \
  -d '{"portal_domain": "seu-portal.bitrix24.com"}'

# Testar webhook
curl -X POST https://seu-projeto.vercel.app/api/wa/webhook-in \
  -H "Content-Type: application/json" \
  -d '{"portal_domain": "seu-portal.bitrix24.com", "from": "5511999999999", "type": "text", "text": "teste"}'
```

### 4.2. Logs
- Acesse **Functions** no painel da Vercel
- Clique em qualquer função para ver logs
- Use `vercel logs` no terminal

## 5. Configuração do Bitrix24

### 5.1. App Local
1. No portal Bitrix24: **Aplicativos** → **Recursos de desenvolvedor** → **Outros** → **Aplicativo local**
2. Configure:
   - **Installation callback URL**: `https://SEU_PROJETO.vercel.app/api/b24/callback`
   - **Escopos**: `imconnector`, `imopenlines`
3. Instale o app

### 5.2. Setup do Conector
```bash
curl -X POST https://SEU_PROJETO.vercel.app/api/setup \
  -H "Content-Type: application/json" \
  -d '{"portal_domain": "SEU_PORTAL.bitrix24.com"}'
```

### 5.3. Open Channel
1. **Contact Center** → **Open Channels**
2. Crie novo canal
3. Associe o conector "Evolution WhatsApp"

## 6. Configuração da Evolution API

### 6.1. Webhook
Configure o webhook da Evolution para:
```
POST https://SEU_PROJETO.vercel.app/api/wa/webhook-in
```

### 6.2. Payload
O webhook deve enviar:
```json
{
  "portal_domain": "seu-portal.bitrix24.com",
  "from": "5511999999999",
  "type": "text",
  "text": "mensagem"
}
```

## 7. Troubleshooting

### 7.1. Erro 500
- Verifique logs na Vercel
- Confirme variáveis de ambiente
- Teste endpoints individualmente

### 7.2. Erro de Token
- Verifique `B24_CLIENT_ID` e `B24_CLIENT_SECRET`
- Confirme se o app foi instalado corretamente

### 7.3. Erro de Supabase
- Verifique `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE`
- Confirme se as tabelas foram criadas

### 7.4. Erro de Evolution
- Verifique `EVOLUTION_BASE_URL` e `EVOLUTION_TOKEN`
- Teste conectividade com a Evolution API

## 8. Monitoramento

### 8.1. Vercel Analytics
- Habilite **Analytics** no projeto
- Monitore performance das funções

### 8.2. Logs Estruturados
```javascript
console.log('Webhook recebido:', { portal_domain, from, type });
```

### 8.3. Alertas
Configure alertas para:
- Erros 500
- Tempo de resposta > 10s
- Falhas de autenticação
