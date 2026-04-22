# Skills

Skills são módulos utilitários **puros** — sem estado, sem chamadas externas, sem efeitos colaterais. Eles encapsulam conhecimento de negócio e são injetados nos agentes.

```
agents/        ←── usam skills como dependência
  copywriter.ts
    ├── buildSeoPromptInstructions()    (skills/seo.ts)
    ├── buildConversionPromptInstructions() (skills/conversion.ts)
    └── buildSeoKeywords()              (skills/seo.ts)

agents/code.ts ←── usa diretamente
  └── buildWhatsAppLink()              (skills/whatsapp.ts)
```

---

## Skill de SEO — `skills/seo.ts`

### `buildSeoKeywords(input: BusinessInput): string[]`

Gera um array de palavras-chave para SEO local.

**Lógica:**
```typescript
[
  `${niche} em ${city}`,
  `${niche} ${city}`,
  `melhor ${niche} em ${city}`,
  `${niche} perto de mim`,
  // Se neighborhood estiver presente:
  `${niche} ${neighborhood}`,
  `${niche} em ${neighborhood}`,
  // Variantes de serviço por nicho
  `corte de cabelo ${city}`,     // para barbearia
  `delivery de pizza ${city}`,   // para pizzaria
  // ...etc
]
```

**Exemplo:**
```typescript
buildSeoKeywords({
  business: "Barbearia do João",
  city: "Rio de Janeiro",
  neighborhood: "Copacabana"
})
// → [
//   "Barbearia em Rio de Janeiro",
//   "Barbearia Rio de Janeiro",
//   "melhor Barbearia em Rio de Janeiro",
//   "Barbearia perto de mim",
//   "Barbearia Copacabana",
//   "Barbearia em Copacabana",
//   "corte de cabelo Rio de Janeiro",
//   "barbearia masculina Rio de Janeiro"
// ]
```

---

### `buildSeoMeta(input: BusinessInput): SeoOutput`

Gera um objeto completo com metadados SEO prontos para uso.

**Retorno:**
```typescript
{
  metaTitle: "Barbearia do João — Melhor Barbearia em Copacabana | RJ",
  metaDescription: "Barbearia profissional em Copacabana, Rio de Janeiro. Cortes masculinos e barba. Atendimento pelo WhatsApp. Agende agora!",
  h1: "Barbearia do João em Copacabana",
  keywords: ["barbearia copacabana", "..."],
  localKeywords: ["barbearia perto de mim", "..."],
  structuredData: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Barbearia do João",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Rio de Janeiro",
      "addressRegion": "RJ",
      "addressCountry": "BR"
    }
  }
}
```

---

### `buildSeoPromptInstructions(input: BusinessInput): string`

Gera uma string de instruções mandatórias para ser injetada no prompt do Copywriter.

**Exemplo de saída:**
```
REGRAS DE SEO OBRIGATÓRIAS:
- Mencione "Barbearia" e "Rio de Janeiro" pelo menos 2 vezes em posições de destaque
- O título da página deve conter a cidade: "Rio de Janeiro"
- Inclua CTA claro para WhatsApp em pelo menos 2 seções
- Meta description deve ter entre 150-160 caracteres
- Use linguagem local e referências ao bairro Copacabana
```

---

## Skill de Conversão — `skills/conversion.ts`

### `getConversionCopy(niche: string): ConversionCopy`

Retorna a configuração de copywriting persuasivo para o nicho.

**Estrutura:**
```typescript
type ConversionCopy = {
  painPoint: string       // problema do cliente
  solution: string        // como o negócio resolve
  socialProof: string     // prova social
  urgencyCta: string      // CTA com urgência
  heroCta: string         // texto do botão principal
  objectionHandler: string // resposta à principal objeção
}
```

**Configurações por nicho:**

| Nicho | painPoint | heroCta |
|---|---|---|
| barbearia | "Cansado de barbearias que não respeitam seu tempo?" | "Agendar Meu Horário Agora" |
| restaurante | "Sem tempo para cozinhar e sem saber onde comer bem?" | "Ver Cardápio e Pedir Agora" |
| estetica | "Merece se cuidar mas não encontra um lugar de confiança?" | "Agendar Minha Avaliação" |
| mecanica | "Seu carro na mão de quem você não conhece?" | "Solicitar Orçamento Agora" |
| default | "Precisa de um serviço de qualidade mas não sabe onde encontrar?" | "Falar com a Gente Agora" |

