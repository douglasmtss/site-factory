import {
  buildSeoKeywords,
  buildSeoMeta,
  buildSeoPromptInstructions,
} from '@/skills/seo'
import type { SeoInput } from '@/skills/seo'

const baseInput: SeoInput = {
  businessName: 'Barbearia do João',
  niche: 'Barbearia',
  city: 'Rio de Janeiro',
  neighborhood: 'Copacabana',
  services: ['corte masculino', 'barba'],
}

const inputWithoutNeighborhood: SeoInput = {
  businessName: 'Barbearia do João',
  niche: 'Barbearia',
  city: 'Rio de Janeiro',
}

describe('skills/seo', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('buildSeoKeywords', () => {
    it('should return an array of keywords', () => {
      const result = buildSeoKeywords(baseInput)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should include niche + city keyword', () => {
      const result = buildSeoKeywords(baseInput)
      expect(result).toContain('Barbearia em Rio de Janeiro')
      expect(result).toContain('Barbearia Rio de Janeiro')
    })

    it('should include "melhor niche em city" keyword', () => {
      const result = buildSeoKeywords(baseInput)
      expect(result).toContain('melhor Barbearia em Rio de Janeiro')
    })

    it('should include "niche perto de mim" keyword', () => {
      const result = buildSeoKeywords(baseInput)
      expect(result).toContain('Barbearia perto de mim')
    })

    it('should include neighborhood keywords when neighborhood is provided', () => {
      const result = buildSeoKeywords(baseInput)
      expect(result).toContain('Barbearia em Copacabana')
      expect(result).toContain('Barbearia Copacabana Rio de Janeiro')
      expect(result).toContain('Barbearia Copacabana')
    })

    it('should not include neighborhood keywords when neighborhood is not provided', () => {
      const result = buildSeoKeywords(inputWithoutNeighborhood)
      const hasUndefined = result.some((k) => k.includes('undefined'))
      expect(hasUndefined).toBe(false)
    })

    it('should include service keywords when services are provided', () => {
      const result = buildSeoKeywords(baseInput)
      expect(result).toContain('corte masculino em Rio de Janeiro')
      expect(result).toContain('barba em Rio de Janeiro')
    })

    it('should use empty services array when services is not provided', () => {
      const result = buildSeoKeywords(inputWithoutNeighborhood)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should include business name in lowercase', () => {
      const result = buildSeoKeywords(baseInput)
      expect(result).toContain('barbearia do joão')
    })

    it('should handle empty services array', () => {
      const input: SeoInput = { ...baseInput, services: [] }
      const result = buildSeoKeywords(input)
      expect(Array.isArray(result)).toBe(true)
      expect(result).toContain('Barbearia em Rio de Janeiro')
    })
  })

  describe('buildSeoMeta', () => {
    it('should return metaTitle, metaDescription, h1, keywords, localKeywords and structuredData', () => {
      const result = buildSeoMeta(baseInput)
      expect(result.metaTitle).toBeDefined()
      expect(result.metaDescription).toBeDefined()
      expect(result.h1).toBeDefined()
      expect(result.keywords).toBeDefined()
      expect(result.localKeywords).toBeDefined()
      expect(result.structuredData).toBeDefined()
    })

    it('should include neighborhood in metaTitle when provided', () => {
      const result = buildSeoMeta(baseInput)
      expect(result.metaTitle).toContain('Copacabana')
      expect(result.metaTitle).toContain('Rio de Janeiro')
    })

    it('should use city only in metaTitle when neighborhood is not provided', () => {
      const result = buildSeoMeta(inputWithoutNeighborhood)
      expect(result.metaTitle).toContain('Rio de Janeiro')
      expect(result.metaTitle).not.toContain('undefined')
    })

    it('should include WhatsApp mention in metaTitle', () => {
      const result = buildSeoMeta(baseInput)
      expect(result.metaTitle).toContain('WhatsApp')
    })

    it('should build metaDescription containing the city', () => {
      const result = buildSeoMeta(baseInput)
      expect(result.metaDescription).toContain('Rio de Janeiro')
    })

    it('should build h1 containing niche and location', () => {
      const result = buildSeoMeta(baseInput)
      expect(result.h1).toContain('Barbearia')
      expect(result.h1).toContain('Rio de Janeiro')
    })

    it('should return valid JSON-LD structured data with schema.org context', () => {
      const result = buildSeoMeta(baseInput)
      expect(result.structuredData['@context']).toBe('https://schema.org')
      expect(result.structuredData['@type']).toBe('LocalBusiness')
    })

    it('should include addressLocality in structuredData', () => {
      const result = buildSeoMeta(baseInput)
      const address = result.structuredData['address'] as Record<string, string>
      expect(address.addressLocality).toBe('Rio de Janeiro')
    })

    it('should include localKeywords for city', () => {
      const result = buildSeoMeta(baseInput)
      expect(result.localKeywords).toContain('Barbearia em Rio de Janeiro')
    })

    it('should include localKeywords for neighborhood when provided', () => {
      const result = buildSeoMeta(baseInput)
      expect(result.localKeywords).toContain('Barbearia em Copacabana')
    })

    it('should not include neighborhood localKeyword when not provided', () => {
      const result = buildSeoMeta(inputWithoutNeighborhood)
      expect(result.localKeywords).toHaveLength(1)
      expect(result.localKeywords[0]).toContain('Rio de Janeiro')
    })

    it('should include keywords array with multiple items', () => {
      const result = buildSeoMeta(baseInput)
      expect(result.keywords.length).toBeGreaterThan(0)
    })
  })

  describe('buildSeoPromptInstructions', () => {
    it('should return a non-empty string', () => {
      const result = buildSeoPromptInstructions(baseInput)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should include niche in instructions', () => {
      const result = buildSeoPromptInstructions(baseInput)
      expect(result).toContain('Barbearia')
    })

    it('should include city in instructions', () => {
      const result = buildSeoPromptInstructions(baseInput)
      expect(result).toContain('Rio de Janeiro')
    })

    it('should include neighborhood reference when provided', () => {
      const result = buildSeoPromptInstructions(baseInput)
      expect(result).toContain('bairro Copacabana')
    })

    it('should not include bairro mention when neighborhood is not provided', () => {
      const result = buildSeoPromptInstructions(inputWithoutNeighborhood)
      expect(result).not.toContain('bairro')
    })

    it('should include WhatsApp CTA instruction', () => {
      const result = buildSeoPromptInstructions(baseInput)
      expect(result).toContain('WhatsApp')
    })

    it('should include SEO instructions header', () => {
      const result = buildSeoPromptInstructions(baseInput)
      expect(result).toContain('SEO LOCAL')
    })
  })
})
