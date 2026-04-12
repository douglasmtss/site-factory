// Agent: Copywriter
// Gera todo o conteúdo do site com foco em conversão e SEO local

import OpenAI from 'openai'
import type { BusinessInput, SitePlan, SiteContent, AgentResult } from '@/types'
import { buildSeoPromptInstructions, buildSeoKeywords } from '@/skills/seo'
import { buildConversionPromptInstructions } from '@/skills/conversion'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function copywriterAgent(
  input: BusinessInput,
  plan: SitePlan
): Promise<AgentResult<SiteContent>> {
  try {
    const location = input.neighborhood
      ? `${input.neighborhood}, ${input.city}`
      : input.city

    const seoInstructions = buildSeoPromptInstructions({
      businessName: input.business,
      niche: plan.niche,
      city: input.city,
      neighborhood: input.neighborhood,
    })

    const conversionInstructions = buildConversionPromptInstructions({
      businessName: input.business,
      niche: plan.niche,
      city: input.city,
      neighborhood: input.neighborhood,
    })

    const keywords = buildSeoKeywords({
      businessName: input.business,
      niche: plan.niche,
      city: input.city,
      neighborhood: input.neighborhood,
    })

    const prompt = `
Você é um copywriter especialista em sites para pequenos negócios locais no Brasil.
Seu objetivo é criar conteúdo persuasivo que converte visitantes em clientes via WhatsApp.

Negócio: ${input.business}
Nicho: ${plan.niche}
Localização: ${location}
Tom: ${plan.tone}

${seoInstructions}

${conversionInstructions}

Retorne APENAS um JSON válido no formato abaixo (sem texto extra, sem markdown):
{
  "title": "Nome do site",
  "tagline": "Slogan curto e impactante",
  "description": "Descrição do negócio (2-3 frases)",
  "hero": {
    "headline": "Título principal poderoso (máx 10 palavras)",
    "subheadline": "Frase de suporte explicando o benefício principal",
    "cta": "Texto do botão de ação"
  },
  "about": {
    "title": "Sobre nós",
    "text": "Texto sobre o negócio (3-4 frases, humanizado)"
  },
  "services": [
    { "name": "Serviço 1", "description": "Descrição curta", "icon": "✂️" },
    { "name": "Serviço 2", "description": "Descrição curta", "icon": "💈" },
    { "name": "Serviço 3", "description": "Descrição curta", "icon": "⭐" }
  ],
  "contact": {
    "cta": "Frase de fechamento motivando contato",
    "whatsappText": "Texto da mensagem pré-preenchida do WhatsApp"
  },
  "seoMeta": {
    "title": "Título SEO da página (máx 60 chars)",
    "description": "Meta description (máx 160 chars)",
    "keywords": ${JSON.stringify(keywords.slice(0, 8))}
  }
}
`.trim()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1200,
    })

    const raw = completion.choices[0].message.content?.trim() ?? '{}'
    const jsonStr = raw.replace(/```json|```/g, '').trim()
    const content = JSON.parse(jsonStr) as SiteContent

    return { success: true, data: content }
  } catch (error) {
    console.error('[CopywriterAgent] Error:', error)
    return { success: false, error: String(error) }
  }
}
