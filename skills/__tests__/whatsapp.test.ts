import {
  buildWhatsAppLink,
  buildWhatsAppButton,
  buildCtaSection,
  buildFloatingWhatsApp,
} from '@/skills/whatsapp'
import type { WhatsAppInput } from '@/skills/whatsapp'

const baseInput: WhatsAppInput = {
  number: '5521999999999',
  businessName: 'Barbearia do João',
  niche: 'Barbearia',
  context: 'contato',
}

describe('skills/whatsapp', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('buildWhatsAppLink', () => {
    it('should return a valid wa.me URL', () => {
      const link = buildWhatsAppLink(baseInput)
      expect(link).toMatch(/^https:\/\/wa\.me\/\d+/)
    })

    it('should include the sanitized phone number in the URL', () => {
      const link = buildWhatsAppLink(baseInput)
      expect(link).toContain('wa.me/5521999999999')
    })

    it('should sanitize number with spaces and special characters', () => {
      const link = buildWhatsAppLink({ ...baseInput, number: '+55 (21) 99999-9999' })
      expect(link).toContain('wa.me/5521999999999')
    })

    it('should include an encoded text parameter', () => {
      const link = buildWhatsAppLink(baseInput)
      expect(link).toContain('text=')
    })

    it('should include the business name in the message', () => {
      const link = buildWhatsAppLink(baseInput)
      const decoded = decodeURIComponent(link.split('text=')[1])
      expect(decoded).toContain('Barbearia do João')
    })

    it('should use agenda message for "agenda" context', () => {
      const link = buildWhatsAppLink({ ...baseInput, context: 'agenda' })
      const decoded = decodeURIComponent(link.split('text=')[1])
      expect(decoded).toContain('agendar')
    })

    it('should use pedido message for "pedido" context', () => {
      const link = buildWhatsAppLink({ ...baseInput, context: 'pedido' })
      const decoded = decodeURIComponent(link.split('text=')[1])
      expect(decoded).toContain('pedido')
    })

    it('should use orcamento message for "orcamento" context', () => {
      const link = buildWhatsAppLink({ ...baseInput, context: 'orcamento' })
      const decoded = decodeURIComponent(link.split('text=')[1])
      expect(decoded).toContain('orçamento')
    })

    it('should use contato message for "contato" context', () => {
      const link = buildWhatsAppLink({ ...baseInput, context: 'contato' })
      const decoded = decodeURIComponent(link.split('text=')[1])
      expect(decoded).toContain('informações')
    })

    it('should fall back to contato message when context is undefined', () => {
      const input: WhatsAppInput = {
        number: '5521999999999',
        businessName: 'Test',
        niche: 'Test',
      }
      const link = buildWhatsAppLink(input)
      expect(link).toContain('text=')
    })
  })

  describe('buildWhatsAppButton', () => {
    it('should return an object with href, label and ariaLabel', () => {
      const button = buildWhatsAppButton(baseInput)
      expect(button.href).toBeDefined()
      expect(button.label).toBeDefined()
      expect(button.ariaLabel).toBeDefined()
    })

    it('should generate a valid wa.me href', () => {
      const button = buildWhatsAppButton(baseInput)
      expect(button.href).toMatch(/wa\.me/)
    })

    it('should use a custom label when provided', () => {
      const button = buildWhatsAppButton(baseInput, 'Meu Botão Customizado')
      expect(button.label).toBe('Meu Botão Customizado')
    })

    it('should use agenda default label for "agenda" context', () => {
      const button = buildWhatsAppButton({ ...baseInput, context: 'agenda' })
      expect(button.label).toContain('Agendar')
    })

    it('should use pedido default label for "pedido" context', () => {
      const button = buildWhatsAppButton({ ...baseInput, context: 'pedido' })
      expect(button.label).toContain('pedido')
    })

    it('should use orcamento default label for "orcamento" context', () => {
      const button = buildWhatsAppButton({ ...baseInput, context: 'orcamento' })
      expect(button.label).toContain('orçamento')
    })

    it('should use contato default label for "contato" context', () => {
      const button = buildWhatsAppButton({ ...baseInput, context: 'contato' })
      expect(button.label).toBeTruthy()
    })

    it('should include business name in ariaLabel', () => {
      const button = buildWhatsAppButton(baseInput)
      expect(button.ariaLabel).toContain('Barbearia do João')
    })

    it('should handle undefined context gracefully', () => {
      const input: WhatsAppInput = {
        number: '5521999999999',
        businessName: 'Test',
        niche: 'Test',
      }
      const button = buildWhatsAppButton(input)
      expect(button.label).toBeTruthy()
    })
  })

  describe('buildCtaSection', () => {
    it('should return headline, subheadline, buttonLabel and link', () => {
      const cta = buildCtaSection(baseInput)
      expect(cta.headline).toBeDefined()
      expect(cta.subheadline).toBeDefined()
      expect(cta.buttonLabel).toBeDefined()
      expect(cta.link).toBeDefined()
    })

    it('should include business name in headline', () => {
      const cta = buildCtaSection(baseInput)
      expect(cta.headline).toContain('Barbearia do João')
    })

    it('should include niche in subheadline', () => {
      const cta = buildCtaSection(baseInput)
      expect(cta.subheadline).toContain('Barbearia')
    })

    it('should generate a valid WhatsApp link', () => {
      const cta = buildCtaSection(baseInput)
      expect(cta.link).toMatch(/wa\.me/)
    })

    it('should include WhatsApp mention in buttonLabel', () => {
      const cta = buildCtaSection(baseInput)
      expect(cta.buttonLabel).toContain('WhatsApp')
    })
  })

  describe('buildFloatingWhatsApp', () => {
    it('should return number and link', () => {
      const result = buildFloatingWhatsApp('5521999999999')
      expect(result.number).toBeDefined()
      expect(result.link).toBeDefined()
    })

    it('should return exact sanitized number', () => {
      const result = buildFloatingWhatsApp('5521999999999')
      expect(result.number).toBe('5521999999999')
    })

    it('should generate a valid wa.me link', () => {
      const result = buildFloatingWhatsApp('5521999999999')
      expect(result.link).toBe('https://wa.me/5521999999999')
    })

    it('should remove non-digit characters from number', () => {
      const result = buildFloatingWhatsApp('+55 (21) 99999-9999')
      expect(result.number).toBe('5521999999999')
      expect(result.link).toBe('https://wa.me/5521999999999')
    })

    it('should handle number with parentheses and dashes', () => {
      const result = buildFloatingWhatsApp('(21) 9 9999-9999')
      expect(result.number).toBe('21999999999')
    })
  })
})
