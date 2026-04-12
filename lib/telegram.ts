// Telegram Bot — Site Factory
// Cria sites automaticamente via conversa no Telegram
// Run: npm run telegram

import 'dotenv/config'
import { Telegraf, Markup } from 'telegraf'
import { createSite } from '@/lib/orchestrator'
import type { BusinessInput } from '@/types'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

if (!BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN não configurado no .env')
}

const bot = new Telegraf(BOT_TOKEN)

// Estado por usuário
interface UserState {
  step: 'idle' | 'awaiting_business' | 'awaiting_city' | 'awaiting_whatsapp' | 'generating'
  business?: string
  city?: string
  neighborhood?: string
}

const userStates = new Map<number, UserState>()

function getState(userId: number): UserState {
  return userStates.get(userId) ?? { step: 'idle' }
}

function setState(userId: number, state: UserState) {
  userStates.set(userId, state)
}

// /start
bot.start((ctx) => {
  setState(ctx.from.id, { step: 'idle' })
  ctx.replyWithMarkdownV2(
    `👋 *Bem\\-vindo ao Site Factory AI\\!*\n\n` +
    `Eu crio sites profissionais para pequenos negócios em *menos de 2 minutos* usando inteligência artificial\\.\n\n` +
    `💰 *Preço:* R\\$97 \\(pagamento único\\)\n` +
    `📅 *Plano mensal:* R\\$19/mês \\(site \\+ hospedagem\\)\n\n` +
    `Para começar, use o comando /criar`,
    Markup.keyboard([['🚀 Criar site', '📋 Meus sites', '💬 Suporte']]).resize()
  )
})

// /criar
bot.hears(['🚀 Criar site', '/criar'], (ctx) => {
  setState(ctx.from.id, { step: 'awaiting_business' })
  ctx.reply(
    '📝 Ótimo! Vamos criar seu site.\n\nPrimeiro: qual é o *nome e tipo do seu negócio*?\n\nExemplos:\n• Barbearia do João\n• Pizzaria Bella Napoli\n• Mecânica do Carlos',
    { parse_mode: 'Markdown' }
  )
})

// /ajuda
bot.command('ajuda', (ctx) => {
  ctx.replyWithMarkdownV2(
    `*📖 Como funciona:*\n\n` +
    `1\\. Use /criar para iniciar\n` +
    `2\\. Me diga o nome do negócio\n` +
    `3\\. Me diga a cidade/bairro\n` +
    `4\\. Me diga o WhatsApp para o site\n` +
    `5\\. Aguarde 30\\-60 segundos\n` +
    `6\\. Receba o link do site pronto\\!\n\n` +
    `*🎯 O site inclui:*\n` +
    `✅ Página profissional\n` +
    `✅ Botão WhatsApp integrado\n` +
    `✅ SEO local otimizado\n` +
    `✅ Funciona em celular\n` +
    `✅ Online imediatamente`
  )
})

// Handler principal de mensagens
bot.on('text', async (ctx) => {
  const userId = ctx.from.id
  const state = getState(userId)
  const text = ctx.message.text.trim()

  // Ignorar comandos
  if (text.startsWith('/')) return

  switch (state.step) {
    case 'idle':
      ctx.reply('Use /criar para criar um novo site ou /ajuda para ajuda.')
      break

    case 'awaiting_business':
      setState(userId, { ...state, step: 'awaiting_city', business: text })
      ctx.reply(
        `✅ Ótimo! "${text}"\n\nAgora me diga a *cidade* \\(e bairro se quiser\\):\n\nExemplos:\n• Rio de Janeiro\n• São Paulo, Moema\n• Niterói, Centro`,
        { parse_mode: 'MarkdownV2' }
      )
      break

    case 'awaiting_city': {
      // Separa cidade e bairro se tiver vírgula
      const parts = text.split(',').map((p) => p.trim())
      const city = parts[0]
      const neighborhood = parts[1]

      setState(userId, { ...state, step: 'awaiting_whatsapp', city, neighborhood })
      ctx.reply(
        `📍 Localização registrada: *${text}*\n\nAgora me diga o *número do WhatsApp* que vai aparecer no site:\n\nExemplo: 21999999999`,
        { parse_mode: 'Markdown' }
      )
      break
    }

    case 'awaiting_whatsapp': {
      // Validação básica do número
      const digits = text.replace(/\D/g, '')
      if (digits.length < 10) {
        ctx.reply('❌ Número inválido. Me passe o WhatsApp com DDD, exemplo: 21999999999')
        return
      }

      const whatsapp = digits.startsWith('55') ? digits : `55${digits}`
      const finalState = { ...state, step: 'generating' as const }
      setState(userId, finalState)

      await ctx.reply(
        `⏳ Perfeito! Estou criando seu site agora...\n\n` +
        `🤖 *Agente Planner* analisando o negócio...\n` +
        `✍️ *Agente Copywriter* escrevendo conteúdo...\n` +
        `🎨 *Agente UI* definindo design...\n` +
        `💻 *Agente Code* gerando código...\n` +
        `🚀 *Agente Deploy* publicando...\n\n` +
        `_Aguarde 30 a 60 segundos..._`,
        { parse_mode: 'Markdown' }
      )

      const input: BusinessInput = {
        business: finalState.business!,
        city: finalState.city!,
        neighborhood: finalState.neighborhood,
        whatsapp,
        clientName: ctx.from.first_name,
      }

      const result = await createSite(input)

      if (result.success && result.url) {
        await ctx.replyWithMarkdownV2(
          `✅ *Site criado com sucesso\\!* 🎉\n\n` +
          `🌐 *Link:* ${escapeMarkdown(result.url)}\n\n` +
          `O site já está online com:\n` +
          `✅ Botão WhatsApp integrado\n` +
          `✅ SEO local para ${escapeMarkdown(finalState.city ?? '')}\n` +
          `✅ Design otimizado para converter\n\n` +
          `💰 Para ativar, faça o pagamento:\n` +
          `• R\\$97 pagamento único\n` +
          `• ou R\\$19/mês \\(site \\+ hospedagem\\)\n\n` +
          `📲 Pix ou link de pagamento disponível — fale com o suporte\\!`
        )
      } else {
        await ctx.reply(
          `❌ Ocorreu um erro ao criar o site. Por favor, tente novamente.\n\n_Erro: ${result.error}_`,
          { parse_mode: 'Markdown' }
        )
      }

      setState(userId, { step: 'idle' })
      break
    }

    default:
      ctx.reply('Use /criar para começar.')
  }
})

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')
}

// Iniciar bot
bot.launch({
  allowedUpdates: ['message'],
})

console.log('🤖 Telegram Bot rodando...')

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
