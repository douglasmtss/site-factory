# Site Factory AI — Documentação

Bem-vindo à documentação do **Site Factory AI**, uma plataforma que cria landing pages profissionais para pequenos negócios brasileiros usando inteligência artificial em menos de 2 minutos.

---

## Índice

| Documento | Descrição |
|---|---|
| [architecture.md](./architecture.md) | Visão geral da arquitetura e diagrama de componentes |
| [orchestrator.md](./orchestrator.md) | Pipeline central — as 8 etapas de geração de sites |
| [agents.md](./agents.md) | Documentação de cada agente de IA |
| [skills.md](./skills.md) | Skills de SEO, conversão e WhatsApp |
| [api.md](./api.md) | Endpoints da API REST |
| [database.md](./database.md) | Modelo de dados MongoDB |
| [deploy.md](./deploy.md) | Opções de deploy (local e Vercel) |
| [telegram.md](./telegram.md) | Bot do Telegram — máquina de estados |
| [generator.md](./generator.md) | Scripts CLI (criação individual e em lote) |

---

## Resumo Rápido

```
Entrada do usuário
  ↓ (WhatsApp / API / CLI / Telegram)
Orquestrador (lib/orchestrator.ts)
  ↓ Pipeline de 8 etapas com agentes de IA
Site gerado em HTML
  ↓ Deploy local ou Vercel
Acessível em /s/{slug}
  ↓ Servido a partir do MongoDB
```

### Stack

- **Framework:** Next.js 15 (App Router)
- **IA:** OpenAI GPT-4o-mini
- **Banco de dados:** MongoDB + Mongoose
- **Bot:** Telegraf (Telegram)
- **CSS:** Tailwind CSS (landing page) + CSS inline (sites gerados)
- **Deploy de sites:** Sistema de arquivos local ou Vercel API

---

## Primeiros Passos

### Variáveis de Ambiente

```env
# Obrigatório para geração com IA
OPENAI_API_KEY=sk-...

# Obrigatório para persistência
MONGODB_URI=mongodb://localhost:27017/site-factory

# URL base do projeto
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=5521999999999

# Opcional — bot do Telegram
TELEGRAM_BOT_TOKEN=...

# Opcional — deploy na Vercel
VERCEL_TOKEN=...
VERCEL_TEAM_ID=...
```

### Comandos Principais

```bash
# Servidor de desenvolvimento
npm run dev

# Gerar um site via CLI
npx tsx generator/create-site.ts "Barbearia do João" "Rio de Janeiro" "Copacabana" "21999999999"

# Geração em lote
npm run bulk

# Iniciar bot do Telegram
npm run telegram

# Testes
npm test
npm run test:coverage
```
