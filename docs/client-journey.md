# Jornada do Cliente — Do Primeiro Acesso ao Site no Ar

Este documento descreve o fluxo completo de um novo cliente, desde o primeiro contato com o Site Factory AI até o site publicado e funcionando.

---

## Visão Geral do Fluxo

```
[Cliente descobre o Site Factory]
         │
         ▼
[Acessa a Landing Page /]
         │
         ▼
[Clica em "Criar meu site" → WhatsApp ou Telegram]
         │
    ┌────┴────┐
    ▼         ▼
[WhatsApp]  [Telegram Bot]
    │         │
    └────┬────┘
         ▼
[Informa: negócio + cidade + WhatsApp]
         │
         ▼
[POST /api/generate → Orchestrator]
         │
    ┌────┼────┬────┬────┐
    ▼    ▼    ▼    ▼    ▼
[Planner → Copywriter → UI → Code → Deploy]
         │
         ▼
[Site salvo no MongoDB]
         │
         ▼
[URL entregue ao cliente: /s/{slug}]
         │
         ▼
[Cliente acessa o site → clica no botão WhatsApp]
         │
         ▼
[Conversa de vendas direta com o dono do negócio]
```

---

## Etapa 1 — Descoberta e Landing Page

**Arquivo:** `app/page.tsx`  
**Rota:** `/`

O cliente chega à landing page por tráfego orgânico, anúncios ou indicação. A página é um **Server Component estático** (sem JavaScript no cliente) com as seguintes seções:

| Seção | Conteúdo |
|---|---|
| **Header fixo** | Logo + navegação + botão "Criar meu site" |
| **Hero** | Headline, subheadline e dois CTAs principais |
| **Como funciona** | 3 passos simplificados (informa → IA cria → site no ar) |
| **Funcionalidades** | 6 cards com os diferenciais do produto |
| **Nichos atendidos** | 8 segmentos com ícones (barbearia, pizzaria, etc.) |
| **Depoimentos** | 3 testemunhos de clientes fictícios |
| **Preços** | R$97 único ou R$19/mês |
| **CTA final** | Botão verde direto para o WhatsApp |

### O CTA principal

Todos os botões "Criar meu site" apontam para o WhatsApp do operador com uma mensagem pré-preenchida:

```
https://wa.me/{WHATSAPP_NUMBER}?text=Olá! Quero criar meu site profissional por R$97
```

O número é configurado via variável de ambiente `WHATSAPP_NUMBER`.

---

## Etapa 2 — Contato e Coleta de Dados

O cliente pode entrar em contato por dois canais:

### Canal A — WhatsApp direto

O cliente envia a mensagem pré-preenchida e o operador (você) coleta manualmente as informações:

1. Nome e tipo do negócio
2. Cidade (e bairro, se houver)
3. Número do WhatsApp para aparecer no site

Com esses dados em mãos, o operador dispara a criação via terminal ou API.

### Canal B — Bot do Telegram

**Arquivo:** `lib/telegram.ts`  
**Script:** `npm run telegram`

O bot guia o cliente por uma conversa estruturada, coletando os dados automaticamente:

```
/criar
   │
   ▼ Bot pergunta: "Qual é o nome e tipo do negócio?"
   │   Cliente responde: "Barbearia do João"
   │
   ▼ Bot pergunta: "Qual é a cidade (e bairro)?"
   │   Cliente responde: "Rio de Janeiro, Copacabana"
   │
   ▼ Bot pergunta: "Qual é o WhatsApp do negócio?"
   │   Cliente responde: "21999999999"
   │
   ▼ Bot confirma e inicia geração automaticamente
```

**Fluxo de estados do bot:**

| Estado | Descrição |
|---|---|
| `idle` | Aguardando comando `/criar` |
| `awaiting_business` | Esperando nome do negócio |
| `awaiting_city` | Esperando cidade/bairro |
| `awaiting_whatsapp` | Esperando número do WhatsApp |
| `generating` | Processando — chama `createSite()` |

O bot valida o número de WhatsApp (mínimo 10 dígitos) e adiciona o DDI `55` automaticamente se ausente.

---

## Etapa 3 — Disparo da Geração

A geração pode ser iniciada por três meios:

### Via API REST

```http
POST /api/generate
Content-Type: application/json

{
  "business": "Barbearia do João",
  "city": "Rio de Janeiro",
  "neighborhood": "Copacabana",
  "whatsapp": "21999999999"
}
```

**Arquivo:** `app/api/generate/route.ts`

Validações da rota:
- `business` e `city` são obrigatórios — retorna `400` se ausentes
- Erros internos retornam `500` com a mensagem do agente que falhou

### Via Bot do Telegram

O bot chama `createSite()` diretamente após coletar todos os dados.

### Via CLI

```bash
npx tsx generator/create-site.ts "Barbearia do João" "Rio de Janeiro" "Copacabana" "21999999999"
```

