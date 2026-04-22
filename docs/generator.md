# Scripts de Geração (CLI)

A pasta `generator/` contém dois scripts CLI para gerar sites sem passar pela API HTTP.

---

## `create-site.ts` — Geração Individual

**Arquivo:** `generator/create-site.ts`

Gera um único site a partir de argumentos da linha de comando.

### Uso

```bash
npx tsx generator/create-site.ts \
  "Nome do Negócio" \
  "Cidade" \
  "Bairro (opcional)" \
  "WhatsApp (opcional)"
```

### Exemplos

```bash
# Mínimo — apenas nome e cidade
npx tsx generator/create-site.ts "Barbearia do João" "Rio de Janeiro"

# Completo — com bairro e WhatsApp
npx tsx generator/create-site.ts "Pizzaria Bella Napoli" "Niterói" "Icaraí" "21977776666"

# Com aspas por causa de espaços no nome
npx tsx generator/create-site.ts "Salão de Beleza da Maria" "São Paulo" "Pinheiros"
```

### Saída — Sucesso

```
✅ Site criado com sucesso!
🌐 URL: https://sitefactory.com.br/s/pizzaria-bella-napoli-niteroi-m3p8q
📌 Slug: pizzaria-bella-napoli-niteroi-m3p8q
```

### Saída — Erro

```
❌ Erro ao criar site: Copywriter: Failed to parse AI response
```
Sai com código 1 (`process.exit(1)`).

### Código Simplificado

```typescript
const [,, business, city, neighborhood, whatsapp] = process.argv

if (!business || !city) {
  console.error('Uso: npx tsx generator/create-site.ts "Nome" "Cidade" [bairro] [whatsapp]')
  process.exit(1)
}

const result = await createSite({ business, city, neighborhood, whatsapp })

if (result.success) {
  console.log('✅ Site criado:', result.url)
} else {
  console.error('❌ Erro:', result.error)
  process.exit(1)
}
```

---

## `bulk-generate.ts` — Geração em Lote

**Arquivo:** `generator/bulk-generate.ts`  
**Script npm:** `npm run bulk`

Gera múltiplos sites a partir de uma lista de negócios, com delay entre cada geração para respeitar os rate limits da OpenAI.

### Uso

```bash
# Usar a lista padrão (8 negócios do RJ hardcoded)
npm run bulk

# Usar um arquivo JSON externo
npx tsx generator/bulk-generate.ts ./minha-lista.json
```

### Formato do JSON de Entrada

```json
[
  {
    "business": "Barbearia do João",
    "city": "Rio de Janeiro",
    "neighborhood": "Copacabana",
    "whatsapp": "21999999999"
  },
  {
    "business": "Hamburgueria do Zé",
    "city": "Niterói",
    "neighborhood": "Icaraí",
    "whatsapp": "21988887777"
  }
]
```

Tipo TypeScript correspondente:
```typescript
type BulkGenerateItem = {
  business: string
  city: string
  neighborhood?: string
  whatsapp?: string
}
```

### Lista Padrão (`DEFAULT_LEADS`)

O script inclui 8 negócios de demonstração no Rio de Janeiro:

| Negócio | Cidade | Bairro |
|---|---|---|
| Barbearia do Carlos | Rio de Janeiro | Leblon |
| Pizzaria Carioca | Rio de Janeiro | Ipanema |
| Hamburgueria Top | Niterói | Centro |
| Salão da Ana | Rio de Janeiro | Botafogo |
| Mecânica do Pedro | São Gonçalo | Alcântara |
| Estética Corporal | Rio de Janeiro | Barra da Tijuca |
| Restaurante Caseiro | Rio de Janeiro | Santa Teresa |
| Advocacia Souza | Rio de Janeiro | Centro |

### Delay entre Gerações

O script aguarda **3 segundos** entre cada site para evitar erros de rate limit da OpenAI:

```typescript
for (const lead of leads) {
  const result = await createSite(lead)
  // ... registra resultado

  if (index < leads.length - 1) {
    await new Promise(resolve => setTimeout(resolve, 3000))
  }
}
```

### Saída no Terminal

```
🏭 Site Factory — Geração em Lote
📋 Total de negócios: 8
──────────────────────────────────────
[1/8] Gerando: Barbearia do Carlos — Rio de Janeiro
  ✅ https://sitefactory.com.br/s/barbearia-do-carlos-rio-de-janeiro-k2x9f

[2/8] Gerando: Pizzaria Carioca — Rio de Janeiro
  ✅ https://sitefactory.com.br/s/pizzaria-carioca-rio-de-janeiro-n8p4q

[3/8] Gerando: Hamburgueria Top — Niterói
  ❌ Erro: Copywriter: Rate limit exceeded

──────────────────────────────────────
📊 Resultado Final:
  ✅ Sucesso: 7
  ❌ Falhas: 1
```

### Relatório JSON

Após a execução, o script salva um relatório completo em `generated-sites/report.json`:

```json
{
  "generatedAt": "2026-04-22T14:30:00.000Z",
  "total": 8,
  "success": 7,
  "failed": 1,
  "results": [
    {
      "business": "Barbearia do Carlos",
      "city": "Rio de Janeiro",
      "success": true,
      "url": "https://sitefactory.com.br/s/barbearia-do-carlos-...",
      "slug": "barbearia-do-carlos-rio-de-janeiro-k2x9f"
    },
    {
      "business": "Hamburgueria Top",
      "city": "Niterói",
      "success": false,
      "error": "Copywriter: Rate limit exceeded"
    }
  ]
}
```

---

## Requisitos de Ambiente

Ambos os scripts precisam das variáveis de ambiente. Use um arquivo `.env` na raiz:

```bash
# Carrega automaticamente pelo dotenv no início do script
OPENAI_API_KEY=sk-...
MONGODB_URI=mongodb://localhost:27017/site-factory
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

O carregamento é feito com:
```typescript
import 'dotenv/config'  // ou require('dotenv').config()
```

---

## Quando Usar Cada Script

| Situação | Script |
|---|---|
| Testar um nicho específico | `create-site.ts` |
| Onboarding de um novo cliente | `create-site.ts` |
| Gerar portfólio de demonstração | `bulk-generate.ts` com `DEFAULT_LEADS` |
| Importar lista de leads de planilha | `bulk-generate.ts` com JSON externo |
| Integração CI/CD ou automação | `create-site.ts` via shell script |

---

## Exemplo de Automação com Shell

```bash
#!/bin/bash
# gerar-leads.sh — processa CSV de leads

while IFS=, read -r business city neighborhood whatsapp; do
  echo "Gerando: $business"
  npx tsx generator/create-site.ts "$business" "$city" "$neighborhood" "$whatsapp"
  sleep 3  # respeita rate limit
done < leads.csv
```
