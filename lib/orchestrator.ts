// Orchestrator: createSite
// O coração da fábrica — orquestra todos os agents em sequência

import slugify from 'slugify'
import type { BusinessInput, GeneratedSite } from '@/types'
import { plannerAgent, detectNiche } from '@/agents/planner'
import { copywriterAgent } from '@/agents/copywriter'
import { uiAgent } from '@/agents/ui'
import { codeAgent } from '@/agents/code'
import { deployAgent } from '@/agents/deploy'
import { buildWhatsAppLink } from '@/skills/whatsapp'
import { connectMongo } from '@/lib/mongodb'
import { Site } from '@/models/Site'

function generateSlug(business: string, city: string): string {
  const base = `${business}-${city}`
  const raw = slugify(base, { lower: true, strict: true, locale: 'pt' })
  const timestamp = Date.now().toString(36)
  return `${raw}-${timestamp}`
}

export interface CreateSiteResult {
  success: boolean
  site?: GeneratedSite & { id: string }
  url?: string
  error?: string
}

export async function createSite(input: BusinessInput): Promise<CreateSiteResult> {
  console.log(`[Orchestrator] Iniciando geração: ${input.business} — ${input.city}`)

  try {
    // ① Planner Agent
    console.log('[Orchestrator] → Planner Agent...')
    const planResult = await plannerAgent(input)
    if (!planResult.success || !planResult.data) {
      return { success: false, error: `PlannerAgent: ${planResult.error}` }
    }
    const plan = planResult.data

    // ② Copywriter Agent
    console.log('[Orchestrator] → Copywriter Agent...')
    const copyResult = await copywriterAgent(input, plan)
    if (!copyResult.success || !copyResult.data) {
      return { success: false, error: `CopywriterAgent: ${copyResult.error}` }
    }
    const content = copyResult.data

    // ③ UI Agent
    console.log('[Orchestrator] → UI Agent...')
    const uiResult = uiAgent(plan)
    if (!uiResult.success || !uiResult.data) {
      return { success: false, error: `UIAgent: ${uiResult.error}` }
    }
    const design = uiResult.data

    // ④ WhatsApp Link
    const whatsappNumber = input.whatsapp ?? process.env.WHATSAPP_NUMBER ?? '5521999999999'
    const whatsappLink = buildWhatsAppLink({
      number: whatsappNumber,
      businessName: input.business,
      niche: plan.niche,
      context: 'contato',
    })

    // ⑤ Slug
    const slug = generateSlug(input.business, input.city)

    // ⑥ Code Agent
    console.log('[Orchestrator] → Code Agent...')
    const codeResult = codeAgent(content, design, whatsappNumber, slug)
    if (!codeResult.success || !codeResult.data) {
      return { success: false, error: `CodeAgent: ${codeResult.error}` }
    }
    const { html } = codeResult.data

    // ⑦ Deploy Agent
    console.log('[Orchestrator] → Deploy Agent...')
    const deployResult = await deployAgent(html, slug)
    const deployUrl = deployResult.data?.url

    // ⑧ Persist no MongoDB
    console.log('[Orchestrator] → Salvando no MongoDB...')
    await connectMongo()

    const siteData: Omit<GeneratedSite, 'createdAt'> = {
      slug,
      businessName: input.business,
      city: input.city,
      neighborhood: input.neighborhood,
      niche: detectNiche(input.business),
      plan,
      content,
      design,
      whatsappLink,
      deployUrl,
      clientWhatsapp: input.whatsapp,
      status: deployResult.success ? 'published' : 'draft',
      monthlyPlan: false,
    }

    const savedSite = await Site.create(siteData)

    console.log(`[Orchestrator] ✅ Site criado: ${deployUrl ?? slug}`)

    return {
      success: true,
      site: { ...siteData, id: String(savedSite._id), createdAt: savedSite.createdAt as Date },
      url: deployUrl ?? `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/s/${slug}`,
    }
  } catch (error) {
    console.error('[Orchestrator] ❌ Error:', error)
    return { success: false, error: String(error) }
  }
}
