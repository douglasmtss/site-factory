// POST /api/telegram
// Webhook do Telegram (alternativa ao polling)

import { NextRequest, NextResponse } from 'next/server'
import { Telegraf } from 'telegraf'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ''

export async function POST(request: NextRequest) {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    const bot = new Telegraf(BOT_TOKEN)
    const body = await request.json()

    await bot.handleUpdate(body)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Telegram Webhook]', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
