import {
  getConversionCopy,
  buildConversionPromptInstructions,
  buildUrgencyBlock,
} from '@/skills/conversion'
import type { ConversionInput } from '@/skills/conversion'

const baseInput: ConversionInput = {
  businessName: 'Barbearia do João',
  niche: 'barbearia',
  city: 'Rio de Janeiro',
  neighborhood: 'Copacabana',
}

describe('skills/conversion', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getConversionCopy', () => {
    it('should return copy for "barbearia" niche', () => {
      const copy = getConversionCopy('barbearia')
      expect(copy.painPoint).toContain('barbearia')
      expect(copy.heroCta).toBeDefined()
      expect(copy.urgencyCta).toBeDefined()
      expect(copy.objectionHandler).toBeDefined()
    })

    it('should match barbearia niche with partial text like "Barbearia Premium"', () => {
      const copy = getConversionCopy('Barbearia Premium')
      expect(copy.painPoint).toContain('barbearia')
    })

    it('should return copy for "restaurante" niche', () => {
      const copy = getConversionCopy('restaurante')
      expect(copy.painPoint).toBeDefined()
      expect(copy.solution).toBeDefined()
      expect(copy.socialProof).toBeDefined()
      expect(copy.urgencyCta).toBeDefined()
      expect(copy.heroCta).toBeDefined()
    })

    it('should return copy for "estetica" niche', () => {
      const copy = getConversionCopy('estetica')
      expect(copy.heroCta).toBeDefined()
      expect(copy.painPoint).toBeDefined()
    })

    it('should return copy for "mecanica" niche', () => {
      const copy = getConversionCopy('mecanica')
      expect(copy.heroCta).toBeDefined()
      expect(copy.painPoint).toBeDefined()
    })

    it('should return default copy for unknown niche', () => {
      const copy = getConversionCopy('padaria')
      expect(copy.painPoint).toBeDefined()
      expect(copy.solution).toBeDefined()
      expect(copy.socialProof).toBeDefined()
      expect(copy.urgencyCta).toBeDefined()
      expect(copy.heroCta).toBeDefined()
      expect(copy.objectionHandler).toBeDefined()
    })

    it('should return default copy for empty string', () => {
      const copy = getConversionCopy('')
      expect(copy).toBeDefined()
      expect(copy.painPoint).toBeDefined()
    })

    it('should return copy with all required fields for every niche', () => {
      const niches = ['barbearia', 'restaurante', 'estetica', 'mecanica', 'unknown']
      niches.forEach((niche) => {
        const copy = getConversionCopy(niche)
        expect(copy.painPoint).toBeTruthy()
        expect(copy.solution).toBeTruthy()
        expect(copy.socialProof).toBeTruthy()
        expect(copy.urgencyCta).toBeTruthy()
        expect(copy.heroCta).toBeTruthy()
      })
    })

    it('should be case-insensitive for niche matching', () => {
      const lower = getConversionCopy('barbearia')
      const upper = getConversionCopy('BARBEARIA')
      expect(lower.painPoint).toBe(upper.painPoint)
    })
  })

  describe('buildConversionPromptInstructions', () => {
    it('should return a non-empty string', () => {
      const result = buildConversionPromptInstructions(baseInput)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should reference the pain point (DOR) of the niche', () => {
      const result = buildConversionPromptInstructions(baseInput)
      expect(result).toContain('DOR')
    })

    it('should include instruction to direct to WhatsApp', () => {
      const result = buildConversionPromptInstructions(baseInput)
      expect(result).toContain('WhatsApp')
    })

    it('should use default differentials when not provided', () => {
      const result = buildConversionPromptInstructions(baseInput)
      expect(result).toContain('qualidade')
      expect(result).toContain('rapidez')
    })

    it('should use custom differentials when provided', () => {
      const input: ConversionInput = {
        ...baseInput,
        differentials: ['estacionamento gratuito', 'wifi'],
      }
      const result = buildConversionPromptInstructions(input)
      expect(result).toContain('estacionamento gratuito')
      expect(result).toContain('wifi')
    })

    it('should include instruction about language style', () => {
      const result = buildConversionPromptInstructions(baseInput)
      expect(result).toContain('Linguagem')
    })

    it('should handle input without neighborhood', () => {
      const input: ConversionInput = { ...baseInput, neighborhood: undefined }
      const result = buildConversionPromptInstructions(input)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('buildUrgencyBlock', () => {
    it('should return a non-empty string for barbearia', () => {
      const result = buildUrgencyBlock('barbearia')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should return a non-empty string for restaurante', () => {
      const result = buildUrgencyBlock('restaurante')
      expect(result).toBeTruthy()
    })

    it('should return a non-empty string for unknown niche', () => {
      const result = buildUrgencyBlock('padaria')
      expect(result).toBeTruthy()
    })

    it('should return a non-empty string for empty string input', () => {
      const result = buildUrgencyBlock('')
      expect(result).toBeTruthy()
    })

    it('should delegate to getConversionCopy urgencyCta', () => {
      const copy = getConversionCopy('barbearia')
      const block = buildUrgencyBlock('barbearia')
      expect(block).toBe(copy.urgencyCta)
    })
  })
})
