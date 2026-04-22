# Agentes

Os agentes são as unidades de trabalho do pipeline. Cada um recebe um input tipado e retorna `AgentResult<T>`.

```typescript
type AgentResult<T> = {
  success: boolean
  data?: T
  error?: string
}
```

---

## Visão Geral

| Agente | Arquivo | Usa IA? | Input | Output |
|---|---|---|---|---|
| Planner | `agents/planner.ts` | Sim (GPT-4o-mini) | `BusinessInput` | `SitePlan` |
| Copywriter | `agents/copywriter.ts` | Sim (GPT-4o-mini) | `BusinessInput` + `SitePlan` | `SiteContent` |
| UI | `agents/ui.ts` | Não | `SitePlan` | `SiteDesign` |
| Code | `agents/code.ts` | Não | `SiteContent` + `SiteDesign` + `string` + `string` | `{ html, slug }` |
| Deploy | `agents/deploy.ts` | Não | `html: string` + `slug: string` | `DeployResult` |

---

## Agente Planner

**Arquivo:** `agents/planner.ts`  
**Responsabilidade:** Analisar o negócio e criar um plano estruturado de site.

### O que faz

1. Detecta o **nicho** do negócio via `detectNiche()` — busca palavras-chave no nome
2. Chama GPT-4o-mini pedindo um JSON com estrutura do site
3. Enriquece o resultado com dados locais (cores e seções por nicho) se a IA não retornou

### Detecção de Nicho

```typescript
const NICHE_MAP: Record<string, string> = {
  barbearia: 'Barbearia',
  barber: 'Barbearia',
  hamburgueria: 'Hamburgueria',
  burger: 'Hamburgueria',
  pizzaria: 'Pizzaria',
  pizza: 'Pizzaria',
  restaurante: 'Restaurante',
  // ... ~25 entradas
}

function detectNiche(businessInput: string): string {
  const lower = businessInput.toLowerCase()
  for (const [key, value] of Object.entries(NICHE_MAP)) {
    if (lower.includes(key)) return value
  }
  return 'Negócio Local'
}
```

### Prompt enviado ao GPT-4o-mini

```
Você é um especialista em marketing digital para pequenos negócios brasileiros.
Crie um plano de site para: {business} em {city}, {neighborhood}.
Nicho detectado: {niche}

Retorne APENAS um JSON válido com esta estrutura:
{
  "pages": ["home"],
  "sections": ["hero", "services", "about", "cta", "footer"],
  "tone": "profissional e confiável",
  "keywords": ["keyword1", "keyword2"],
  "niche": "{niche}",
  "colorScheme": {
    "primary": "#hexcolor",
    "secondary": "#hexcolor"
  }
}
```

### Parâmetros da chamada

```typescript
model: 'gpt-4o-mini'
temperature: 0.3    // baixa criatividade — queremos estrutura consistente
max_tokens: 600
```

### Exemplo de Output

```typescript
{
  success: true,
  data: {
    pages: ["home"],
    sections: ["hero", "services", "about", "testimonials", "cta", "footer"],
    tone: "confiante e masculino, direto ao ponto",
    keywords: ["barbearia copacabana", "corte de cabelo rj", "barbearia masculina"],
    niche: "Barbearia",
    colorScheme: {
      primary: "#1a1a1a",
      secondary: "#d4af37"
    }
  }
}
```

---

## Agente Copywriter

**Arquivo:** `agents/copywriter.ts`  
**Responsabilidade:** Escrever todo o conteúdo textual do site.

### O que faz

1. Importa instruções das skills de **SEO** e **Conversão**
2. Monta um prompt rico com regras de copywriting
3. Chama GPT-4o-mini pedindo um JSON com todo o texto do site
4. Faz strip de markdown fences (` ```json ... ``` `) antes de parsear

### Injeção de Skills no Prompt

```typescript
const seoInstructions = buildSeoPromptInstructions(input)
const conversionInstructions = buildConversionPromptInstructions(input)
const keywords = buildSeoKeywords(input)

// Ambos são strings multi-linha injetadas no prompt:
`
${seoInstructions}

${conversionInstructions}

Palavras-chave obrigatórias: ${keywords.join(', ')}
`
```

### Parâmetros da chamada

```typescript
model: 'gpt-4o-mini'
temperature: 0.7    // mais criatividade — queremos texto persuasivo variado
max_tokens: 1200
```

### Exemplo de Output

```typescript
{
  success: true,
  data: {
    title: "Barbearia do João — Copacabana, Rio de Janeiro",
    tagline: "Onde seu estilo encontra a precisão",
    description: "A melhor barbearia de Copacabana...",
    hero: {
      headline: "Cortes que definem seu estilo em Copacabana",
      subheadline: "Barbearia profissional com 10 anos de experiência no coração do Rio",
      cta: "Agendar pelo WhatsApp"
    },
    about: {
      title: "Sobre a Barbearia do João",
      text: "Fundada em 2014, somos referência em..."
    },
    services: [
      { name: "Corte Masculino", description: "Corte preciso com navalha...", icon: "✂️" },
      { name: "Barba Completa", description: "Modelagem e hidratação...", icon: "🪒" },
      { name: "Combo Corte + Barba", description: "O pacote completo...", icon: "⭐" }
    ],
    contact: {
      whatsapp: "21999999999",
      whatsappText: "Olá! Quero agendar um horário na Barbearia do João"
    },
    seoMeta: {
      metaTitle: "Barbearia do João — Melhor Barbearia em Copacabana | RJ",
      metaDescription: "Barbearia profissional em Copacabana. Cortes masculinos, barba e combos. Atendimento pelo WhatsApp. Agende agora!"
    }
  }
}
```

