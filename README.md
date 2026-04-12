# 🏭 Site Factory AI

> Fábrica de sites profissionais com inteligência artificial — cria sites completos para pequenos negócios em menos de 2 minutos, com SEO local, botão WhatsApp e deploy automático.

---

## O que é isso?

**Site Factory AI** é um SaaS + sistema de geração em massa que usa **multi-agents de IA** para criar sites profissionais para pequenos negócios locais (barbearias, hamburguerias, salões, mecânicas, etc.) de forma totalmente automatizada.

O cliente informa:
- Nome e tipo do negócio
- Cidade / bairro
- Número do WhatsApp

E em menos de 2 minutos o sistema entrega um site completo, publicado na internet, com SEO local otimizado e botão de WhatsApp funcionando.

---

## Modelo de negócio

| Canal | Preço | Estratégia |
|---|---|---|
| Venda direta (WhatsApp) | R$97 único | Aborde negócios locais com demo |
| Plano mensal | R$19/mês | Recorrência, site + hospedagem |
| Geração em massa + SEO | Orgânico | Gera tráfego que vira lead |

**Cenário realista:** 300 sites no ar → 1% converte → ~3 clientes/dia → ~R$290/dia sem anúncios.

---

## Stack

| Tecnologia | Uso |
|---|---|
| **Next.js 15** | App principal, landing page, rotas dinâmicas |
| **TypeScript** | Tipagem completa em todo o projeto |
| **Tailwind CSS** | Estilização da landing page |
| **OpenAI GPT-4o-mini** | Geração de conteúdo (Planner + Copywriter agents) |
| **MongoDB + Mongoose** | Persistência de sites e clientes |
| **Telegraf** | Bot Telegram para criação via chat |
| **Vercel API** | Deploy automático dos sites gerados |
| **Node.js 20+** | Runtime necessário |

---

## Arquitetura

```
[ INPUT ]
  → Formulário / API / Telegram / Bulk JSON
        ↓
[ ORCHESTRATOR ]  ←  lib/orchestrator.ts
        ↓
┌──────────────────────────────────────┐
│           AGENTS (pipeline)           │
│                                       │
│  1. Planner Agent                     │
│     → detecta nicho, define páginas   │
│     → cores, keywords, tom            │
│                                       │
│  2. Copywriter Agent                  │
│     → gera todo o conteúdo via IA     │
│     → SEO + conversão + CTA           │
│                                       │
│  3. UI Agent                          │
│     → define design, cores, fontes    │
│                                       │
│  4. Code Agent                        │
│     → gera HTML completo do site      │
│                                       │
│  5. Deploy Agent                      │
│     → salva local ou publica Vercel   │
└──────────────────────────────────────┘
        ↓
[ SITE PUBLICADO ]
  URL: /s/{slug} ou Vercel
        ↓
[ MONGODB ]
  → persiste tudo para consulta futura
```

---

## Estrutura de arquivos

