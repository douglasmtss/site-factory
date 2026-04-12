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
import { plannerAgent, detectNiche } from '@/agents/planner'
import type { BusinessInput } from '@/types'

/** Returns the `create` mock from the OpenAI instance created when planner.ts loads */
const getMockCreate = (): jest.Mock => {
  const instance = (OpenAI as jest.Mock).mock.results[0]?.value
  return instance?.chat?.completions?.create as jest.Mock
}

const validPlanJSON = JSON.stringify({
  pages: ['home', 'sobre'],
  sections: ['hero', 'servicos', 'cta'],
  tone: 'descontraído e profissional',
  keywords: ['barbearia em copacabana'],
  niche: 'Barbearia',
  colorScheme: { primary: '#1a1a2e', secondary: '#e94560', style: 'premium' },
})

const baseInput: BusinessInput = {
  business: 'Barbearia do João',
  city: 'Rio de Janeiro',
  neighborhood: 'Copacabana',
  whatsapp: '21999999999',
}

describe('agents/planner', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    getMockCreate()?.mockReset()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('detectNiche', () => {
    it('should detect "Barbearia" from "barbearia" keyword', () => {
      expect(detectNiche('barbearia premium')).toBe('Barbearia')
    })

    it('should detect "Barbearia" from "barber" keyword', () => {
      expect(detectNiche('barber shop')).toBe('Barbearia')
    })

    it('should detect "Salão de Beleza" from "cabelo" keyword', () => {
      expect(detectNiche('salão de cabelo')).toBe('Salão de Beleza')
    })

    it('should detect "Hamburgueria" from "hamburgueria" keyword', () => {
      expect(detectNiche('hamburgueria artesanal')).toBe('Hamburgueria')
    })

    it('should detect "Hamburgueria" from "hamburguer" keyword', () => {
      expect(detectNiche('hamburguer do bairro')).toBe('Hamburgueria')
    })

    it('should detect "Hamburgueria" from "burger" keyword', () => {
      expect(detectNiche('burger king style')).toBe('Hamburgueria')
    })

    it('should detect "Pizzaria" from "pizzaria" keyword', () => {
      expect(detectNiche('pizzaria bella napoli')).toBe('Pizzaria')
    })

    it('should detect "Pizzaria" from "pizza" keyword', () => {
      expect(detectNiche('pizza express')).toBe('Pizzaria')
    })

    it('should detect "Salão de Beleza" from "salao" keyword', () => {
      expect(detectNiche('salao da maria')).toBe('Salão de Beleza')
    })

    it('should detect "Salão de Beleza" from "salon" keyword', () => {
      expect(detectNiche('salon premium')).toBe('Salão de Beleza')
    })

    it('should detect "Salão de Beleza" from "beleza" keyword', () => {
      expect(detectNiche('estudio de beleza')).toBe('Salão de Beleza')
    })

    it('should detect "Estética" from "estetica" keyword', () => {
      expect(detectNiche('clínica de estetica')).toBe('Estética')
    })

    it('should detect "Restaurante" from "restaurante" keyword', () => {
      expect(detectNiche('restaurante italiano')).toBe('Restaurante')
    })

    it('should detect "Mecânica" from "mecanica" keyword', () => {
      expect(detectNiche('mecanica express')).toBe('Mecânica')
    })

    it('should detect "Mecânica" from "mecanico" keyword', () => {
      expect(detectNiche('mecanico 24h')).toBe('Mecânica')
    })

    it('should detect "Advocacia" from "advogado" keyword', () => {
      expect(detectNiche('advogado trabalhista')).toBe('Advocacia')
    })

    it('should detect "Advocacia" from "advocacia" keyword', () => {
      expect(detectNiche('advocacia silva')).toBe('Advocacia')
    })

    it('should detect "Advocacia" from "juridico" keyword', () => {
      expect(detectNiche('consultório juridico')).toBe('Advocacia')
    })

    it('should detect "Odontologia" from "dentista" keyword', () => {
      expect(detectNiche('dentista sorriso')).toBe('Odontologia')
    })

    it('should detect "Odontologia" from "odonto" keyword', () => {
      expect(detectNiche('odonto plus')).toBe('Odontologia')
    })

    it('should detect "Clínica" from "clinica" keyword', () => {
      expect(detectNiche('clinica medica')).toBe('Clínica')
    })

    it('should detect "Academia" from "academia" keyword', () => {
      expect(detectNiche('academia fitness')).toBe('Academia')
    })

    it('should detect "Academia" from "fitness" keyword', () => {
      expect(detectNiche('fitness center')).toBe('Academia')
    })

    it('should detect "Igreja" from "igreja" keyword', () => {
      expect(detectNiche('igreja batista')).toBe('Igreja')
    })

    it('should detect "Delivery" from "delivery" keyword', () => {
      expect(detectNiche('delivery express')).toBe('Delivery')
    })

    it('should detect "Loja" from "loja" keyword', () => {
      expect(detectNiche('loja de roupas')).toBe('Loja')
    })

    it('should return "Negócio Local" for unknown business type', () => {
      expect(detectNiche('empresa xyz')).toBe('Negócio Local')
    })

    it('should return "Negócio Local" for empty string', () => {
      expect(detectNiche('')).toBe('Negócio Local')
    })

    it('should be case-insensitive', () => {
      expect(detectNiche('BARBEARIA DO JOÃO')).toBe('Barbearia')
    })
  })

  describe('plannerAgent', () => {
    it('should return success with a valid plan when OpenAI responds correctly', async () => {
      getMockCreate().mockResolvedValueOnce({
        choices: [{ message: { content: validPlanJSON } }],
      })

      const result = await plannerAgent(baseInput)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.sections).toBeDefined()
      expect(result.data?.keywords).toBeDefined()
      expect(result.data?.niche).toBeDefined()
    })

    it('should include niche in the returned plan', async () => {
      getMockCreate().mockResolvedValueOnce({
        choices: [{ message: { content: validPlanJSON } }],
      })

      const result = await plannerAgent(baseInput)

      expect(result.data?.niche).toBe('Barbearia')
    })

    it('should use fallback sections when OpenAI returns plan without sections', async () => {
      const noSectionsJSON = JSON.stringify({
        pages: ['home'],
        sections: [],
        tone: 'moderno',
        keywords: ['barbearia rj'],
        niche: 'Barbearia',
        colorScheme: { primary: '#000', secondary: '#fff', style: 'modern' },
      })
      getMockCreate().mockResolvedValueOnce({
        choices: [{ message: { content: noSectionsJSON } }],
      })

      const result = await plannerAgent(baseInput)

      expect(result.success).toBe(true)
      expect(result.data?.sections.length).toBeGreaterThan(0)
    })

    it('should use fallback colorScheme when OpenAI returns plan without colorScheme', async () => {
      const noColorJSON = JSON.stringify({
        pages: ['home'],
        sections: ['hero'],
        tone: 'moderno',
        keywords: ['barbearia rj'],
        niche: 'Barbearia',
        colorScheme: null,
      })
      getMockCreate().mockResolvedValueOnce({
        choices: [{ message: { content: noColorJSON } }],
      })

      const result = await plannerAgent(baseInput)

      expect(result.success).toBe(true)
      expect(result.data?.colorScheme?.primary).toBeDefined()
    })

    it('should handle OpenAI response wrapped in markdown code block', async () => {
      getMockCreate().mockResolvedValueOnce({
        choices: [{ message: { content: `\`\`\`json\n${validPlanJSON}\n\`\`\`` } }],
      })

      const result = await plannerAgent(baseInput)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('should return success: false when OpenAI throws an error', async () => {
      getMockCreate().mockRejectedValueOnce(new Error('OpenAI API error'))

      const result = await plannerAgent(baseInput)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should return success: false when OpenAI returns invalid JSON', async () => {
      getMockCreate().mockResolvedValueOnce({
        choices: [{ message: { content: 'not valid json {{{' } }],
      })

      const result = await plannerAgent(baseInput)

      expect(result.success).toBe(false)
    })

    it('should handle input without neighborhood', async () => {
      const inputNoNeighborhood: BusinessInput = {
        business: 'Barbearia do João',
        city: 'Rio de Janeiro',
      }
      getMockCreate().mockResolvedValueOnce({
        choices: [{ message: { content: validPlanJSON } }],
      })

      const result = await plannerAgent(inputNoNeighborhood)

      expect(result.success).toBe(true)
    })

    it('should use default colorScheme for known niche when plan has no colorScheme.primary', async () => {
      const planNoColor = JSON.stringify({
        pages: ['home'],
        sections: ['hero'],
        tone: 'moderno',
        keywords: [],
        niche: 'Hamburgueria',
        colorScheme: {},
      })
      getMockCreate().mockResolvedValueOnce({
        choices: [{ message: { content: planNoColor } }],
      })

      const result = await plannerAgent({ ...baseInput, business: 'Lamar Burger' })

      expect(result.success).toBe(true)
      expect(result.data?.colorScheme?.primary).toBeDefined()
    })

    it('should use default niche colorScheme when niche is not in map', async () => {
      const planUnknownNiche = JSON.stringify({
        pages: ['home'],
        sections: ['hero'],
        tone: 'moderno',
        keywords: [],
        niche: 'Negócio Local',
        colorScheme: {},
      })
      getMockCreate().mockResolvedValueOnce({
        choices: [{ message: { content: planUnknownNiche } }],
      })

      const result = await plannerAgent({ ...baseInput, business: 'Empresa XYZ' })

      expect(result.success).toBe(true)
    })
  })
})