---

## Agente UI

**Arquivo:** `agents/ui.ts`  
**Responsabilidade:** Definir o design visual do site — cores, fontes, estilo.

### O que faz

1. Faz lookup no `styleMap` usando o nicho do `SitePlan`
2. Se o `SitePlan` contiver `colorScheme.primary`, **sobrescreve** as cores do styleMap com as cores escolhidas pela IA

> Este agente é **100% determinístico** — sem chamadas de IA, sem I/O.

### StyleMap por Nicho

```typescript
const styleMap = {
  'Barbearia': {
    primaryColor: '#1a1a1a',
    secondaryColor: '#d4af37',  // dourado
    accentColor: '#f5f5f5',
    fontFamily: 'Inter',
    style: 'premium'
  },
  'Hamburgueria': {
    primaryColor: '#d32f2f',    // vermelho
    secondaryColor: '#ff8f00',  // laranja
    accentColor: '#fafafa',
    fontFamily: 'Inter',
    style: 'bold'
  },
  'Pizzaria': {
    primaryColor: '#bf360c',
    secondaryColor: '#e65100',
    accentColor: '#fff8e1',
    fontFamily: 'Inter',
    style: 'bold'
  },
  'Salão de Beleza': {
    primaryColor: '#ad1457',    // rosa
    secondaryColor: '#f48fb1',
    accentColor: '#fce4ec',
    fontFamily: 'Inter',
    style: 'modern'
  },
  // ...outros nichos
  'default': {
    primaryColor: '#2563eb',    // azul
    secondaryColor: '#1d4ed8',
    accentColor: '#f0f9ff',
    fontFamily: 'Inter',
    style: 'modern'
  }
}
```

### Exemplo de Output

```typescript
{
  success: true,
  data: {
    primaryColor: '#1a1a1a',
    secondaryColor: '#d4af37',
    accentColor: '#f5f5f5',
    fontFamily: 'Inter',
    style: 'premium',
    layout: 'single-page'
  }
}
```

---

## Agente Code

**Arquivo:** `agents/code.ts`  
**Responsabilidade:** Gerar o HTML completo e autocontido do site.

### O que faz

Recebe `SiteContent`, `SiteDesign`, `whatsappNumber` e `slug` e retorna uma string HTML com:

- CSS inline usando variáveis customizadas (`--primary`, `--secondary`, `--accent`)
- Layout responsivo com seções: header sticky, hero, serviços, sobre, CTA, footer
- WhatsApp button fixo no canto inferior direito (floating)
- Todos os meta tags de SEO (Open Graph incluso)
- Google Fonts via `<link>`
- Schema.org `LocalBusiness` JSON-LD (gerado pela skill de SEO)

> Este agente é **100% determinístico** — sem chamadas de IA, sem I/O.

### Estrutura do HTML Gerado

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <!-- Meta SEO -->
  <title>{seoMeta.metaTitle}</title>
  <meta name="description" content="{seoMeta.metaDescription}">
  <meta property="og:title" content="...">
  
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400...">
  
  <!-- CSS inline com variáveis de design -->
  <style>
    :root {
      --primary: {primaryColor};
      --secondary: {secondaryColor};
      --accent: {accentColor};
      --font: '{fontFamily}', sans-serif;
    }
    /* ~200 linhas de CSS responsivo */
  </style>
</head>
<body>
  <!-- Header sticky -->
  <header>...</header>
  
  <!-- Hero com CTA WhatsApp -->
  <section id="hero">
    <h1>{hero.headline}</h1>
    <a href="{whatsappLink}">Agendar pelo WhatsApp</a>
  </section>
  
  <!-- Grid de serviços -->
  <section id="services">
    {services.map(s => <div class="service-card">...</div>)}
  </section>
  
  <!-- Sobre -->
  <section id="about">...</section>
  
  <!-- CTA final -->
  <section id="cta">...</section>
  
  <!-- Footer -->
  <footer>...</footer>
  
  <!-- Botão WhatsApp flutuante -->
  <a class="whatsapp-float" href="{whatsappLink}">
    <svg><!-- ícone WhatsApp --></svg>
  </a>
</body>
</html>
```

---

## Agente Deploy

**Arquivo:** `agents/deploy.ts`  
**Responsabilidade:** Publicar o HTML gerado e retornar a URL pública.

Ver [deploy.md](./deploy.md) para documentação completa.

---

## Tipos de Retorno

```typescript
// Input universal de negócio
type BusinessInput = {
  business: string      // "Barbearia do João"
  city: string          // "Rio de Janeiro"
  neighborhood?: string // "Copacabana"
  whatsapp?: string     // "21999999999"
  clientName?: string   // "João"
}

// Output do Planner
type SitePlan = {
  pages: string[]
  sections: string[]
  tone: string
  keywords: string[]
  niche: string
  colorScheme?: { primary: string; secondary: string }
}

// Output do Copywriter
type SiteContent = {
  title: string
  tagline: string
  description: string
  hero: { headline: string; subheadline: string; cta: string }
  about: { title: string; text: string }
  services: Service[]
  contact: { whatsapp: string; whatsappText: string }
  seoMeta: { metaTitle: string; metaDescription: string }
}

// Output do UI Agent
type SiteDesign = {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  style: 'modern' | 'premium' | 'minimal' | 'bold'
  layout?: string
}
```
