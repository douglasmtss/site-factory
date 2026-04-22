# API REST

A aplicação expõe 3 endpoints via Next.js App Router em `app/api/`.

---

## `POST /api/generate` — Gerar Site

**Arquivo:** `app/api/generate/route.ts`

Dispara o pipeline completo de criação de site.

### Request

```http
POST /api/generate
Content-Type: application/json

{
  "business": "Barbearia do João",
  "city": "Rio de Janeiro",
  "neighborhood": "Copacabana",
  "whatsapp": "21999999999",
  "clientName": "João",
  "monthlyPlan": false
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `business` | string | **Sim** | Nome do negócio |
| `city` | string | **Sim** | Cidade |
| `neighborhood` | string | Não | Bairro |
| `whatsapp` | string | Não | Número do WhatsApp (com ou sem DDI) |
| `clientName` | string | Não | Nome do dono do negócio |
| `monthlyPlan` | boolean | Não | `true` para plano mensal (R$19/mês) |

### Response — Sucesso `200`

```json
{
  "success": true,
  "url": "https://sitefactory.com.br/s/barbearia-do-joao-rio-de-janeiro-k2x9f",
  "slug": "barbearia-do-joao-rio-de-janeiro-k2x9f",
  "site": {
    "_id": "66c8a1f2e4b0a12345678901",
    "slug": "barbearia-do-joao-rio-de-janeiro-k2x9f",
    "businessName": "Barbearia do João",
    "city": "Rio de Janeiro",
    "neighborhood": "Copacabana",
    "niche": "Barbearia",
    "status": "published",
    "deployUrl": "https://sitefactory.com.br/s/barbearia-do-joao-...",
    "whatsappLink": "https://wa.me/5521999999999?text=...",
    "createdAt": "2026-04-22T14:30:00.000Z"
  }
}
```

### Response — Erro de Validação `400`

```json
{
  "success": false,
  "error": "business and city are required"
}
```

### Response — Erro de Pipeline `500`

```json
{
  "success": false,
  "error": "Copywriter: Failed to parse AI response as JSON"
}
```

### Exemplo cURL

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "business": "Pizzaria Bella Napoli",
    "city": "Niterói",
    "neighborhood": "Icaraí",
    "whatsapp": "21977776666"
  }'
```

### Exemplo JavaScript (fetch)

```typescript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    business: 'Mecânica do Paulo',
    city: 'São Gonçalo',
    whatsapp: '21955554444'
  })
})

const data = await response.json()
if (data.success) {
  console.log('Site criado:', data.url)
} else {
  console.error('Erro:', data.error)
}
```

---

## `GET /api/sites` — Listar Sites

**Arquivo:** `app/api/sites/route.ts`

Lista todos os sites gerados, ordenados do mais recente ao mais antigo.

### Request

```http
GET /api/sites
```

Sem parâmetros, sem autenticação (atenção: expõe dados de clientes — proteja em produção).

### Response — Sucesso `200`

```json
{
  "success": true,
  "total": 42,
  "sites": [
    {
      "_id": "66c8a1f2e4b0a12345678901",
      "slug": "barbearia-do-joao-rio-de-janeiro-k2x9f",
      "businessName": "Barbearia do João",
      "city": "Rio de Janeiro",
      "niche": "Barbearia",
      "status": "published",
      "deployUrl": "https://sitefactory.com.br/s/barbearia-do-joao-...",
      "whatsappLink": "https://wa.me/5521999999999?text=...",
      "createdAt": "2026-04-22T14:30:00.000Z"
    }
  ]
}
```

> **Projeção:** Retorna apenas os campos necessários para listagem. O conteúdo completo (`content`, `design`, `plan`) **não** é retornado para otimizar a resposta.

### Limites

- Máximo de **100 sites** por chamada
- Ordenação: `createdAt` decrescente (mais novos primeiro)

### Exemplo cURL

```bash
curl http://localhost:3000/api/sites | jq '.sites | length'
# → 42
```

---

## `POST /api/telegram` — Webhook do Bot

**Arquivo:** `app/api/telegram/route.ts`

Endpoint para receber atualizações do Telegram em modo webhook (alternativo ao polling do `lib/telegram.ts`).

### Configuração do Webhook no Telegram

```bash
curl -X POST "https://api.telegram.org/bot{BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://sitefactory.com.br/api/telegram"}'
```

### Request (enviado pelo Telegram)

```http
POST /api/telegram
Content-Type: application/json

{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": { "id": 123, "first_name": "João" },
    "chat": { "id": 123, "type": "private" },
    "text": "/criar"
  }
}
```

### Response — Sucesso `200`

```json
{ "ok": true }
```

### Response — Erro `500`

```json
{ "ok": false }
```

> **Nota:** Em desenvolvimento, prefira o modo polling (`npm run telegram`) em vez do webhook. O webhook é mais adequado para produção com HTTPS.

---

## Variáveis de Ambiente Relevantes

```env
GROQ_API_KEY=gsk_...            # obrigatório para /api/generate
MONGODB_URI=mongodb://...       # obrigatório para todos os endpoints
TELEGRAM_BOT_TOKEN=...          # obrigatório para /api/telegram
NEXT_PUBLIC_BASE_URL=https://... # usado na construção da deployUrl
```
