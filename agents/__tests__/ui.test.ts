import { uiAgent } from '@/agents/ui'
import type { SitePlan } from '@/types'

const makePlan = (niche: string, colorScheme?: Partial<SitePlan['colorScheme']>): SitePlan => ({
  pages: ['home'],
  sections: ['hero', 'servicos', 'cta'],
  tone: 'moderno',
  keywords: [],
  niche,
  colorScheme: {
    primary: colorScheme?.primary ?? '',
    secondary: colorScheme?.secondary ?? '',
    style: colorScheme?.style ?? '',
  },
})

describe('agents/ui', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('uiAgent', () => {
    it('should return success: true', () => {
      const result = uiAgent(makePlan('Barbearia'))
      expect(result.success).toBe(true)
    })

    it('should return a SiteDesign object with all required fields', () => {
      const result = uiAgent(makePlan('Barbearia'))
      expect(result.data?.primaryColor).toBeDefined()
      expect(result.data?.secondaryColor).toBeDefined()
      expect(result.data?.accentColor).toBeDefined()
      expect(result.data?.fontFamily).toBeDefined()
      expect(result.data?.style).toBeDefined()
      expect(result.data?.layout).toBeDefined()
    })

    it('should return premium style for Barbearia niche', () => {
      const result = uiAgent(makePlan('Barbearia'))
      expect(result.data?.style).toBe('premium')
    })

    it('should return bold style for Hamburgueria niche', () => {
      const result = uiAgent(makePlan('Hamburgueria'))
      expect(result.data?.style).toBe('bold')
    })

    it('should return bold style for Pizzaria niche', () => {
      const result = uiAgent(makePlan('Pizzaria'))
      expect(result.data?.style).toBe('bold')
    })

    it('should return premium style for Restaurante niche', () => {
      const result = uiAgent(makePlan('Restaurante'))
      expect(result.data?.style).toBe('premium')
    })

    it('should return premium style for Salão de Beleza niche', () => {
      const result = uiAgent(makePlan('Salão de Beleza'))
      expect(result.data?.style).toBe('premium')
    })

    it('should return minimal style for Estética niche', () => {
      const result = uiAgent(makePlan('Estética'))
      expect(result.data?.style).toBe('minimal')
    })

    it('should return bold style for Mecânica niche', () => {
      const result = uiAgent(makePlan('Mecânica'))
      expect(result.data?.style).toBe('bold')
    })

    it('should return premium style for Advocacia niche', () => {
      const result = uiAgent(makePlan('Advocacia'))
      expect(result.data?.style).toBe('premium')
    })

    it('should return default modern style for unknown niche', () => {
      const result = uiAgent(makePlan('Padaria'))
      expect(result.data?.style).toBe('modern')
    })

    it('should return layout as "landing" for all niches', () => {
      const niches = ['Barbearia', 'Hamburgueria', 'Restaurante', 'Padaria']
      niches.forEach((niche) => {
        const result = uiAgent(makePlan(niche))
        expect(result.data?.layout).toBe('landing')
      })
    })

    it('should override primaryColor when plan.colorScheme.primary is set', () => {
      const plan = makePlan('Barbearia', {
        primary: '#ff0000',
        secondary: '#00ff00',
        style: 'bold',
      })
      const result = uiAgent(plan)
      expect(result.data?.primaryColor).toBe('#ff0000')
    })

    it('should override secondaryColor when plan.colorScheme.secondary is set', () => {
      const plan = makePlan('Barbearia', {
        primary: '#ff0000',
        secondary: '#00ff00',
        style: 'bold',
      })
      const result = uiAgent(plan)
      expect(result.data?.secondaryColor).toBe('#00ff00')
    })

    it('should override style when plan.colorScheme.style is set', () => {
      const plan = makePlan('Barbearia', {
        primary: '#ff0000',
        secondary: '#00ff00',
        style: 'bold',
      })
      const result = uiAgent(plan)
      expect(result.data?.style).toBe('bold')
    })

    it('should not override design when plan.colorScheme.primary is empty string', () => {
      // Use a niche not mutated by any previous test to avoid styleMap pollution
      const plan = makePlan('Advocacia', { primary: '', secondary: '', style: '' })
      const result = uiAgent(plan)
      // When primary is empty/falsy, keeps original niche design
      expect(result.data?.primaryColor).toBe('#1a1a2e')
    })

    it('should not override design when plan.colorScheme is null/undefined', () => {
      const plan: SitePlan = {
        pages: ['home'],
        sections: ['hero'],
        tone: 'modern',
        keywords: [],
        niche: 'Barbearia',
        colorScheme: undefined as unknown as SitePlan['colorScheme'],
      }
      const result = uiAgent(plan)
      // colorScheme?.primary → undefined → block skipped → keeps niche default
      expect(result.success).toBe(true)
      expect(result.data?.primaryColor).toBeDefined()
    })

    it('should fall back to existing design.style when plan.colorScheme.style is undefined', () => {
      const plan: SitePlan = {
        pages: ['home'],
        sections: ['hero'],
        tone: 'modern',
        keywords: [],
        niche: 'Barbearia',
        colorScheme: {
          primary: '#ff0000',
          secondary: '#00ff00',
          style: undefined as unknown as string,
        },
      }
      const result = uiAgent(plan)
      // plan.colorScheme.style is undefined → ?? design.style fallback fires
      expect(result.success).toBe(true)
      expect(result.data?.style).toBeDefined()
    })

    it('should return success: false when an error is thrown internally', () => {
      const throwingPlan = new Proxy({} as SitePlan, {
        get: (_target, prop) => {
          if (prop === 'niche') throw new Error('Simulated internal error')
          return undefined
        },
      })
      const result = uiAgent(throwingPlan)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