---

## Etapa 4 — Pipeline de Geração (Orchestrator)

**Arquivo:** `lib/orchestrator.ts`  
**Função:** `createSite(input: BusinessInput)`

O orchestrator executa **8 etapas sequenciais**. Se qualquer etapa falhar, o pipeline para e retorna o erro.

### Etapa 4.1 — Planner Agent

**Arquivo:** `agents/planner.ts`

1. Detecta o nicho pelo nome do negócio via `detectNiche()` — busca palavras-chave em um mapa com ~25 entradas (`barbearia`, `pizzaria`, `advogado`, etc.)
2. Envia prompt ao **Groq (llama-3.3-70b-versatile)** pedindo um JSON com:
   - `pages` — lista de páginas
   - `sections` — seções da home (`hero`, `servicos`, `cta`, etc.)
   - `tone` — tom de voz do negócio
   - `keywords` — palavras-chave locais para SEO
   - `colorScheme` — cores primária e secundária
3. Enriquece o resultado com dados locais se a IA não retornar cores ou seções

**Parâmetros Groq:** `temperature: 0.3`, `max_tokens: 600`

### Etapa 4.2 — Copywriter Agent

**Arquivo:** `agents/copywriter.ts`

1. Importa instruções das skills de **SEO** e **Conversão**
2. Envia prompt rico ao **Groq** com regras de copywriting, instrução de SEO local e gatilhos de conversão
3. Recebe um JSON completo com todo o texto do site:
   - `hero` — headline, subheadline, CTA
   - `about` — texto sobre o negócio
   - `services` — lista de serviços com ícone e descrição
   - `contact` — mensagem pré-preenchida do WhatsApp
   - `seoMeta` — title e description para o `<head>`

**Parâmetros Groq:** `temperature: 0.7`, `max_tokens: 1200`

### Etapa 4.3 — UI Agent

**Arquivo:** `agents/ui.ts`

- **100% determinístico** — sem chamada de IA
- Faz lookup no `styleMap` pelo nicho detectado
- Retorna `SiteDesign`: cores, fonte, estilo, botões, cards
- Se o Planner retornou um `colorScheme`, sobrescreve as cores do mapa

### Etapa 4.4 — WhatsApp Link

O orchestrator constrói o link completo do WhatsApp:

```
https://wa.me/5521999999999?text=Olá!+Quero+agendar+na+Barbearia+do+João
```

### Etapa 4.5 — Geração do Slug

```
"Barbearia do João" + "Rio de Janeiro" → "barbearia-do-joao-rio-de-janeiro-k2x9f"
```

O slug usa `slugify` com locale `pt` e um sufixo de timestamp em base-36 para garantir unicidade.

### Etapa 4.6 — Code Agent

**Arquivo:** `agents/code.ts`

- **100% determinístico** — sem chamada de IA
- Recebe `SiteContent` + `SiteDesign` e gera um `index.html` completo com:
  - CSS inline (sem dependências externas)
  - Layout responsivo
  - Botão flutuante do WhatsApp fixo na tela
  - Seções: hero, serviços, sobre, CTA

### Etapa 4.7 — Deploy Agent

**Arquivo:** `agents/deploy.ts`

Tenta deploy na **Vercel** se `VERCEL_TOKEN` estiver configurado; caso contrário, faz **deploy local**:

| Condição | Comportamento |
|---|---|
| `VERCEL_TOKEN` presente | Faz deploy via Vercel API v13 — retorna URL pública |
| `VERCEL_TOKEN` ausente | Salva HTML em `generated-sites/{slug}/index.html` |
| Vercel retorna erro | Fallback automático para deploy local |

A URL resultante segue o padrão:
- Vercel: `https://site-factory-{slug}.vercel.app`
- Local: `{NEXT_PUBLIC_BASE_URL}/s/{slug}` (ex.: `http://localhost:3000/s/barbearia-...`)

### Etapa 4.8 — Persistência no MongoDB

**Modelo:** `models/Site.ts`

O site completo é salvo no MongoDB com todos os dados:

```typescript
{
  slug,              // identificador único da URL
  businessName,      // nome do negócio
  city,              // cidade
  neighborhood,      // bairro (opcional)
  niche,             // nicho detectado
  plan,              // output do Planner Agent
  content,           // output do Copywriter Agent
  design,            // output do UI Agent
  whatsappLink,      // link do WhatsApp construído
  deployUrl,         // URL pública do site
  clientWhatsapp,    // WhatsApp do cliente
  status,            // 'published' | 'draft' | 'error'
  monthlyPlan,       // false por padrão
  createdAt          // timestamp automático
}
```

---

## Etapa 5 — Entrega ao Cliente

Após a geração, o resultado é retornado com:

