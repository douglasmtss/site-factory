import type { BusinessInput } from '@/types'

// ──────────────────────────────────────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────────────────────────────────────
const mockPlannerAgent = jest.fn()
const mockCopywriterAgent = jest.fn()
const mockUiAgent = jest.fn()
const mockCodeAgent = jest.fn()
const mockDeployAgent = jest.fn()
const mockBuildWhatsAppLink = jest.fn()
const mockConnectMongo = jest.fn()
const mockSiteCreate = jest.fn()
const mockDetectNiche = jest.fn()

jest.mock('@/agents/planner', () => ({
  plannerAgent: mockPlannerAgent,
  detectNiche: mockDetectNiche,
}))

jest.mock('@/agents/copywriter', () => ({
  copywriterAgent: mockCopywriterAgent,
}))

jest.mock('@/agents/ui', () => ({
  uiAgent: mockUiAgent,
}))

jest.mock('@/agents/code', () => ({
  codeAgent: mockCodeAgent,
}))

jest.mock('@/agents/deploy', () => ({
  deployAgent: mockDeployAgent,
}))

jest.mock('@/skills/whatsapp', () => ({
  buildWhatsAppLink: mockBuildWhatsAppLink,
}))

jest.mock('@/lib/mongodb', () => ({
  connectMongo: mockConnectMongo,
}))

jest.mock('@/models/Site', () => ({
  Site: {
    create: mockSiteCreate,
  },
}))

import { createSite } from '@/lib/orchestrator'

// ──────────────────────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────────────────────
const mockPlan = {
  niche: 'Barbearia',
  businessName: 'Barbearia do João',
  city: 'Rio de Janeiro',
  neighborhood: 'Copacabana',
  sections: ['hero', 'services', 'about', 'contact'],
  colorScheme: { primary: '#1a1a2e', secondary: '#e94560' },
  targetAudience: 'Homens adultos',
  tone: 'moderno',
}

const mockContent = {
  title: 'Barbearia do João',
  tagline: 'O melhor corte',
  description: 'Barbearia premium',
  hero: { headline: 'Título', subheadline: 'Sub', cta: 'CTA' },
  about: { title: 'Sobre', text: 'Texto' },
  services: [{ name: 'Corte', description: 'Desc', icon: '✂️' }],
  contact: { cta: 'Contato', whatsappText: 'Olá' },
  seoMeta: { title: 'SEO', description: 'Desc SEO', keywords: ['kw1'] },
}

const mockDesign = {
  primaryColor: '#1a1a2e',
  secondaryColor: '#e94560',
  accentColor: '#f5a623',
  fontFamily: "'Inter', sans-serif",
  style: 'premium',
  layout: 'landing',
}

const mockGeneratedCode = {
  html: '<html><body>Site</body></html>',
  slug: 'barbearia-joao-rj-abc1',
}

const mockSavedSite = {
  _id: 'mongo-id-123',
  createdAt: new Date('2024-01-01'),
}

const defaultInput: BusinessInput = {
  business: 'Barbearia do João',
  city: 'Rio de Janeiro',
  neighborhood: 'Copacabana',
  whatsapp: '5521999999999',
}