---

### `buildConversionPromptInstructions(input: BusinessInput): string`

Gera uma string de regras de copywriting a ser injetada no prompt do Copywriter.

**Exemplo de saída:**
```
REGRAS DE COPYWRITING PARA CONVERSÃO:
- Comece o hero com o pain point: "Cansado de barbearias que não respeitam seu tempo?"
- Apresente a solução clara no subheadline
- Use prova social: mencione anos de experiência ou número de clientes
- Inclua urgência no CTA: "Agende Agora — Vagas Limitadas"
- Botão WhatsApp deve estar em destaque no hero E na seção CTA
- Use linguagem direta e masculina (para barbearia)
- Quebre objeções: "Sem taxa de agendamento, cancele quando quiser"
```

---

### `buildUrgencyBlock(niche: string): string`

Retorna apenas o texto de urgência do nicho. Usado em seções de CTA específicas.

```typescript
buildUrgencyBlock("barbearia")
// → "Reserve seu horário hoje — agenda lotando para o fim de semana!"

buildUrgencyBlock("restaurante")
// → "Peça agora e receba em até 40 minutos!"
```

---

## Skill de WhatsApp — `skills/whatsapp.ts`

### `buildWhatsAppLink(input: BusinessInput): string`

Gera o link `wa.me` com mensagem pré-preenchida contextualizada ao nicho.

**Lógica de contexto:**

| Nicho detectado | Mensagem |
|---|---|
| barbearia, salão | `"Olá! Quero agendar um horário em {business}"` |
| hamburgueria, pizzaria, restaurante | `"Olá! Quero fazer um pedido em {business}"` |
| mecânica | `"Olá! Preciso de um orçamento em {business}"` |
| default | `"Olá! Quero saber mais sobre {business}"` |

**Sanitização do número:**
```typescript
// Remove tudo que não é dígito
const clean = number.replace(/\D/g, '')

// Adiciona DDI 55 se não estiver presente
const formatted = clean.startsWith('55') ? clean : `55${clean}`

// Resultado: "5521999999999"
```

**Exemplo:**
```typescript
buildWhatsAppLink({
  business: "Barbearia do João",
  city: "Rio de Janeiro",
  whatsapp: "(21) 9 9999-9999"
})
// → "https://wa.me/5521999999999?text=Ol%C3%A1%21%20Quero%20agendar%20um%20hor%C3%A1rio%20em%20Barbearia%20do%20Jo%C3%A3o"
```

---

### `buildWhatsAppButton(input, label?)`

Retorna um objeto pronto para renderizar um botão.

```typescript
buildWhatsAppButton({ business: "Barbearia do João", whatsapp: "21999999999" }, "Agendar Agora")
// → {
//   href: "https://wa.me/5521999999999?text=...",
//   label: "Agendar Agora",
//   ariaLabel: "Abrir conversa no WhatsApp com Barbearia do João"
// }
```

---

### `buildCtaSection(input)`

Retorna um objeto completo para renderizar uma seção de CTA.

```typescript
buildCtaSection({ business: "Pizzaria Bella Napoli", city: "Niterói", whatsapp: "21977776666" })
// → {
//   headline: "Pronto para pedir sua pizza?",
//   subheadline: "Atendemos pelo WhatsApp — rápido, fácil e sem complicação",
//   buttonLabel: "Fazer Pedido Agora",
//   link: "https://wa.me/5521977776666?text=..."
// }
```

---

### `buildFloatingWhatsApp(number: string)`

Retorna os dados para o botão flutuante fixo no canto da tela.

```typescript
buildFloatingWhatsApp("21999999999")
// → {
//   number: "5521999999999",
//   link: "https://wa.me/5521999999999"
// }
```

---

## Por que Skills e não lógica nos Agentes?

| Responsabilidade | Localização correta |
|---|---|
| O que dizer sobre SEO | `skills/seo.ts` |
| Como convencer o cliente | `skills/conversion.ts` |
| Como formatar o link WhatsApp | `skills/whatsapp.ts` |
| Chamar a API da OpenAI | `agents/*.ts` |
| Sequenciar os agentes | `lib/orchestrator.ts` |

Separar as skills permite:
- **Testar** as regras de negócio sem mockar a IA
- **Reusar** em múltiplos agentes (SEO é usado no Copywriter e no Code)
- **Evoluir** as regras sem tocar nos agentes
