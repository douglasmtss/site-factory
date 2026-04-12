import { codeAgent } from '@/agents/code'
import type { SiteContent, SiteDesign } from '@/types'
import * as whatsappModule from '@/skills/whatsapp'

const mockContent: SiteContent = {
  title: 'Barbearia do João',
  tagline: 'O melhor corte da região',
  description: 'Barbearia premium em Copacabana com atendimento personalizado',
  hero: {
    headline: 'Corte masculino em Copacabana',
    subheadline: 'Agende seu horário em segundos direto pelo WhatsApp',
    cta: 'Agendar pelo WhatsApp',
  },
  about: {
    title: 'Sobre nós',
    text: 'Somos a barbearia mais premiada de Copacabana com mais de 5 anos de experiência',
  },
  services: [
    { name: 'Corte Masculino', description: 'Corte clássico ou moderno', icon: '✂️' },
    { name: 'Barba Completa', description: 'Barba feita com navalha', icon: '💈' },
    { name: 'Sobrancelha', description: 'Design de sobrancelha', icon: '⭐' },
  ],
  contact: {
    cta: 'Pronto para ser atendido?',
    whatsappText: 'Olá! Vim pelo site e quero agendar um horário',
  },
  seoMeta: {
    title: 'Barbearia do João — Copacabana RJ | Atendimento via WhatsApp',
    description: 'Barbearia premium em Copacabana. Corte masculino e barba com qualidade.',
    keywords: ['barbearia copacabana', 'corte masculino rj', 'barba copacabana'],
  },
}

const mockDesign: SiteDesign = {
  primaryColor: '#1a1a2e',
  secondaryColor: '#e94560',
  accentColor: '#f5a623',
  fontFamily: "'Playfair Display', serif",
  style: 'premium',
  layout: 'landing',
}

describe('agents/code', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('codeAgent', () => {
    it('should return success: true', () => {
      const result = codeAgent(mockContent, mockDesign, '5521999999999', 'barbearia-joao-rj')
      expect(result.success).toBe(true)
    })

    it('should return an object with html and slug', () => {
      const result = codeAgent(mockContent, mockDesign, '5521999999999', 'barbearia-joao-rj')
      expect(result.data?.html).toBeDefined()
      expect(result.data?.slug).toBe('barbearia-joao-rj')
    })

    it('should generate HTML starting with DOCTYPE declaration', () => {
      const result = codeAgent(mockContent, mockDesign, '5521999999999', 'barbearia-joao-rj')
      expect(result.data?.html).toMatch(/^<!DOCTYPE html>/i)
    })

    it('should include the business title in the HTML', () => {
      const result = codeAgent(mockContent, mockDesign, '5521999999999', 'barbearia-joao-rj')
      expect(result.data?.html).toContain('Barbearia do João')
    })

    it('should include the hero headline in the HTML', () => {
      const result = codeAgent(mockContent, mockDesign, '5521999999999', 'barbearia-joao-rj')
      expect(result.data?.html).toContain('Corte masculino em Copacabana')
    })

    it('should include the WhatsApp phone number in the HTML', () => {
      const result = codeAgent(mockContent, mockDesign, '5521999999999', 'barbearia-joao-rj')
      expect(result.data?.html).toContain('5521999999999')
    })

    it('should include a wa.me link in the HTML', () => {
      const result = codeAgent(mockContent, mockDesign, '5521999999999', 'barbearia-joao-rj')
      expect(result.data?.html).toContain('wa.me')
    })

    it('should include all service names in the HTML', () => {
      const result = codeAgent(mockContent, mockDesign, '5521999999999', 'barbearia-joao-rj')
      expect(result.data?.html).toContain('Corte Masculino')
      expect(result.data?.html).toContain('Barba Completa')
      expect(result.data?.html).toContain('Sobrancelha')
    })

    it('should include service icons in the HTML', () => {
      const result = codeAgent(mockContent, mockDesign, '5521999999999', 'barbearia-joao-rj')
      expect(result.data?.html).toContain('✂️')
      expect(result.data?.html).toContain('💈')
    })

    it('should include meta description in the HTML', () => {
      const result = codeAgent(mockContent, mockDesign, '5521999999999', 'barbearia-joao-rj')
      expect(result.data?.html).toContain('Barbearia premium em Copacabana')
    })

    it('should include meta keywords in the HTML', () => {
      const result = codeAgent(mockContent, mockDesign, '5521999999999', 'barbearia-joao-rj')
      expect(result.data?.html).toContain('barbearia copacabana')
    })

    it('should include primary color CSS variable', () => {
      const result = codeAgent(mockContent, mockDesign, '5521999999999', 'barbearia-joao-rj')
      expect(result.data?.html).toContain('#1a1a2e')
    })

    it('should include floating WhatsApp button in HTML', () => {
      const result = codeAgent(mockContent, mockDesign, '5521999999999', 'barbearia-joao-rj')
      expect(result.data?.html).toContain('floating-wa')
    })

    it('should include lang="pt-BR" in HTML tag', () => {
      const result = codeAgent(mockContent, mockDesign, '5521999999999', 'barbearia-joao-rj')
      expect(result.data?.html).toContain('lang="pt-BR"')
    })

    it('should use default icon "⭐" for services without icon', () => {
      const contentNoIcon: SiteContent = {
        ...mockContent,
        services: [{ name: 'Serviço Sem Ícone', description: 'Descrição' }],
      }
      const result = codeAgent(contentNoIcon, mockDesign, '5521999999999', 'test-slug')
      expect(result.data?.html).toContain('⭐')
    })

    it('should handle empty services array gracefully', () => {
      const contentNoServices: SiteContent = { ...mockContent, services: [] }
      const result = codeAgent(contentNoServices, mockDesign, '5521999999999', 'test-slug')
      expect(result.success).toBe(true)
      expect(result.data?.html).toBeDefined()
    })

    it('should handle undefined services by defaulting to empty array', () => {
      const contentNullServices: SiteContent = {
        ...mockContent,
        services: undefined as unknown as SiteContent['services'],
      }
      const result = codeAgent(contentNullServices, mockDesign, '5521999999999', 'test-slug')
      expect(result.success).toBe(true)
    })

    it('should include the SEO meta title in the <title> tag', () => {
      const result = codeAgent(mockContent, mockDesign, '5521999999999', 'barbearia-joao-rj')
      expect(result.data?.html).toContain(
        '<title>Barbearia do João — Copacabana RJ | Atendimento via WhatsApp</title>'
      )
    })

    it('should return success: false when an internal error is thrown', () => {
      jest.spyOn(whatsappModule, 'buildWhatsAppLink').mockImplementationOnce(() => {
        throw new Error('whatsapp error')
      })
      const result = codeAgent(mockContent, mockDesign, '5521999999999', 'test-slug')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
