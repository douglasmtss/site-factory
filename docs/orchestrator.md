# Orquestrador — Pipeline de Criação de Sites

**Arquivo:** `lib/orchestrator.ts`  
**Função principal:** `createSite(input: BusinessInput): Promise<CreateSiteResult>`

O orquestrador é o coração do sistema. Ele coordena o pipeline sequencial de 8 etapas que transforma dados brutos de um negócio em um site publicado.

---

## As 8 Etapas

```
Etapa 1 ──► plannerAgent(input)
                │  SitePlan
                ▼
Etapa 2 ──► copywriterAgent(input, plan)
                │  SiteContent
                ▼
Etapa 3 ──► uiAgent(plan)
                │  SiteDesign
                ▼
Etapa 4 ──► buildWhatsAppLink(input)
                │  string (URL wa.me)
                ▼
Etapa 5 ──► generateSlug(business, city)
                │  string (ex: "barbearia-do-joao-rj-k2x9f")
                ▼
Etapa 6 ──► codeAgent(content, design, whatsapp, slug)
                │  { html: string, slug: string }
                ▼
Etapa 7 ──► deployAgent(html, slug)
                │  { url, provider, slug }
                ▼
Etapa 8 ──► Site.create(siteData)
                │  GeneratedSite (documento MongoDB)
                ▼
           CreateSiteResult { success, url, slug, site }
```

---

## Comportamento de Falha

| Etapa | Falha | Comportamento |
|---|---|---|
| 1 — Planner | Erro de IA | Retorna `{ success: false, error: "Planner: ..." }` imediatamente |
| 2 — Copywriter | Erro de IA | Retorna `{ success: false, error: "Copywriter: ..." }` imediatamente |
| 3 — UI | Nunca falha | Determinístico — sem risco |
| 4 — WhatsApp | Nunca falha | Determinístico |
| 5 — Slug | Nunca falha | Determinístico |
| 6 — Code | Nunca falha | Determinístico |
| 7 — Deploy | Falha Vercel | Faz fallback automático para deploy local |
| 8 — MongoDB | Erro de DB | Retorna `{ success: false, error: "Database: ..." }` |

Regra geral: **as etapas 1 e 2 são as únicas que podem encerrar o pipeline por falha de IA**. As demais são determinísticas ou têm fallback.

---

## Geração de Slug

O slug é gerado no formato:

```
{business-slugificado}-{city-slugificado}-{sufixo-base36}
```

Exemplo:
- Input: `"Barbearia do João"`, `"Rio de Janeiro"`
- Slug: `"barbearia-do-joao-rio-de-janeiro-k2x9f"`

O sufixo base36 é `Date.now().toString(36)`, garantindo unicidade sem precisar de UUID. Com o índice `unique` no MongoDB, colisões são detectadas automaticamente.

---

## Exemplo Completo

### Entrada

```typescript
const result = await createSite({
  business: "Hamburgueria do Zé",
  city: "Niterói",
  neighborhood: "Icaraí",
  whatsapp: "21988887777",
  clientName: "José"
})
```

### Saída esperada

```typescript
{
  success: true,
  url: "https://sitefactory.com.br/s/hamburgueria-do-ze-niteroi-m3p8q",
  slug: "hamburgueria-do-ze-niteroi-m3p8q",
  site: {
    _id: "...",
    slug: "hamburgueria-do-ze-niteroi-m3p8q",
    businessName: "Hamburgueria do Zé",
    city: "Niterói",
    neighborhood: "Icaraí",
    niche: "Hamburgueria",
    clientWhatsapp: "5521988887777",
    whatsappLink: "https://wa.me/5521988887777?text=...",
    deployUrl: "https://sitefactory.com.br/s/hamburgueria-do-ze-niteroi-m3p8q",
    status: "published",
    monthlyPlan: false,
    content: { title: "...", tagline: "...", ... },
    design: { primaryColor: "#d32f2f", ... },
    plan: { niche: "Hamburgueria", tone: "...", ... },
    createdAt: "2026-04-22T..."
  }
}
```

### Saída em caso de falha

```typescript
{
  success: false,
  error: "Copywriter: Failed to parse AI response as JSON"
}
```

---

## Dados Persistidos no MongoDB

Após a etapa 8, o orquestrador persiste o documento completo com todos os dados do pipeline:

```typescript
{
  // Identificação
  slug, businessName, city, neighborhood, niche,

  // Links
  whatsappLink, clientWhatsapp, deployUrl,

  // Dados dos agentes
  plan: SitePlan,
  content: SiteContent,
  design: SiteDesign,

  // Metadados
  status: "published",
  monthlyPlan: false,
  createdAt, updatedAt   // automáticos do Mongoose timestamps
}
```

> O `html` gerado pelo `codeAgent` **não** é salvo no MongoDB. O documento `/s/[slug]/page.tsx` reconstrói o HTML dinamicamente a partir de `content` e `design` em cada requisição.

---

## Código Simplificado

```typescript
export async function createSite(input: BusinessInput): Promise<CreateSiteResult> {
  // Etapa 1
  const planResult = await plannerAgent(input)
  if (!planResult.success) return { success: false, error: `Planner: ${planResult.error}` }

  // Etapa 2
  const contentResult = await copywriterAgent(input, planResult.data!)
  if (!contentResult.success) return { success: false, error: `Copywriter: ${contentResult.error}` }

  // Etapa 3 — nunca falha
  const designResult = await uiAgent(planResult.data!)

  // Etapas 4 e 5 — determinísticas
  const whatsappLink = buildWhatsAppLink(input)
  const slug = generateSlug(input.business, input.city)

  // Etapa 6 — determinística
  const codeResult = codeAgent(contentResult.data!, designResult.data!, input.whatsapp, slug)

  // Etapa 7 — com fallback
  const deployResult = await deployAgent(codeResult.data!.html, slug)

  // Etapa 8 — persiste tudo
  await connectMongo()
  const site = await Site.create({ ...siteData })

  return { success: true, url: deployResult.url, slug, site }
}
```
