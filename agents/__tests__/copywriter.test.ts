// ts-jest does not apply babel-jest's `mock*` variable hoisting exception.
// Access the mock create fn via the OpenAI mock instance after module load.
jest.mock('openai', () =>
  jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  }))
)

import OpenAI from 'openai'
import { copywriterAgent } from '@/agents/copywriter'
import type { BusinessInput, SitePlan } from '@/types'

/** Returns the `create` mock from the OpenAI instance created when copywriter.ts loads */
const getMockCreate = (): jest.Mock => {
  const instance = (OpenAI as jest.Mock).mock.results[0]?.value
  return instance?.chat?.completions?.create as jest.Mock
}

const basePlan: SitePlan = {
  pages: ['home', 'sobre'],
  sections: ['hero', 'servicos', 'cta'],
  tone: 'descontraído e profissional',
  keywords: ['barbearia em copacabana', 'corte masculino rj'],
  niche: 'Barbearia',
  colorScheme: { primary: '#1a1a2e', secondary: '#e94560', style: 'premium' },
}

const baseInput: BusinessInput = {
  business: 'Barbearia do João',
  city: 'Rio de Janeiro',
  neighborhood: 'Copacabana',
  whatsapp: '21999999999',
}

const validContentJSON = JSON.stringify({
  title: 'Barbearia do João',
  tagline: 'O melhor corte da região',
  description: 'Barbearia premium em Copacabana',
  hero: {
    headline: 'Corte masculino em Copacabana',
    subheadline: 'Agende seu horário agora',
    cta: 'Agendar pelo WhatsApp',
  },
  about: {
    title: 'Sobre nós',
    text: 'Somos a melhor barbearia de Copacabana com anos de experiência',
  },
  services: [
    { name: 'Corte', description: 'Corte masculino', icon: '✂️' },
    { name: 'Barba', description: 'Barba completa', icon: '💈' },
    { name: 'Sobrancelha', description: 'Design de sobrancelha', icon: '⭐' },
  ],
  contact: {
    cta: 'Entre em contato agora',
    whatsappText: 'Olá, quero agendar um horário',
  },
  seoMeta: {
    title: 'Barbearia do João — Copacabana RJ',
    description: 'A melhor barbearia de Copacabana com atendimento rápido',
    keywords: ['barbearia copacabana', 'corte masculino rj'],
  },
})

describe('agents/copywriter', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    getMockCreate().mockReset()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('copywriterAgent', () => {
    it('should return success with valid SiteContent when OpenAI responds correctly', async () => {
      getMockCreate().mockResolvedValueOnce({
        choices: [{ message: { content: validContentJSON } }],
      })

      const result = await copywriterAgent(baseInput, basePlan)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('should return content with all required fields', async () => {
      getMockCreate().mockResolvedValueOnce({
        choices: [{ message: { content: validContentJSON } }],
      })

      const result = await copywriterAgent(baseInput, basePlan)

      expect(result.data?.title).toBeDefined()
      expect(result.data?.tagline).toBeDefined()
      expect(result.data?.hero).toBeDefined()
      expect(result.data?.about).toBeDefined()
      expect(result.data?.services).toBeDefined()
      expect(result.data?.contact).toBeDefined()
      expect(result.data?.seoMeta).toBeDefined()
    })

    it('should return hero with headline, subheadline and cta', async () => {
      getMockCreate().mockResolvedValueOnce({
        choices: [{ message: { content: validContentJSON } }],
      })

      const result = await copywriterAgent(baseInput, basePlan)

      expect(result.data?.hero.headline).toBeTruthy()
      expect(result.data?.hero.subheadline).toBeTruthy()
      expect(result.data?.hero.cta).toBeTruthy()
    })

    it('should handle OpenAI response wrapped in markdown code fence', async () => {
      getMockCreate().mockResolvedValueOnce({
        choices: [{ message: { content: `\`\`\`json\n${validContentJSON}\n\`\`\`` } }],
      })

      const result = await copywriterAgent(baseInput, basePlan)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('should return success: false when OpenAI throws an error', async () => {
      getMockCreate().mockRejectedValueOnce(new Error('OpenAI API unavailable'))

      const result = await copywriterAgent(baseInput, basePlan)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should return success: false when OpenAI returns invalid JSON', async () => {
      getMockCreate().mockResolvedValueOnce({
        choices: [{ message: { content: 'invalid {{{json' } }],
      })

      const result = await copywriterAgent(baseInput, basePlan)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle input without neighborhood', async () => {
      const inputNoNeighborhood: BusinessInput = {
        business: 'Pizzaria Bella',
        city: 'Niterói',
      }
      getMockCreate().mockResolvedValueOnce({
        choices: [{ message: { content: validContentJSON } }],
      })

      const result = await copywriterAgent(inputNoNeighborhood, basePlan)

      expect(result.success).toBe(true)
    })

    it('should call OpenAI with a prompt containing business name and niche', async () => {
      getMockCreate().mockResolvedValueOnce({
        choices: [{ message: { content: validContentJSON } }],
      })

      await copywriterAgent(baseInput, basePlan)

      expect(getMockCreate()).toHaveBeenCalledTimes(1)
      const callArgs = getMockCreate().mock.calls[0][0]
      expect(callArgs.messages[0].content).toContain('Barbearia do João')
    })
  })
})
