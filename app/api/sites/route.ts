// GET /api/sites
// Lista todos os sites gerados

import { NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongodb'
import { Site } from '@/models/Site'

export async function GET() {
  try {
    await connectMongo()

    const sites = await Site.find({})
      .select('slug businessName city niche status deployUrl createdAt whatsappLink')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    return NextResponse.json({ success: true, total: sites.length, sites })
  } catch (error) {
    console.error('[API /sites]', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar sites.' },
      { status: 500 }
    )
  }
}
