# Exemplos de Payloads para Testes

## 1. Webhook Evolution → Bitrix

### Mensagem de Texto
```json
{
  "portal_domain": "seu-portal.bitrix24.com",
  "from": "5511999999999",
  "chatId": "5511999999999@s.whatsapp.net",
  "type": "text",
  "text": "Olá! Preciso de ajuda com meu pedido."
}
```

### Mensagem com Imagem
```json
{
  "portal_domain": "seu-portal.bitrix24.com",
  "from": "5511999999999",
  "chatId": "5511999999999@s.whatsapp.net",
  "type": "image",
  "mediaUrl": "https://exemplo.com/imagem.jpg",
  "filename": "imagem.jpg"
}
```

### Áudio/Voz
```json
{
  "portal_domain": "seu-portal.bitrix24.com",
  "from": "5511999999999",
  "chatId": "5511999999999@s.whatsapp.net",
  "type": "audio",
  "mediaUrl": "https://exemplo.com/audio.mp3",
  "filename": "audio.mp3"
}
```

### Documento
```json
{
  "portal_domain": "seu-portal.bitrix24.com",
  "from": "5511999999999",
  "chatId": "5511999999999@s.whatsapp.net",
  "type": "document",
  "mediaUrl": "https://exemplo.com/documento.pdf",
  "filename": "documento.pdf"
}
```

## 2. Evento Bitrix → Evolution

### OnImConnectorMessageAdd (exemplo)
```json
{
  "event": "OnImConnectorMessageAdd",
  "data": {
    "FIELDS": {
      "MESSAGE": {
        "text": "Olá! Como posso ajudar?",
        "user": {
          "id": "5511999999999"
        }
      }
    }
  },
  "auth": {
    "client_endpoint": "https://seu-portal.bitrix24.com/rest/"
  }
}
```

## 3. Setup do Conector

### POST /api/setup
```bash
curl -X POST https://seu-projeto.vercel.app/api/setup \
  -H "Content-Type: application/json" \
  -d '{
    "portal_domain": "seu-portal.bitrix24.com",
    "connector_id": "EVOLUTION_CUSTOM",
    "name": "Evolution WhatsApp"
  }'
```

## 4. Teste de Webhook

### Simular entrada Evolution
```bash
curl -X POST https://seu-projeto.vercel.app/api/wa/webhook-in \
  -H "Content-Type: application/json" \
  -d '{
    "portal_domain": "seu-portal.bitrix24.com",
    "from": "5511999999999",
    "type": "text",
    "text": "Teste de mensagem"
  }'
```

## 5. Verificação de Status

### Confirmar Delivery
```json
{
  "CONNECTOR": "EVOLUTION_CUSTOM",
  "CHAT": {
    "id": "5511999999999"
  },
  "USER": {
    "id": "5511999999999"
  },
  "MESSAGE": {
    "id": "msg_123"
  },
  "STATUS": "delivered"
}
```

## Notas

- **portal_domain**: Deve ser o domínio do seu portal Bitrix24
- **from**: Número do telefone no formato internacional (sem +)
- **mediaUrl**: URLs devem ser públicas e acessíveis
- **chatId**: Pode ser o mesmo que o telefone ou JID completo do WhatsApp
