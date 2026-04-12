// Agent: Planner
// Transforma o input do negócio em um plano estruturado de site

import OpenAI from 'openai'
import type { BusinessInput, SitePlan, AgentResult } from '@/types'

// apiKey falls back to a placeholder so the constructor doesn't throw during
// Next.js build-time module evaluation when the env var is not set.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? 'build-placeholder' })

const NICHE_MAP: Record<string, string> = {
  hamburgueria: 'Hamburgueria',
  hamburguer: 'Hamburgueria',
  burger: 'Hamburgueria',
  barbearia: 'Barbearia',
  barber: 'Barbearia',
  cabelo: 'Salão de Beleza',
  salao: 'Salão de Beleza',
  salon: 'Salão de Beleza',
  beleza: 'Salão de Beleza',
  estetica: 'Estética',
  pizzaria: 'Pizzaria',
  pizza: 'Pizzaria',
  restaurante: 'Restaurante',
  mecanica: 'Mecânica',
  mecanico: 'Mecânica',
  advogado: 'Advocacia',
  advocacia: 'Advocacia',
  juridico: 'Advocacia',
  dentista: 'Odontologia',
  odonto: 'Odontologia',
  clinica: 'Clínica',
  academia: 'Academia',
  fitness: 'Academia',
  igreja: 'Igreja',
  delivery: 'Delivery',
  loja: 'Loja',
}

export function detectNiche(businessInput: string): string {
  const lower = businessInput.toLowerCase()
  for (const [key, value] of Object.entries(NICHE_MAP)) {
    if (lower.includes(key)) return value
  }
  return 'Negócio Local'
}

const nicheSections: Record<string, string[]> = {
  Barbearia: ['hero', 'servicos', 'galeria', 'horarios', 'cta', 'localizacao'],
  Hamburgueria: ['hero', 'cardapio', 'diferenciais', 'sobre', 'cta', 'localizacao'],
  Pizzaria: ['hero', 'cardapio', 'diferenciais', 'sobre', 'cta', 'localizacao'],
  Restaurante: ['hero', 'menu', 'sobre', 'diferenciais', 'cta', 'localizacao'],
  'Salão de Beleza': ['hero', 'servicos', 'galeria', 'sobre', 'cta', 'contato'],
  Estética: ['hero', 'procedimentos', 'resultados', 'sobre', 'cta', 'contato'],
  Mecânica: ['hero', 'servicos', 'diferenciais', 'sobre', 'orcamento', 'localizacao'],
  Advocacia: ['hero', 'areas', 'sobre', 'diferenciais', 'contato'],
  default: ['hero', 'servicos', 'sobre', 'diferenciais', 'cta', 'contato'],
}

const nicheColors: Record<string, { primary: string; secondary: string; style: string }> = {
  Barbearia: { primary: '#1a1a2e', secondary: '#e94560', style: 'premium' },
  Hamburgueria: { primary: '#b5451b', secondary: '#f5a623', style: 'bold' },
  Pizzaria: { primary: '#c0392b', secondary: '#f39c12', style: 'bold' },
  Restaurante: { primary: '#2c3e50', secondary: '#e67e22', style: 'modern' },
  'Salão de Beleza': { primary: '#8e44ad', secondary: '#f1a1d0', style: 'premium' },
  Estética: { primary: '#c0a0d0', secondary: '#f7d6e0', style: 'premium' },
  Mecânica: { primary: '#2c3e50', secondary: '#e74c3c', style: 'modern' },
  Advocacia: { primary: '#1a1a2e', secondary: '#c9a84c', style: 'premium' },
  default: { primary: '#16a34a', secondary: '#22c55e', style: 'modern' },
}

export async function plannerAgent(input: BusinessInput): Promise<AgentResult<SitePlan>> {
  try {
    const niche = detectNiche(input.business)
    const location = input.neighborhood
      ? `${input.neighborhood}, ${input.city}`
      : input.city

    const prompt = `
Você é um especialista em estrutura de sites para pequenos negócios locais no Brasil.

Analise o seguinte negócio e retorne um JSON com o plano do site:

Negócio: ${input.business}
Nicho detectado: ${niche}
Localização: ${location}

Retorne APENAS um JSON válido no seguinte formato:
{
  "pages": ["home", "sobre"],
  "sections": ["hero", "servicos", "sobre", "cta"],
  "tone": "descontraído e profissional",
  "keywords": ["barbearia em ${location}", "corte de cabelo ${location}"],
  "niche": "${niche}",
  "colorScheme": {
    "primary": "#hexcolor",
    "secondary": "#hexcolor",
    "style": "modern"
  }
}

Gere keywords hiperlocais e relevantes para ranquear no Google.
Retorne SOMENTE o JSON, sem texto adicional.
`.trim()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 600,
    })

    const raw = completion.choices[0].message.content?.trim() ?? '{}'
    const jsonStr = raw.replace(/```json|```/g, '').trim()
    const plan = JSON.parse(jsonStr) as SitePlan

    // Enriquece com dados locais se não vieram da IA
    if (!plan.colorScheme || !plan.colorScheme.primary) {
      plan.colorScheme = nicheColors[niche] ?? nicheColors.default
    }
    if (!plan.sections?.length) {
      plan.sections = nicheSections[niche] ?? nicheSections.default
    }
    plan.niche = niche

    return { success: true, data: plan }
  } catch (error) {
    console.error('[PlannerAgent] Error:', error)
    return { success: false, error: String(error) }
  }
}
