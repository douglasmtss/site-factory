# Deploy de Sites Gerados

O agente de deploy (`agents/deploy.ts`) é responsável por publicar o HTML gerado e retornar uma URL acessível ao cliente.

---

## Estratégia de Deploy

```
deployAgent(html, slug)
        │
        ├── VERCEL_TOKEN definido?
        │       │
        │       ├── Sim ──► deployVercel(html, slug)
        │       │                   │
        │       │            Sucesso │ Falha
        │       │               ↓      ↓
        │       │           Vercel  deployLocal (fallback)
        │       │               │      │
        │       │               └──────┘
        │       │                   │
        │       └── também chama deployLocal como backup
        │
        └── Não ──► deployLocal(html, slug)
```

---

## Deploy Local

**Função:** `deployLocal(html: string, slug: string): Promise<DeployResult>`

Salva o HTML em disco, acessível pela rota Next.js `/s/[slug]`.

### O que faz

```typescript
const dir = path.join(process.cwd(), 'generated-sites', slug)
await fs.ensureDir(dir)
await fs.writeFile(path.join(dir, 'index.html'), html, 'utf8')

return {
  url: `${process.env.NEXT_PUBLIC_BASE_URL}/s/${slug}`,
  provider: 'local',
  slug
}
```

### Estrutura de Arquivos

```
generated-sites/
  barbearia-do-joao-rio-de-janeiro-k2x9f/
    index.html
  hamburgueria-do-ze-niteroi-m3p8q/
    index.html
  pizzaria-bella-napoli-rj-n7w4r/
    index.html
```

> **Atenção:** A pasta `generated-sites/` deve ser adicionada ao `.gitignore` em produção.

### URL Retornada

```
http://localhost:3000/s/barbearia-do-joao-rio-de-janeiro-k2x9f
```

A rota `/s/[slug]` no Next.js serve o site diretamente do MongoDB (não lê o arquivo local). O arquivo local é um backup físico.

---

## Deploy na Vercel

**Função:** `deployVercel(html: string, slug: string): Promise<DeployResult>`

Faz deploy do site como um projeto estático na Vercel via API.

### Pré-requisitos

```env
VERCEL_TOKEN=your_vercel_token     # obrigatório
VERCEL_TEAM_ID=your_team_id        # opcional — para orgs
```

### Como obter o VERCEL_TOKEN

1. Acesse [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Crie um token com escopo "Full Account"
3. Adicione ao `.env.local`

### O que faz

```typescript
const response = await axios.post(
  'https://api.vercel.com/v13/deployments',
  {
    name: `site-factory-${slug}`,
    files: [
      {
        file: 'index.html',
        data: html,
        encoding: 'utf8'
      }
    ],
    projectSettings: {
      framework: null,
      outputDirectory: '.'
    }
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  }
)

// Também salva localmente como backup
await deployLocal(html, slug)

return {
  url: `https://${response.data.url}`,
  provider: 'vercel',
  slug
}
```

### URL Retornada

```
https://site-factory-barbearia-do-joao-rj-k2x9f.vercel.app
```

### Comportamento em Caso de Falha

Se a chamada à API da Vercel falhar por qualquer motivo (token inválido, rate limit, erro de rede), o agente faz fallback silencioso para `deployLocal`:

```typescript
try {
  return await deployVercel(html, slug)
} catch (err) {
  console.error('Vercel deploy failed, falling back to local:', err)
  return await deployLocal(html, slug)
}
```

---

## Tipo de Retorno

```typescript
type DeployResult = {
  url: string      // URL pública do site
  provider: 'local' | 'vercel'
  slug: string
}
```

---

## Como os Sites São Servidos

Independente do provider de deploy, os sites gerados são sempre acessíveis via a rota dinâmica Next.js:

```
/s/[slug]  ──►  app/s/[slug]/page.tsx
```

Essa rota:
1. Recebe o `slug` da URL
2. Faz `Site.findOne({ slug })` no MongoDB
3. Reconstrói o HTML completo a partir de `content` e `design`
4. Renderiza com `dangerouslySetInnerHTML` e `suppressHydrationWarning`
5. Exporta `generateMetadata()` para SEO server-side

```typescript
// app/s/[slug]/page.tsx (simplificado)
export default async function SitePage({ params }: { params: { slug: string } }) {
  await connectMongo()
  const site = await Site.findOne({ slug: params.slug })
  if (!site) notFound()

  const htmlContent = buildHtml(site.content, site.design, site.whatsappLink)

  return (
    <html dangerouslySetInnerHTML={{ __html: htmlContent }} suppressHydrationWarning />
  )
}
```

---

## Comparação: Local vs Vercel

| Característica | Local | Vercel |
|---|---|---|
| Velocidade de deploy | Imediato | ~5-10 segundos |
| URL permanente | Sim (via `/s/[slug]`) | Sim (subdomínio Vercel) |
| Custo | Zero | Free tier disponível |
| Requer conta externa | Não | Sim |
| Escala horizontal | Não (arquivo local) | Sim (CDN global) |
| Ideal para | Desenvolvimento | Produção |

---

## Recomendação para Produção

Para produção, use `NEXT_PUBLIC_BASE_URL` apontando para o domínio real:

```env
NEXT_PUBLIC_BASE_URL=https://sitefactory.com.br
VERCEL_TOKEN=...  # apenas se quiser deploy em subdomínios separados
```

Com isso, `deployLocal` retorna URLs como:
```
https://sitefactory.com.br/s/barbearia-do-joao-rj-k2x9f
```

E o site é servido pelo próprio Next.js da aplicação — sem precisar da Vercel API para cada site gerado.
