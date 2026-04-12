// Skill: SEO Local
// Gera texto, título e meta tags otimizados para SEO local

export interface SeoInput {
  businessName: string
  niche: string
  city: string
  neighborhood?: string
  services?: string[]
}

export interface SeoOutput {
  metaTitle: string
  metaDescription: string
  h1: string
  keywords: string[]
  localKeywords: string[]
  structuredData: Record<string, unknown>
}

export function buildSeoKeywords(input: SeoInput): string[] {
  const { businessName, niche, city, neighborhood, services = [] } = input

  const base = [
    `${niche} em ${city}`,
    `${niche} ${city}`,
    `melhor ${niche} em ${city}`,
    `${niche} perto de mim`,
  ]

  if (neighborhood) {
    base.push(
      `${niche} em ${neighborhood}`,
      `${niche} ${neighborhood} ${city}`,
      `${niche} ${neighborhood}`
    )
  }

  const serviceKeywords = services.map((s) => `${s} em ${city}`)

  return [...base, ...serviceKeywords, businessName.toLowerCase()]
}

export function buildSeoMeta(input: SeoInput): SeoOutput {
  const { businessName, niche, city, neighborhood } = input
  const localRef = neighborhood ? `${neighborhood}, ${city}` : city
  const keywords = buildSeoKeywords(input)

  return {
    metaTitle: `${businessName} — ${niche} em ${localRef} | Atendimento via WhatsApp`,
    metaDescription: `${businessName} é a melhor opção de ${niche} em ${localRef}. Atendimento rápido, qualidade garantida e agendamento direto pelo WhatsApp. Entre em contato agora!`,
    h1: `${niche} em ${localRef} — ${businessName}`,
    keywords,
    localKeywords: [
      `${niche} em ${city}`,
      ...(neighborhood ? [`${niche} em ${neighborhood}`] : []),
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: businessName,
      description: `${niche} em ${localRef}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: city,
        addressRegion: neighborhood || '',
        addressCountry: 'BR',
      },
    },
  }
}

export function buildSeoPromptInstructions(input: SeoInput): string {
  const { niche, city, neighborhood } = input
  const localRef = neighborhood ? `${neighborhood} — ${city}` : city

  return `
INSTRUÇÕES DE SEO LOCAL (siga obrigatoriamente):
- Mencione "${niche} em ${localRef}" pelo menos 2 vezes
- Inclua o ${neighborhood ? `bairro ${neighborhood} e a ` : ''}cidade ${city} no texto principal
- Use linguagem voltada para conversão local
- Inclua um CTA forte como: "Agende agora pelo WhatsApp" ou "Ligue agora"
- Texto deve soar natural e persuasivo, não artificial
`.trim()
}
