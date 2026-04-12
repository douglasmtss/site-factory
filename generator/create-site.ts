// generator/create-site.ts
// Script standalone para criar um site pela linha de comando
// Uso: npx tsx generator/create-site.ts "Barbearia do João" "Rio de Janeiro" "Copacabana" "21999999999"

import 'dotenv/config'
import { createSite } from '@/lib/orchestrator'

async function main() {
  const [, , business, city, neighborhood, whatsapp] = process.argv

  if (!business || !city) {
    console.log(`
Uso: npx tsx generator/create-site.ts <negocio> <cidade> [bairro] [whatsapp]

Exemplos:
  npx tsx generator/create-site.ts "Barbearia do João" "Rio de Janeiro"
  npx tsx generator/create-site.ts "Pizzaria Bella" "Niterói" "Centro" "21999999999"
    `.trim())
    process.exit(1)
  }

  console.log(`\n🏭 Site Factory AI — Gerando site...\n`)
  console.log(`📌 Negócio: ${business}`)
  console.log(`📍 Cidade: ${city}${neighborhood ? `, ${neighborhood}` : ''}`)
  if (whatsapp) console.log(`📲 WhatsApp: ${whatsapp}`)
  console.log()

  const result = await createSite({
    business,
    city,
    neighborhood,
    whatsapp,
  })

  if (result.success) {
    console.log(`\n✅ Site criado com sucesso!\n`)
    console.log(`🌐 URL: ${result.url}`)
    console.log(`🔑 Slug: ${result.site?.slug}`)
  } else {
    console.error(`\n❌ Erro ao criar site: ${result.error}`)
    process.exit(1)
  }
}

main().catch(console.error)