```json
{
  "success": true,
  "url": "https://.../s/barbearia-do-joao-rio-de-janeiro-k2x9f",
  "slug": "barbearia-do-joao-rio-de-janeiro-k2x9f",
  "site": { ... }
}
```

### Via Telegram Bot

O bot envia automaticamente:

```
✅ Site criado com sucesso! 🎉

🌐 Link: https://.../s/barbearia-do-joao-...

O site já está online com:
✅ Botão WhatsApp integrado
✅ SEO local para Rio de Janeiro
✅ Design otimizado para converter

💰 Para ativar, faça o pagamento:
• R$97 pagamento único
• ou R$19/mês (site + hospedagem)
```

### Via API REST

A resposta JSON é retornada ao caller (integrações, painel, etc.).

### Via CLI

O link é impresso no terminal.

---

## Etapa 6 — O Cliente Final Acessa o Site

**Rota:** `/s/[slug]`  
**Arquivo:** `app/s/[slug]/page.tsx`

Quando o cliente final (o comprador do negócio) compartilha o link com seus clientes:

1. Next.js recebe a requisição em `/s/{slug}`
2. O Server Component conecta ao MongoDB e busca o documento pelo slug
3. O HTML gerado é renderizado via `dangerouslySetInnerHTML` (o HTML completo já está salvo no banco)
4. Os metadados SEO (`<title>`, `<meta description>`) são injetados dinamicamente via `generateMetadata()`
5. Se o slug não existir, Next.js retorna a página 404 via `notFound()`

O site renderizado contém o botão do WhatsApp que, quando clicado pelo visitante final, abre uma conversa direta com o dono do negócio.

---

## Etapa 7 — Geração em Lote (opcional)

**Arquivo:** `generator/bulk-generate.ts`  
**Script:** `npm run bulk`

Para criar múltiplos sites de uma vez (campanhas de prospecção):

```bash
npm run bulk                               # usa lista padrão (8 negócios)
npx tsx generator/bulk-generate.ts lista.json   # usa arquivo externo
```

O script respeita um delay de **3 segundos** entre cada geração para evitar rate limit da Groq.

---

## Resumo dos Tempos

| Etapa | Tempo médio |
|---|---|
| Planner Agent (Groq) | 2–5 segundos |
| Copywriter Agent (Groq) | 5–10 segundos |
| UI Agent | < 1ms |
| Code Agent | < 1ms |
| Deploy (Vercel) | 10–20 segundos |
| Deploy (local) | < 100ms |
| Persistência MongoDB | < 500ms |
| **Total (com Vercel)** | **~30–60 segundos** |
| **Total (local)** | **~10–20 segundos** |

---

## Variáveis de Ambiente Necessárias

| Variável | Obrigatória | Descrição |
|---|---|---|
| `GROQ_API_KEY` | ✅ Sim | Chave para as chamadas de IA (Planner + Copywriter) |
| `MONGODB_URI` | ✅ Sim | String de conexão com o banco |
| `NEXT_PUBLIC_BASE_URL` | ✅ Sim | URL base do sistema (ex.: `https://seudominio.com`) |
| `WHATSAPP_NUMBER` | ✅ Sim | Número do WhatsApp do operador (aparece na landing page) |
| `TELEGRAM_BOT_TOKEN` | Opcional | Token do bot para o canal Telegram |
| `VERCEL_TOKEN` | Opcional | Token para deploy automático na Vercel |
| `VERCEL_TEAM_ID` | Opcional | ID do time Vercel (se conta Team) |

---

## Diagrama de Sequência Completo

```
Cliente          Landing Page     WhatsApp/Telegram    API             Orchestrator       MongoDB
   │                  │                  │              │                   │                │
   │── acessa ───────►│                  │              │                   │                │
   │◄─ HTML estático ─│                  │              │                   │                │
   │                  │                  │              │                   │                │
   │── clica CTA ────────────────────────►              │                   │                │
   │   (negócio+cidade+whatsapp)          │              │                   │                │
   │                  │                  │── POST ──────►                   │                │
   │                  │                  │              │── createSite() ──►│                │
   │                  │                  │              │                   │── plannerAgent │
   │                  │                  │              │                   │   (Groq) ──────┤
   │                  │                  │              │                   │── copywriter   │
   │                  │                  │              │                   │   (Groq) ──────┤
   │                  │                  │              │                   │── uiAgent      │
   │                  │                  │              │                   │── codeAgent    │
   │                  │                  │              │                   │── deployAgent  │
   │                  │                  │              │                   │── Site.create ─►
   │                  │                  │              │◄─ { url, slug } ──│                │
   │                  │                  │◄─ url ───────│                   │                │
   │◄─ link do site ──────────────────────              │                   │                │
   │                  │                  │              │                   │                │
   │── acessa /s/{slug} ─────────────────────────────────────────────────────────────────────►
   │◄─ HTML do site renderizado ──────────────────────────────────────────────────────────────
```
