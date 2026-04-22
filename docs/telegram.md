# Bot do Telegram

**Arquivo:** `lib/telegram.ts`  
**Inicialização:** `npm run telegram` (processo persistente em polling)  
**Alternativa webhook:** `POST /api/telegram`

O bot do Telegram é o canal de vendas conversacional do Site Factory. Um cliente entra em contato pelo Telegram, informa os dados do negócio e recebe o link do site pronto.

---

## Máquina de Estados

O bot mantém o estado de cada conversa em um `Map<userId, UserState>`:

```typescript
type UserState = {
  step: 'idle' | 'awaiting_business' | 'awaiting_city' | 'awaiting_whatsapp' | 'generating'
  business?: string
  city?: string
  neighborhood?: string
  whatsapp?: string
}
```

### Diagrama de Estados

```
[idle]
   │
   │ /start ou /criar
   ▼
[awaiting_business]
   │ usuário digita o nome do negócio
   ▼
[awaiting_city]
   │ usuário digita "Cidade, Bairro"
   ▼
[awaiting_whatsapp]
   │ usuário digita número do WhatsApp
   ▼
[generating] ──► createSite() ──► resposta com URL ou erro
   │
   └──► [idle] (reset após resposta)
```

---

## Fluxo de Conversa

### Passo 1 — Boas-vindas

**Trigger:** `/start` ou `/criar`

```
Bot: 🏭 Site Factory AI

Vou criar um site profissional para o seu negócio em menos de 2 minutos!

Qual é o nome do seu negócio?
(Ex: Barbearia do João, Pizzaria Bella Napoli)

[🚀 Criar meu site]  [ℹ️ Como funciona]
```

---

### Passo 2 — Nome do Negócio

**Trigger:** Qualquer mensagem de texto no estado `awaiting_business`

```
Usuário: Hamburgueria do Zé

Bot: Ótimo! 🍔 Hamburgueria do Zé

Agora me diz a cidade e bairro:
(Ex: Rio de Janeiro, Copacabana)
```

---

### Passo 3 — Cidade e Bairro

**Trigger:** Mensagem no estado `awaiting_city`

O bot faz `split(',')` para separar cidade do bairro:
- `"Rio de Janeiro, Copacabana"` → `city: "Rio de Janeiro"`, `neighborhood: "Copacabana"`
- `"Niterói"` → `city: "Niterói"`, `neighborhood: undefined`

```
Usuário: Niterói, Icaraí

Bot: Perfeito! 📍 Icaraí, Niterói

Qual é o número do WhatsApp do seu negócio?
(Ex: 21999999999 — com DDD, sem espaços)
```

---

### Passo 4 — WhatsApp

**Trigger:** Mensagem no estado `awaiting_whatsapp`

**Validação:** Remove caracteres não-numéricos e verifica se tem pelo menos 10 dígitos.

```
Usuário: (21) 9 8888-7777

Bot: ⏳ Gerando seu site...

Isso leva cerca de 30 segundos. Por favor, aguarde!
```

---

### Passo 5 — Geração

O bot chama `createSite()` com os dados coletados. Durante a geração, o estado é `generating`.

**Sucesso:**
```
Bot: ✅ Site criado com sucesso!

🌐 Hamburgueria do Zé em Icaraí, Niterói
🔗 https://sitefactory.com.br/s/hamburgueria-do-ze-niteroi-m3p8q

📱 Botão WhatsApp já configurado!

💰 Para manter seu site ativo:
• R$97 pagamento único
• R$19/mês plano mensal

[💳 Pagar R$97]  [📅 Plano Mensal R$19/mês]
```

**Falha:**
```
Bot: ❌ Ops! Tivemos um problema ao criar seu site.

Erro: Copywriter: Failed to parse AI response

Tente novamente com /criar
```

---

## Comandos Suportados

| Comando | Ação |
|---|---|
| `/start` | Inicia o fluxo de criação |
| `/criar` | Alias para `/start` |
| Qualquer texto | Processado de acordo com o estado atual |

---

## Configuração

### Criar o Bot

1. Abra o [@BotFather](https://t.me/BotFather) no Telegram
2. Envie `/newbot` e siga as instruções
3. Copie o token fornecido

### Variável de Ambiente

```env
TELEGRAM_BOT_TOKEN=1234567890:AAGxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Iniciar em Modo Polling (Desenvolvimento)

```bash
npm run telegram
```

O script fica rodando indefinidamente, recebendo updates do Telegram via long polling:

```typescript
bot.launch({ allowedUpdates: ['message'] })

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
```

### Modo Webhook (Produção)

Em produção com HTTPS, configure o webhook:

```bash
curl "https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://sitefactory.com.br/api/telegram"
```

E não rode `npm run telegram` — o Telegram vai enviar as atualizações para `/api/telegram`.

---

## Segurança

### Escape de MarkdownV2

O bot usa MarkdownV2, que exige escape de caracteres especiais. A função `escapeMarkdown()` é aplicada em todos os textos dinâmicos:

```typescript
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')
}

// Uso
bot.sendMessage(chatId, escapeMarkdown(site.deployUrl), { parse_mode: 'MarkdownV2' })
```

### Sem Autenticação de Usuário

O bot atual não tem controle de acesso — qualquer usuário do Telegram pode gerar sites. Para produção, considere:
- Verificar pagamento antes de gerar
- Limitar geração por `userId` (ex: 1 site grátis)
- Adicionar webhook secret para validar requests

---

## Tratamento de Estados Inválidos

Se o usuário enviar uma mensagem fora do fluxo esperado (ex: texto no estado `idle` sem `/start`), o bot orienta:

```
Bot: Para criar um site, use /criar
```

Se o WhatsApp informado for inválido (menos de 10 dígitos):
```
Bot: Por favor, informe um número de WhatsApp válido com DDD.
     Ex: 21999999999
```
