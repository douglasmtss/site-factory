# Arquitetura

## Visão Geral

O Site Factory AI é uma aplicação **Next.js 15** com App Router que combina:

- Uma **landing page de vendas** (marketing) em `/`
- Uma **API REST** para geração de sites via POST
- Uma **rota dinâmica** `/s/[slug]` que serve cada site gerado diretamente do banco de dados
- Um **bot de Telegram** como canal de vendas conversacional
- **Scripts CLI** para geração individual e em lote

---

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        CANAIS DE ENTRADA                        │
│                                                                 │
│   WhatsApp CTA   │  POST /api/generate  │  CLI  │  Telegram     │
└────────┬─────────┴──────────┬───────────┴───┬───┴──────┬────────┘
         │                   │               │          │
         └───────────────────┴───────────────┴──────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────┐
                    │   lib/orchestrator.ts          │
                    │   createSite(BusinessInput)    │
                    └──────────────┬─────────────────┘
                                   │
               ┌───────────────────┼───────────────────┐
               ▼                   ▼                   ▼
        ┌─────────────┐   ┌─────────────────┐   ┌──────────────┐
        │   AGENTES   │   │     SKILLS      │   │   INFRA      │
        │             │   │                 │   │              │
        │ planner     │   │ skills/seo.ts   │   │ lib/mongodb  │
        │ copywriter  │◄──│ skills/         │   │ models/Site  │
        │ ui          │   │   conversion.ts │   │ agents/      │
        │ code        │   │ skills/         │   │   deploy.ts  │
        │ deploy      │   │   whatsapp.ts   │   │              │
        └─────────────┘   └─────────────────┘   └──────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────────┐
                    │         SAÍDA                    │
                    │  HTML gerado + MongoDB + Deploy  │
                    └──────────────────────────────────┘
                                   │
                    ┌──────────────┴───────────────┐
                    ▼                              ▼
           /s/{slug} (Next.js)         generated-sites/{slug}/
           Servido do MongoDB          index.html (local)
```

---

## Camadas da Aplicação

### 1. Camada de Apresentação (`app/`)

| Arquivo | Função |
|---|---|
| `app/page.tsx` | Landing page de marketing (Server Component, sem JS client) |
| `app/layout.tsx` | Layout raiz com fonte Inter e metadados globais |
| `app/s/[slug]/page.tsx` | Rota dinâmica que serve sites gerados — busca HTML do MongoDB e renderiza via `dangerouslySetInnerHTML` |

### 2. Camada de API (`app/api/`)

| Rota | Método | Função |
|---|---|---|
| `/api/generate` | POST | Dispara o pipeline de criação de site |
| `/api/sites` | GET | Lista todos os sites gerados |
| `/api/telegram` | POST | Webhook alternativo para o bot do Telegram |

### 3. Camada de Orquestração (`lib/orchestrator.ts`)

O núcleo da aplicação. Executa um pipeline sequencial de 8 etapas chamando agentes e persistindo no banco. Ver [orchestrator.md](./orchestrator.md) para detalhes.

### 4. Agentes (`agents/`)

Unidades de computação independentes com responsabilidade única. Alguns usam IA (GPT-4o-mini), outros são puramente determinísticos. Ver [agents.md](./agents.md).

### 5. Skills (`skills/`)

Módulos utilitários puros (sem estado, sem chamadas externas). São injetados nos prompts dos agentes ou usados diretamente no código gerado. Ver [skills.md](./skills.md).

### 6. Infraestrutura (`lib/`, `models/`)

- `lib/mongodb.ts` — Singleton de conexão com MongoDB
- `lib/telegram.ts` — Bot do Telegram com máquina de estados
- `models/Site.ts` — Schema Mongoose do documento de site

---

## Fluxo de Dados

```
BusinessInput {
  business: "Barbearia do João"
  city: "Rio de Janeiro"
  neighborhood: "Copacabana"
  whatsapp: "21999999999"
  clientName: "João"
}
        │
        ▼ plannerAgent
SitePlan {
  niche: "Barbearia"
  tone: "confiante e masculino"
  sections: ["hero","services","about","cta","footer"]
  keywords: ["barbearia copacabana","barbearia rj",...]
  colorScheme: { primary: "#1a1a1a", secondary: "#d4af37" }
}
        │
        ▼ copywriterAgent  (GPT-4o-mini + skills de SEO e conversão)
SiteContent {
  title: "Barbearia do João — Copacabana"
  tagline: "Seu estilo, nossa arte"
  hero: { headline: "...", subheadline: "...", cta: "Agendar pelo WhatsApp" }
  services: [{ name: "Corte", description: "...", icon: "✂️" }, ...]
  seoMeta: { metaTitle: "...", metaDescription: "..." }
}
        │
        ▼ uiAgent  (determinístico — lookup por nicho)
SiteDesign {
  primaryColor: "#1a1a1a"
  secondaryColor: "#d4af37"
  accentColor: "#f5f5f5"
  fontFamily: "Inter"
  style: "premium"
}
        │
        ▼ codeAgent  (determinístico — template HTML)
GeneratedCode {
  html: "<!DOCTYPE html>...",   // ~300 linhas de HTML completo
  slug: "barbearia-do-joao-rio-de-janeiro-k2x9f"
}
        │
        ▼ deployAgent
DeployResult {
  url: "https://meusite.com/s/barbearia-do-joao-rio-de-janeiro-k2x9f"
  provider: "local"
  slug: "barbearia-do-joao-rio-de-janeiro-k2x9f"
}
        │
        ▼ Site.create()  (MongoDB)
GeneratedSite {
  _id: ObjectId("..."),
  slug: "barbearia-do-joao-...",
  status: "published",
  deployUrl: "https://...",
  createdAt: 2026-04-22T...
}
```

---

## Princípios de Design

### Agentes Independentes
Cada agente recebe inputs tipados e retorna `AgentResult<T>`. Eles não se comunicam diretamente — toda orquestração passa pelo `orchestrator.ts`.

### Skills como Injeção de Prompt
As skills não chamam a IA. Elas geram **strings de instrução** que são injetadas nos prompts dos agentes, separando o conhecimento de negócio (o que gerar) da chamada de IA (como gerar).

### Fallbacks em Cascata
- Planner: se a IA não retornar `colorScheme`, usa mapa local por nicho
- Deploy: se Vercel falhar, faz deploy local automaticamente
- OpenAI client: se `OPENAI_API_KEY` não estiver definido, usa `'build-placeholder'` para não quebrar o build

### Servidor Preferível ao Cliente
A rota `/s/[slug]` é um Server Component — o HTML do site é renderizado no servidor diretamente do MongoDB, sem JavaScript no cliente.
