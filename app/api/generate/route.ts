// POST /api/generate
// Cria um novo site via API

import { NextRequest, NextResponse } from 'next/server'
import { createSite } from '@/lib/orchestrator'
import type { BusinessInput } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as BusinessInput

    if (!body.business || !body.city) {
      return NextResponse.json(
        { success: false, error: 'Os campos "business" e "city" são obrigatórios.' },
        { status: 400 }
      )
    }

    const result = await createSite(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      slug: result.site?.slug,
      site: result.site,
    })
  } catch (error) {
    console.error('[API /generate]', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno no servidor.' },
      { status: 500 }
    )
  }
}