```
site-factory/
│
├── agents/               # Agents de IA
│   ├── planner.ts        # Análise do negócio → plano estruturado
│   ├── copywriter.ts     # Gera conteúdo com IA (SEO + conversão)
│   ├── ui.ts             # Define design e cores por nicho
│   ├── code.ts           # Gera HTML completo do site
│   └── deploy.ts         # Publica o site (local ou Vercel)
│
├── skills/               # Habilidades reutilizáveis dos agents
│   ├── seo.ts            # SEO local: keywords, meta tags, schema
│   ├── conversion.ts     # Copy de conversão por nicho
│   └── whatsapp.ts       # Geração de links e CTAs WhatsApp
│
├── lib/                  # Core da aplicação
│   ├── orchestrator.ts   # Pipeline principal (createSite)
│   ├── mongodb.ts        # Conexão MongoDB com cache
│   └── telegram.ts       # Bot Telegram (polling)
│
├── app/                  # Next.js App Router
│   ├── page.tsx          # Landing page (vendas)
│   ├── layout.tsx        # Layout global
│   ├── globals.css       # Estilos globais + Tailwind
│   ├── s/[slug]/         # Sites gerados (rota dinâmica)
│   │   └── page.tsx
│   └── api/
│       ├── generate/     # POST → cria site
│       ├── sites/        # GET → lista sites
│       └── telegram/     # POST → webhook Telegram
│
├── generator/            # Scripts de linha de comando
│   ├── create-site.ts    # Cria um site individual
│   └── bulk-generate.ts  # Geração em massa
│
├── models/
│   └── Site.ts           # Schema Mongoose
│
├── types/
│   └── index.ts          # Tipos TypeScript centrais
│
├── .env.example          # Variáveis de ambiente necessárias
├── .nvmrc                # Node 20
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Agents

### 1. Planner Agent (`agents/planner.ts`)
Recebe o input do negócio e retorna um plano estruturado.

**Input:** nome do negócio, cidade, bairro  
**Output:**
```json
{
  "pages": ["home", "servicos", "sobre"],
  "sections": ["hero", "servicos", "galeria", "horarios", "cta"],
  "tone": "descontraído e profissional",
  "keywords": ["barbearia em copacabana", "corte masculino rj"],
  "niche": "Barbearia",
  "colorScheme": { "primary": "#1a1a2e", "secondary": "#e94560", "style": "premium" }
}
```

### 2. Copywriter Agent (`agents/copywriter.ts`)
Usa GPT-4o-mini para gerar todo o conteúdo com foco em SEO local e conversão.

**Output:** hero, sobre, serviços, CTAs, meta tags completas

### 3. UI Agent (`agents/ui.ts`)
Define o design visual com base no nicho detectado. Funciona sem chamada de IA — usa mapas de estilo predefinidos por nicho.

### 4. Code Agent (`agents/code.ts`)
Gera um arquivo HTML completo com CSS inline, responsivo, com botão flutuante de WhatsApp.

### 5. Deploy Agent (`agents/deploy.ts`)
- **Com `VERCEL_TOKEN`:** publica automaticamente via API da Vercel
- **Sem token:** salva em `generated-sites/{slug}/index.html` e serve via `/s/{slug}`

---

## Skills

### SEO (`skills/seo.ts`)
- Gera keywords hiperlocais (cidade + bairro + serviço)
- Meta title e description otimizados
- JSON-LD Schema.org para negócio local
- Instruções para o prompt da IA

### Conversion (`skills/conversion.ts`)
- Copy de alta conversão por nicho (barbearia, restaurante, estética, mecânica…)
- Padrão: dor → solução → prova social → urgência → CTA
- Respostas prontas para objeções comuns

### WhatsApp (`skills/whatsapp.ts`)
- Gera links `wa.me` com mensagem pré-preenchida
- Botão flutuante fixo em todos os sites
- CTAs contextuais (agenda, pedido, orçamento, contato)

---

## Nichos suportados

| Nicho | Detectado por | Design |
|---|---|---|
| Barbearia | "barbearia", "barber", "cabelo" | Dark + vermelho premium |
| Hamburgueria | "hamburgueria", "hamburguer", "burger" | Laranja bold |
| Pizzaria | "pizzaria", "pizza" | Vermelho bold |
| Restaurante | "restaurante" | Azul escuro + laranja |
| Salão de Beleza | "salao", "salon", "beleza" | Roxo premium |
| Estética | "estetica" | Lilás minimal |
| Mecânica | "mecanica", "mecanico" | Azul + vermelho |
| Advocacia | "advogado", "advocacia", "juridico" | Escuro + dourado |
| Odontologia | "dentista", "odonto" | Azul claro |
| + outros | qualquer texto | Verde moderno (padrão) |

---

## API

### `POST /api/generate`
Cria um novo site.

```json
// Request body
{
  "business": "Barbearia do João",
  "city": "Rio de Janeiro",
  "neighborhood": "Copacabana",
  "whatsapp": "21999999999"
}

// Response
{
  "success": true,
  "url": "http://localhost:3000/s/barbearia-do-joao-rio-de-janeiro-abc123",
  "slug": "barbearia-do-joao-rio-de-janeiro-abc123",
  "site": { ... }
}
```

### `GET /api/sites`
Lista todos os sites gerados (últimos 100, ordenados por data).

```json
{
  "success": true,
  "total": 42,
  "sites": [
    {
      "slug": "...",
      "businessName": "Barbearia do João",
      "city": "Rio de Janeiro",
      "niche": "Barbearia",
      "status": "published",
      "deployUrl": "https://...",
      "createdAt": "2026-04-11T..."
    }
  ]
}
```

---

## Variáveis de ambiente

```env
# Obrigatório para geração de conteúdo
OPENAI_API_KEY=sk-...

# Bot Telegram (modo polling — npm run telegram)
TELEGRAM_BOT_TOKEN=...

# WhatsApp padrão (quando cliente não informa)
WHATSAPP_NUMBER=5521999999999

# MongoDB (local ou Atlas)
MONGODB_URI=mongodb://localhost:27017/site-factory

# URL base do sistema
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Deploy automático na Vercel (opcional)
VERCEL_TOKEN=...
VERCEL_TEAM_ID=
```

---

## Scripts disponíveis

| Script | Comando | Descrição |
|---|---|---|
| Servidor dev | `npm run dev` | Next.js em modo desenvolvimento |
| Build | `npm run build` | Build de produção |
| Start | `npm run start` | Servidor de produção |
| Telegram Bot | `npm run telegram` | Inicia o bot em modo polling |
| Geração em massa | `npm run bulk` | Gera sites da lista padrão |
| Criar site | `npx tsx generator/create-site.ts ...` | Cria um site via terminal |

---

## Deploy do sistema

### Vercel (recomendado)
```bash
npm i -g vercel
vercel --prod
```
Configure as variáveis de ambiente no painel da Vercel.

### Docker / VPS
```bash
npm run build
npm run start
```
Requer MongoDB acessível e Node 20+.

---

## Requisitos

- Node.js 20+ (use `nvm use 20`)
- MongoDB local ou Atlas (gratuito)
- Chave OpenAI (GPT-4o-mini custa ~$0.0001 por site)
- Token do bot Telegram (opcional)
- Token Vercel (opcional, para deploy automático)
