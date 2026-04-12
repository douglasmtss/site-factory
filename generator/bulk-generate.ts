// generator/bulk-generate.ts
// Geração em massa de sites a partir de um JSON
// Uso: npm run bulk
// Ou: npx tsx generator/bulk-generate.ts ./leads.json

import 'dotenv/config'
import fs from 'fs-extra'
import path from 'path'
import { createSite } from '@/lib/orchestrator'
import type { BulkGenerateItem } from '@/types'

// Lista padrão de leads (nichos lucrativas × cidades do RJ)
// Substitua por seu próprio JSON ou passe como argumento
const DEFAULT_LEADS: BulkGenerateItem[] = [
  { business: 'Barbearia Santos', city: 'Rio de Janeiro', neighborhood: 'Copacabana' },
  { business: 'Barbearia Vintage', city: 'Rio de Janeiro', neighborhood: 'Zona Norte' },
  { business: 'Hamburgueria do Bairro', city: 'Rio de Janeiro', neighborhood: 'Bonsucesso' },
  { business: 'Pizzaria Napolitana', city: 'Niterói', neighborhood: 'Centro' },
  { business: 'Salão Bella Moça', city: 'Duque de Caxias' },
  { business: 'Mecânica Express', city: 'Nova Iguaçu' },
  { business: 'Barbearia Premium', city: 'São Gonçalo', neighborhood: 'Centro' },
  { business: 'Hamburgueria Artesanal', city: 'Petrópolis' },
]

interface BulkResult {
  business: string
  city: string
  success: boolean
  url?: string
  slug?: string
  error?: string
}

async function bulkGenerate(leads: BulkGenerateItem[]): Promise<void> {
  console.log(`\n🏭 Site Factory AI — Geração em massa`)
  console.log(`📊 Total de sites a gerar: ${leads.length}\n`)

  const results: BulkResult[] = []
  const DELAY_MS = 3000 // 3s entre cada site para não sobrecarregar a API

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i]
    const label = `${lead.business} — ${lead.neighborhood ? `${lead.neighborhood}, ` : ''}${lead.city}`

    console.log(`[${i + 1}/${leads.length}] Gerando: ${label}`)

    const result = await createSite({
      business: lead.business,
      city: lead.city,
      neighborhood: lead.neighborhood,
      whatsapp: lead.whatsapp,
    })

    if (result.success) {
      console.log(`  ✅ ${result.url}`)
      results.push({
        business: lead.business,
        city: lead.city,
        success: true,
        url: result.url,
        slug: result.site?.slug,
      })
    } else {
      console.error(`  ❌ Erro: ${result.error}`)
      results.push({
        business: lead.business,
        city: lead.city,
        success: false,
        error: result.error,
      })
    }

    // Delay entre gerações
    if (i < leads.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  // Salva relatório
  const reportPath = path.join(process.cwd(), 'generated-sites', 'report.json')
  await fs.ensureDir(path.join(process.cwd(), 'generated-sites'))
  await fs.writeJSON(reportPath, { generatedAt: new Date(), results }, { spaces: 2 })

  const succeeded = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  console.log(`\n📊 Resultado final:`)
  console.log(`  ✅ Sucesso: ${succeeded}`)
  console.log(`  ❌ Falhas: ${failed}`)
  console.log(`  📄 Relatório: ${reportPath}\n`)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  let leads = DEFAULT_LEADS

  // Lê JSON externo se passado como argumento
  const jsonArg = process.argv[2]
  if (jsonArg) {
    const jsonPath = path.resolve(jsonArg)
    if (await fs.pathExists(jsonPath)) {
      leads = await fs.readJSON(jsonPath) as BulkGenerateItem[]
      console.log(`📄 Carregado: ${jsonPath} (${leads.length} leads)`)
    } else {
      console.error(`❌ Arquivo não encontrado: ${jsonPath}`)
      process.exit(1)
    }
  }

  await bulkGenerate(leads)
}

main().catch(console.error)