// ──────────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────────
describe('lib/orchestrator', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'log').mockImplementation(() => {})

    // Happy-path defaults
    mockPlannerAgent.mockResolvedValue({ success: true, data: mockPlan })
    mockCopywriterAgent.mockResolvedValue({ success: true, data: mockContent })
    mockUiAgent.mockReturnValue({ success: true, data: mockDesign })
    mockCodeAgent.mockReturnValue({ success: true, data: mockGeneratedCode })
    mockDeployAgent.mockResolvedValue({
      success: true,
      data: { url: 'https://barbearia-joao.vercel.app', provider: 'vercel', slug: 'barbearia-joao-rj-abc1' },
    })
    mockBuildWhatsAppLink.mockReturnValue('https://wa.me/5521999999999?text=Ol%C3%A1')
    mockConnectMongo.mockResolvedValue(undefined)
    mockSiteCreate.mockResolvedValue(mockSavedSite)
    mockDetectNiche.mockReturnValue('Barbearia')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('createSite', () => {
    it('should return success: true on a full happy-path run', async () => {
      const result = await createSite(defaultInput)

      expect(result.success).toBe(true)
    })

    it('should call plannerAgent with the original input', async () => {
      await createSite(defaultInput)

      expect(mockPlannerAgent).toHaveBeenCalledWith(defaultInput)
    })

    it('should call copywriterAgent with input and the plan', async () => {
      await createSite(defaultInput)

      expect(mockCopywriterAgent).toHaveBeenCalledWith(defaultInput, mockPlan)
    })

    it('should call uiAgent with the plan', async () => {
      await createSite(defaultInput)

      expect(mockUiAgent).toHaveBeenCalledWith(mockPlan)
    })

    it('should call codeAgent with content, design, whatsapp number and slug', async () => {
      await createSite(defaultInput)

      expect(mockCodeAgent).toHaveBeenCalledWith(
        mockContent,
        mockDesign,
        defaultInput.whatsapp,
        expect.any(String)
      )
    })

    it('should call deployAgent with the HTML and slug', async () => {
      await createSite(defaultInput)

      expect(mockDeployAgent).toHaveBeenCalledWith(
        mockGeneratedCode.html,
        expect.any(String)
      )
    })

    it('should call connectMongo before Site.create', async () => {
      const order: string[] = []
      mockConnectMongo.mockImplementation(() => { order.push('connect'); return Promise.resolve() })
      mockSiteCreate.mockImplementation(() => { order.push('create'); return Promise.resolve(mockSavedSite) })

      await createSite(defaultInput)

      expect(order).toEqual(['connect', 'create'])
    })

    it('should return the deploy URL in the result', async () => {
      const result = await createSite(defaultInput)

      expect(result.url).toBe('https://barbearia-joao.vercel.app')
    })

    it('should return a fallback URL when deployAgent has no URL', async () => {
      mockDeployAgent.mockResolvedValue({
        success: true,
        data: { url: undefined, provider: 'local', slug: 'slug' },
      })

      const result = await createSite(defaultInput)

      expect(result.url).toContain('/s/')
    })

    it('should include the site slug in the result', async () => {
      const result = await createSite(defaultInput)

      expect(result.site?.slug).toBeDefined()
    })

    it('should fall back to process.env.WHATSAPP_NUMBER when input.whatsapp is not set', async () => {
      const originalEnv = process.env.WHATSAPP_NUMBER
      process.env.WHATSAPP_NUMBER = '5511888888888'
      const inputWithoutWhatsapp: BusinessInput = { business: 'Test', city: 'SP' }

      await createSite(inputWithoutWhatsapp)

      expect(mockCodeAgent).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        '5511888888888',
        expect.any(String)
      )

      process.env.WHATSAPP_NUMBER = originalEnv
    })

    it('should use default whatsapp number when both input.whatsapp and env are absent', async () => {
      const originalEnv = process.env.WHATSAPP_NUMBER
      delete process.env.WHATSAPP_NUMBER
      const inputWithoutWhatsapp: BusinessInput = { business: 'Test', city: 'SP' }

      await createSite(inputWithoutWhatsapp)

      expect(mockCodeAgent).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        '5521999999999',
        expect.any(String)
      )

      process.env.WHATSAPP_NUMBER = originalEnv
    })

    // ── Error paths ──────────────────────────────────────────────────────────

    it('should return success: false when plannerAgent fails', async () => {
      mockPlannerAgent.mockResolvedValue({ success: false, error: 'GPT timeout' })

      const result = await createSite(defaultInput)

      expect(result.success).toBe(false)
      expect(result.error).toContain('PlannerAgent')
    })

    it('should return success: false when plannerAgent returns no data', async () => {
      mockPlannerAgent.mockResolvedValue({ success: true, data: null })

      const result = await createSite(defaultInput)

      expect(result.success).toBe(false)
    })

    it('should return success: false when copywriterAgent fails', async () => {
      mockCopywriterAgent.mockResolvedValue({ success: false, error: 'Rate limit' })

      const result = await createSite(defaultInput)

      expect(result.success).toBe(false)
      expect(result.error).toContain('CopywriterAgent')
    })

    it('should return success: false when copywriterAgent returns no data', async () => {
      mockCopywriterAgent.mockResolvedValue({ success: true, data: null })

      const result = await createSite(defaultInput)

      expect(result.success).toBe(false)
    })

    it('should return success: false when uiAgent fails', async () => {
      mockUiAgent.mockReturnValue({ success: false, error: 'Unknown niche' })

      const result = await createSite(defaultInput)

      expect(result.success).toBe(false)
      expect(result.error).toContain('UIAgent')
    })

    it('should return success: false when codeAgent fails', async () => {
      mockCodeAgent.mockReturnValue({ success: false, error: 'HTML generation failed' })

      const result = await createSite(defaultInput)

      expect(result.success).toBe(false)
      expect(result.error).toContain('CodeAgent')
    })

    it('should still succeed (status draft) when deployAgent fails', async () => {
      mockDeployAgent.mockResolvedValue({ success: false, error: 'Vercel error' })

      const result = await createSite(defaultInput)

      expect(result.success).toBe(true)
      expect(result.site?.status).toBe('draft')
    })

    it('should return success: false when Site.create throws', async () => {
      mockSiteCreate.mockRejectedValue(new Error('MongoDB write error'))

      const result = await createSite(defaultInput)

      expect(result.success).toBe(false)
      expect(result.error).toContain('MongoDB write error')
    })

    it('should return success: false when connectMongo throws', async () => {
      mockConnectMongo.mockRejectedValue(new Error('Connection refused'))

      const result = await createSite(defaultInput)

      expect(result.success).toBe(false)
    })

    it('should set status to "published" when deployAgent succeeds', async () => {
      const result = await createSite(defaultInput)

      expect(result.site?.status).toBe('published')
    })

    it('should use NEXT_PUBLIC_BASE_URL in fallback URL when deployAgent fails and env is set', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_BASE_URL
      process.env.NEXT_PUBLIC_BASE_URL = 'https://meusite.com'
      mockDeployAgent.mockResolvedValue({ success: false, error: 'Vercel error' })

      const result = await createSite(defaultInput)

      expect(result.url).toContain('https://meusite.com')
      process.env.NEXT_PUBLIC_BASE_URL = originalEnv
    })
  })
})
