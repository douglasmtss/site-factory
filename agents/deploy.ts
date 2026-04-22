// Agent: Deploy
// Gerencia o deploy do site gerado (local, Vercel, ou simulado)

import fs from 'fs-extra'
import path from 'path'
import axios from 'axios'
import type { AgentResult } from '@/types'

export interface DeployResult {
  url: string
  provider: 'local' | 'vercel' | 'simulated'
  slug: string
}

const OUTPUT_DIR = path.join(process.cwd(), 'generated-sites')

/**
 * Deploy local: salva o HTML na pasta generated-sites/
 */
export async function deployLocal(
  html: string,
  slug: string
): Promise<AgentResult<DeployResult>> {
  try {
    await fs.ensureDir(OUTPUT_DIR)
    const siteDir = path.join(OUTPUT_DIR, slug)
    await fs.ensureDir(siteDir)
    await fs.writeFile(path.join(siteDir, 'index.html'), html, 'utf-8')

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    const url = `${baseUrl}/s/${slug}`

    return { success: true, data: { url, provider: 'local', slug } }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Deploy Vercel: usa a API da Vercel para criar um projeto e subir o código
 */
export async function deployVercel(
  html: string,
  slug: string
): Promise<AgentResult<DeployResult>> {
  const token = process.env.VERCEL_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID

  if (!token) {
    console.warn('[DeployAgent] VERCEL_TOKEN não configurado. Usando deploy local.')
    return deployLocal(html, slug)
  }

  try {
    const deployBody = {
      name: `site-factory-${slug}`,
      files: [
        {
          file: 'index.html',
          data: html,
          encoding: 'utf-8',
        },
      ],
      projectSettings: {
        framework: null,
      },
      ...(teamId ? { teamId } : {}),
    }

    const response = await axios.post(
      'https://api.vercel.com/v13/deployments',
      deployBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    )

    const url: string = response.data?.url
      ? `https://${response.data.url}`
      : `https://${slug}.vercel.app`

    // Salva localmente também como backup
    await deployLocal(html, slug)

    return { success: true, data: { url, provider: 'vercel', slug } }
  } catch (error) {
    console.error('[DeployAgent] Vercel error, fallback to local:', error)
    return deployLocal(html, slug)
  }
}

/**
 * Deploy Agent principal: tenta Vercel, fallback local
 */
export async function deployAgent(
  html: string,
  slug: string
): Promise<AgentResult<DeployResult>> {
  if (process.env.VERCEL_TOKEN) {
    return deployVercel(html, slug)
  }
  return deployLocal(html, slug)
}
