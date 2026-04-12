# 📖 TUTORIAL — Site Factory AI

Guia completo de uso: do zero até gerar sites em massa e vender pelo WhatsApp.

---

## Índice

1. [Instalação e configuração](#1-instalação-e-configuração)
2. [Iniciando o servidor](#2-iniciando-o-servidor)
3. [Criando um site via terminal](#3-criando-um-site-via-terminal)
4. [Criando um site via API](#4-criando-um-site-via-api)
5. [Bot Telegram](#5-bot-telegram)
6. [Geração em massa (bulk)](#6-geração-em-massa-bulk)
7. [Visualizando os sites gerados](#7-visualizando-os-sites-gerados)
8. [Landing page de vendas](#8-landing-page-de-vendas)
9. [Skills — usando direto no código](#9-skills--usando-direto-no-código)
10. [Agents — entendendo e customizando](#10-agents--entendendo-e-customizando)
11. [Deploy do sistema na Vercel](#11-deploy-do-sistema-na-vercel)
12. [Deploy automático dos sites gerados](#12-deploy-automático-dos-sites-gerados)
13. [MongoDB — gerenciando dados](#13-mongodb--gerenciando-dados)
14. [Estratégia de vendas (do GPT)](#14-estratégia-de-vendas-do-gpt)

---

## 1. Instalação e configuração

### Pré-requisitos
- Node.js 20+ (`nvm use 20`)
- MongoDB rodando localmente **ou** conta no [MongoDB Atlas](https://www.mongodb.com/atlas) (gratuito)
- Conta OpenAI com créditos (GPT-4o-mini é baratíssimo)

### Clonar e instalar

```bash
git clone <seu-repo>
cd site-factory

# Usar Node 20
nvm use 20

# Instalar dependências
npm install
```

### Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Abra o `.env` e preencha:

```env
# 1. Chave OpenAI — obrigatória para gerar conteúdo
#    Crie em: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-...

# 2. Token do bot Telegram — para usar o bot
#    Crie um bot em: https://t.me/BotFather  → /newbot
TELEGRAM_BOT_TOKEN=7123456789:AAH...

# 3. Seu WhatsApp (com DDI) — aparece nos sites gerados
WHATSAPP_NUMBER=5521999999999

# 4. MongoDB local (padrão) ou Atlas
MONGODB_URI=mongodb://localhost:27017/site-factory
# MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:senha@cluster.mongodb.net/site-factory

# 5. URL base do sistema
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# 6. Vercel (opcional — para deploy automático dos sites)
#    Token em: https://vercel.com/account/tokens
VERCEL_TOKEN=
VERCEL_TEAM_ID=
```

---

## 2. Iniciando o servidor

```bash
nvm use 20
npm run dev
```

Acesse: **http://localhost:3000**

Você verá a landing page de vendas do Site Factory AI.

---

## 3. Criando um site via terminal

O jeito mais rápido de testar:

```bash
# Formato:
npx tsx generator/create-site.ts "Nome do Negócio" "Cidade" "Bairro (opcional)" "WhatsApp (opcional)"

# Exemplos:
npx tsx generator/create-site.ts "Barbearia do João" "Rio de Janeiro"

npx tsx generator/create-site.ts "Pizzaria Bella Napoli" "Niterói" "Centro" "21988887777"

npx tsx generator/create-site.ts "Hamburgueria Artesanal" "Duque de Caxias" "Centro" "21977776666"

npx tsx generator/create-site.ts "Mecânica do Carlos" "Nova Iguaçu" "" "21966665555"
```

### Output esperado:

```
🏭 Site Factory AI — Gerando site...

📌 Negócio: Barbearia do João
📍 Cidade: Rio de Janeiro
📲 WhatsApp: 5521999999999

[Orchestrator] Iniciando geração: Barbearia do João — Rio de Janeiro
[Orchestrator] → Planner Agent...
[Orchestrator] → Copywriter Agent...
[Orchestrator] → UI Agent...
[Orchestrator] → Code Agent...
[Orchestrator] → Deploy Agent...
[Orchestrator] → Salvando no MongoDB...
[Orchestrator] ✅ Site criado: http://localhost:3000/s/barbearia-do-joao-rio-de-janeiro-abc1

✅ Site criado com sucesso!

🌐 URL: http://localhost:3000/s/barbearia-do-joao-rio-de-janeiro-abc1
🔑 Slug: barbearia-do-joao-rio-de-janeiro-abc1
```

Abra a URL no navegador para ver o site gerado.

---

## 4. Criando um site via API

### Com curl:

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "business": "Salão da Ana",
    "city": "São Paulo",
    "neighborhood": "Moema",
    "whatsapp": "11988887777"
  }'
```

### Com JavaScript/fetch:

```javascript
const response = await fetch('http://localhost:3000/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    business: 'Barbearia Premium',
    city: 'Rio de Janeiro',
    neighborhood: 'Barra da Tijuca',
    whatsapp: '21977776666'
  })
})

const data = await response.json()
console.log(data.url) // http://localhost:3000/s/barbearia-premium-...
```

### Resposta da API:

```json
{
  "success": true,
  "url": "http://localhost:3000/s/salao-da-ana-sao-paulo-xyz9",
  "slug": "salao-da-ana-sao-paulo-xyz9",
  "site": {
    "slug": "salao-da-ana-sao-paulo-xyz9",
    "businessName": "Salão da Ana",
    "city": "São Paulo",
    "neighborhood": "Moema",
    "niche": "Salão de Beleza",
    "status": "published",
    "whatsappLink": "https://wa.me/5511988887777?text=...",
    "createdAt": "2026-04-11T..."
  }
}
```

### Listar todos os sites:

```bash
curl http://localhost:3000/api/sites
```

---

## 5. Bot Telegram

### Configurar o bot

1. Abra o Telegram e procure por **@BotFather**
2. Envie `/newbot`
3. Escolha um nome e username para o bot
4. Copie o token gerado para o `.env`:
   ```
   TELEGRAM_BOT_TOKEN=7123456789:AAH...
   ```

### Iniciar o bot

```bash
npm run telegram
```

Output:
```
🤖 Telegram Bot rodando...
```

### Usando o bot

No Telegram, abra seu bot e:

**Comandos disponíveis:**

| Comando | Ação |
|---|---|
| `/start` | Mensagem de boas-vindas + teclado |
| `/criar` | Inicia o fluxo de criação |
| `/ajuda` | Mostra como funciona |
| `🚀 Criar site` | Atalho de teclado |

**Fluxo de criação:**

```
Você → /criar

Bot → Qual é o nome e tipo do seu negócio?

Você → Barbearia do Pedro

Bot → Agora me diga a cidade (e bairro se quiser):

Você → Rio de Janeiro, Tijuca

Bot → Agora me diga o número do WhatsApp que vai aparecer no site:

Você → 21988887777

Bot → ⏳ Perfeito! Estou criando seu site agora...
      🤖 Agente Planner analisando o negócio...
      ✍️ Agente Copywriter escrevendo conteúdo...
      🎨 Agente UI definindo design...
      💻 Agente Code gerando código...
      🚀 Agente Deploy publicando...

Bot → ✅ Site criado com sucesso! 🎉

      🌐 Link: https://seu-dominio.com/s/barbearia-do-pedro-...

      O site já está online com:
      ✅ Botão WhatsApp integrado
      ✅ SEO local para Rio de Janeiro
      ✅ Design otimizado para converter
```

---

## 6. Geração em massa (bulk)

### Usando a lista padrão

O arquivo [generator/bulk-generate.ts](generator/bulk-generate.ts) já tem uma lista de leads do RJ. Para usar:

```bash
npm run bulk
```

### Usando seu próprio JSON

Crie um arquivo `leads.json`:

```json
[
  {
    "business": "Barbearia Santos",
    "city": "Rio de Janeiro",
    "neighborhood": "Copacabana"
  },
  {
    "business": "Pizzaria Napolitana",
    "city": "Niterói",
    "neighborhood": "Centro",
    "whatsapp": "21977776666"
  },
  {
    "business": "Hamburgueria Artesanal",
    "city": "Duque de Caxias"
  },
  {
    "business": "Salão da Mari",
    "city": "São Gonçalo",
    "neighborhood": "Centro",
    "whatsapp": "21955554444"
  },
  {
    "business": "Mecânica Express",
    "city": "Nova Iguaçu"
  }
]
```

Execute:

```bash
npx tsx generator/bulk-generate.ts ./leads.json
```

### Output esperado:

```
🏭 Site Factory AI — Geração em massa
📊 Total de sites a gerar: 5

[1/5] Gerando: Barbearia Santos — Copacabana, Rio de Janeiro
  ✅ http://localhost:3000/s/barbearia-santos-rio-de-janeiro-abc1

[2/5] Gerando: Pizzaria Napolitana — Centro, Niterói
  ✅ http://localhost:3000/s/pizzaria-napolitana-niteroi-def2

[3/5] Gerando: Hamburgueria Artesanal — Duque de Caxias
  ✅ http://localhost:3000/s/hamburgueria-artesanal-duque-de-caxias-ghi3

[4/5] Gerando: Salão da Mari — Centro, São Gonçalo
  ✅ http://localhost:3000/s/salao-da-mari-sao-goncalo-jkl4

[5/5] Gerando: Mecânica Express — Nova Iguaçu
  ✅ http://localhost:3000/s/mecanica-express-nova-iguacu-mno5

📊 Resultado final:
  ✅ Sucesso: 5
  ❌ Falhas: 0
  📄 Relatório: /home/.../site-factory/generated-sites/report.json
```

O relatório `report.json` contém todos os links gerados para você enviar para os clientes.

---

## 7. Visualizando os sites gerados

### Pelo navegador

Cada site gerado fica acessível em:
```
http://localhost:3000/s/{slug}
```

Exemplo:
```
http://localhost:3000/s/barbearia-do-joao-rio-de-janeiro-abc1
```

### Pelo sistema de arquivos

Também salvo em:
```
generated-sites/
  barbearia-do-joao-rio-de-janeiro-abc1/
    index.html
```

### Via API

```bash
curl http://localhost:3000/api/sites | python3 -m json.tool
```

---

## 8. Landing page de vendas

A landing page em **http://localhost:3000** é sua página de vendas. Ela inclui:

- Hero com CTA direto para WhatsApp
- Nichos suportados
- Como funciona (3 passos)
- Features (6 benefícios)
- Depoimentos
- Tabela de preços (R$97 único / R$19/mês)
- Footer com links

### Personalizando o WhatsApp da landing

No `.env`, defina seu número:

```env
WHATSAPP_NUMBER=5521999999999
```

Todos os botões da landing vão direcionar para o seu WhatsApp com a mensagem:
> "Olá! Quero criar meu site profissional por R$97"

### Customizando depoimentos e preços

Edite o arquivo [app/page.tsx](app/page.tsx) — procure os arrays `testimonials` e a seção `Pricing`.

---

## 9. Skills — usando direto no código

As **Skills** são funções utilitárias reutilizáveis que você pode usar em qualquer parte do código.

### Skill SEO (`skills/seo.ts`)

```typescript
import { buildSeoMeta, buildSeoKeywords } from '@/skills/seo'

// Gerar keywords locais
const keywords = buildSeoKeywords({
  businessName: 'Barbearia do João',
  niche: 'Barbearia',
  city: 'Rio de Janeiro',
  neighborhood: 'Copacabana',
  services: ['corte masculino', 'barba', 'sobrancelha']
})
// → ['barbearia em Rio de Janeiro', 'barbearia Copacabana', 'corte masculino em Rio de Janeiro', ...]

// Gerar meta tags completas
const seo = buildSeoMeta({
  businessName: 'Barbearia do João',
  niche: 'Barbearia',
  city: 'Rio de Janeiro',
  neighborhood: 'Copacabana'
})
// → {
//   metaTitle: 'Barbearia do João — Barbearia em Copacabana, Rio de Janeiro | Atendimento via WhatsApp',
//   metaDescription: '...',
//   keywords: [...],
//   structuredData: { '@context': 'https://schema.org', ... }
// }
```

### Skill Conversão (`skills/conversion.ts`)

```typescript
import { getConversionCopy, buildConversionPromptInstructions } from '@/skills/conversion'

// Pegar copy pronta para o nicho
const copy = getConversionCopy('barbearia')
// → {
//   painPoint: 'Cansado de esperar horas na fila da barbearia?',
//   solution: 'Agende o seu horário em segundos direto pelo WhatsApp...',
//   socialProof: 'Mais de 200 clientes satisfeitos na região.',
//   urgencyCta: 'Agende agora — vagas limitadas!',
//   heroCta: 'Quero agendar meu horário',
//   objectionHandler: { preco: '...', distancia: '...' }
// }

// Gerar instruções para prompt da IA
const instructions = buildConversionPromptInstructions({
  businessName: 'Barbearia do João',
  niche: 'Barbearia',
  city: 'Rio de Janeiro',
  neighborhood: 'Copacabana'
})
// → 'INSTRUÇÕES DE CONVERSÃO: Comece abordando a DOR...'
```

### Skill WhatsApp (`skills/whatsapp.ts`)

```typescript
import { buildWhatsAppLink, buildWhatsAppButton, buildCtaSection } from '@/skills/whatsapp'

// Link simples
const link = buildWhatsAppLink({
  number: '5521999999999',
  businessName: 'Barbearia do João',
  niche: 'Barbearia',
  context: 'agenda'   // → mensagem: "Olá! Gostaria de agendar um horário."
})
// → 'https://wa.me/5521999999999?text=...'

// Botão completo
const button = buildWhatsAppButton({
  number: '5521999999999',
  businessName: 'Barbearia do João',
  niche: 'Barbearia',
  context: 'orcamento'
})
// → { href: '...', label: '💬 Solicitar orçamento', ariaLabel: '...' }

// Seção CTA completa
const cta = buildCtaSection({
  number: '5521999999999',
  businessName: 'Barbearia do João',
  niche: 'Barbearia',
  context: 'contato'
})
// → {
//   headline: 'Pronto para ser atendido em Barbearia do João?',
//   subheadline: 'Entre em contato agora pelo WhatsApp...',
//   buttonLabel: '💬 Falar pelo WhatsApp agora',
//   link: 'https://wa.me/...'
// }

// Contextos disponíveis:
// 'agenda'   → "Olá! Gostaria de agendar um horário."
// 'pedido'   → "Olá! Quero fazer um pedido."
// 'orcamento'→ "Olá! Gostaria de um orçamento."
// 'contato'  → "Olá! Vim pelo site e gostaria de mais informações."
```

---

## 10. Agents — entendendo e customizando

### Usar o Orchestrator diretamente no código

```typescript
import { createSite } from '@/lib/orchestrator'

const result = await createSite({
  business: 'Clínica Odonto Plus',
  city: 'Niterói',
  neighborhood: 'Icaraí',
  whatsapp: '21999998888',
  clientName: 'Dr. Marcos'
})

if (result.success) {
  console.log('URL:', result.url)         // http://...
  console.log('Slug:', result.site?.slug) // clinica-odonto-plus-...
} else {
  console.error('Erro:', result.error)
}
```

### Adicionar um novo nicho ao Planner

Edite `agents/planner.ts`:

```typescript
// NICHE_MAP — adicione o mapeamento de texto → nome do nicho
const NICHE_MAP: Record<string, string> = {
  // ... existentes
  'pet shop': 'Pet Shop',   // ← adicione aqui
  'petshop': 'Pet Shop',
  'veterinario': 'Veterinária',
}

// nicheSections — adicione as seções da página
const nicheSections: Record<string, string[]> = {
  // ... existentes
  'Pet Shop': ['hero', 'servicos', 'produtos', 'sobre', 'cta', 'localizacao'],
}

// nicheColors — adicione as cores
const nicheColors: Record<string, ...> = {
  // ... existentes
  'Pet Shop': { primary: '#f5a623', secondary: '#ff6b6b', style: 'bold' },
}
```

### Adicionar um novo nicho ao UI Agent

Edite `agents/ui.ts`, adicione no `styleMap`:

```typescript
'Pet Shop': {
  primaryColor: '#f5a623',
  secondaryColor: '#ff6b6b',
  accentColor: '#fff9f0',
  fontFamily: "'Nunito', sans-serif",
  style: 'bold',
  layout: 'landing',
},
```

### Adicionar copy de conversão para o novo nicho

Edite `skills/conversion.ts`:

```typescript
const nicheConfigs: Record<string, ConversionCopy> = {
  // ... existentes
  'pet': {
    painPoint: 'Seu pet merece o melhor cuidado, mas é difícil encontrar um serviço confiável?',
    solution: 'No nosso pet shop, atendemos com carinho e profissionalismo. Agende pelo WhatsApp!',
    socialProof: 'Mais de 300 pets atendidos com satisfação.',
    urgencyCta: 'Agende agora para seu pet!',
    heroCta: 'Quero agendar para meu pet',
    objectionHandler: {
      preco: 'Preço justo, cuidado premium.',
      confianca: 'Veterinários certificados e ambiente preparado.',
    },
  },
}
```

---

## 11. Deploy do sistema na Vercel

Para colocar o **Site Factory AI** online (a plataforma em si):

### 1. Instalar Vercel CLI

```bash
npm i -g vercel
```

### 2. Fazer deploy

```bash
vercel --prod
```

### 3. Configurar variáveis de ambiente na Vercel

No painel da Vercel → seu projeto → Settings → Environment Variables:

```
OPENAI_API_KEY         = sk-...
TELEGRAM_BOT_TOKEN     = 712...
MONGODB_URI            = mongodb+srv://...
WHATSAPP_NUMBER        = 5521999999999
NEXT_PUBLIC_BASE_URL   = https://seu-dominio.vercel.app
VERCEL_TOKEN           = (deixe vazio ou adicione para deploy automático dos sites)
```

### 4. Configurar webhook do Telegram (produção)

Em produção, substitua o modo polling pelo webhook. No terminal, acesse:

```
https://api.telegram.org/bot<SEU_TOKEN>/setWebhook?url=https://seu-dominio.vercel.app/api/telegram
```

> ⚠️ Com webhook, **não** use `npm run telegram` — o bot vai responder pelo endpoint `/api/telegram` automaticamente.

---

## 12. Deploy automático dos sites gerados

### Ativar deploy na Vercel para cada site gerado

1. Crie um token em: https://vercel.com/account/tokens
2. Adicione ao `.env`:
   ```env
   VERCEL_TOKEN=vercel_...
   ```
3. Pronto! O `deployAgent` vai subir cada site automaticamente.

### Fluxo com Vercel ativado:

```
createSite("Barbearia do João", "Rio de Janeiro")
    ↓
Deploy Agent → API Vercel → cria projeto "site-factory-barbearia-do-joao-..."
    ↓
URL retornada: https://site-factory-barbearia-do-joao-abc1.vercel.app
    ↓
Salvo no MongoDB com deployUrl
    ↓
Acessível em: /s/{slug} (fallback) + URL Vercel
```

### Sem Vercel (padrão):

Os sites são salvos em `generated-sites/{slug}/index.html` e servidos pela rota `/s/{slug}` do Next.js.

---

## 13. MongoDB — gerenciando dados

### Conexão local

```bash
# Instalar MongoDB (Ubuntu)
sudo apt-get install -y mongodb

# Iniciar
sudo service mongodb start

# Verificar
mongo --eval "db.adminCommand('ping')"
```

### MongoDB Atlas (gratuito, recomendado para produção)

1. Crie conta em https://www.mongodb.com/atlas
2. Crie um cluster gratuito (M0)
3. Em "Connect" → "Connect your application" → copie a URI
4. Coloque no `.env`:
   ```env
   MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/site-factory
   ```

### Consultas úteis no MongoDB

```javascript
// Abrir o mongo shell
mongo site-factory

// Ver todos os sites
db.sites.find().pretty()

// Contar sites por nicho
db.sites.aggregate([{ $group: { _id: '$niche', total: { $sum: 1 } } }])

// Ver sites publicados
db.sites.find({ status: 'published' }).count()

// Buscar por cidade
db.sites.find({ city: 'Rio de Janeiro' }).pretty()

// Ver último site criado
db.sites.findOne({}, { sort: { createdAt: -1 } })
```

---

## 14. Estratégia de vendas (do GPT)

Esses scripts e estratégias vieram diretamente da conversa que originou este projeto.

### Abordagem (primeiro contato — copie e use)

```
Fala! Vi seu negócio aqui na região e percebi que você ainda não tem um site profissional.

Eu estou criando sites completos em 2 minutos usando IA, com botão direto pro WhatsApp.

Tô fazendo por R$97 essa semana pra validar.

Quer que eu te mostre como ficaria o seu?
```

### Quando a pessoa responder "sim":

```
Boa! Me manda só:
- nome do seu negócio
- cidade ou bairro

Já te envio um modelo pronto aqui 👇
```

### Entrega do demo:

1. Use o terminal para gerar o site em segundos:
   ```bash
   npx tsx generator/create-site.ts "Nome do cliente" "Cidade" "Bairro" "WhatsApp"
   ```
2. Copie a URL gerada
3. Envie:

```
Pronto, fiz um exemplo do seu site:

[LINK]

Ele já está com botão direto pro seu WhatsApp e pronto pra receber clientes.

Imagina isso rodando pra você 24h por dia 👀
```

### Fechamento:

```
Se quiser esse site no ar hoje:

Faço por R$97 (pagamento único)

Inclui:
- site pronto
- link online
- integração com WhatsApp

Posso subir agora pra você 🚀
```

### Objeção "vou pensar":

```
Tranquilo!

Só um ponto: hoje eu ainda estou fazendo nesse valor pra validar.

Depois devo subir pra R$197.

Se quiser garantir nesse preço, consigo fazer hoje pra você.
```

### Objeção "tá caro":

```
Entendo!

Mas pensa assim:

Se o site te trouxer 1 cliente já se paga.

E diferente de Instagram, ele trabalha pra você 24h.

Mas se quiser, posso fazer uma versão mais simples também 👍
```

### Pós-venda (multiplicador):

```
Ficou pronto! 🚀

Se você conhecer mais alguém que precise de um site, posso fazer com desconto pra você indicar.

Posso até te pagar uma comissão por indicação 😉
```

### Onde encontrar clientes

**Busca no Instagram:**
```
barbearia rj
barbearia zona norte
barbearia copacabana
hamburgueria rj
salão beleza niterói
```

**Grupos Facebook local:**
- Grupos de bairro
- Grupos de empreendedores locais

**OLX / Marketplace:**
- Busque por serviços locais sem site

### Resultado esperado em 7 dias

| Ação | Meta |
|---|---|
| Mensagens enviadas | 100 |
| Respostas | ~20 |
| Demos enviados | ~10 |
| Vendas | 3 a 5 |
| Faturamento | R$291 a R$485 |

**Dica que muda tudo:** não venda "site". Venda **"mais clientes no WhatsApp"**.

---

## Dúvidas frequentes

**Quanto custa usar o GPT-4o-mini por site?**  
Cerca de R$0,05 a R$0,10 por site gerado. Muito barato.

**Posso usar sem MongoDB?**  
Não no estado atual — o orchestrator persiste no Mongo. Mas você pode comentar a parte de persistência no `lib/orchestrator.ts` para testar.

**O bot Telegram funciona em produção?**  
Sim. Em produção, configure o webhook via `/api/telegram`. Em desenvolvimento, use `npm run telegram` (polling).

**Posso hospedar os sites gerados em outro lugar que não a Vercel?**  
Sim. O `deployAgent` tem fallback para salvo local (pasta `generated-sites/`). Você pode copiar esses arquivos para qualquer hosting estático (GitHub Pages, Netlify, etc.).

**Como adicionar um domínio personalizado para cada site?**  
Isso requer configurar subdomínios dinâmicos (ex: `cliente.seusite.com`). É uma evolução futura — atualmente cada site tem uma URL no padrão `/s/{slug}`.
