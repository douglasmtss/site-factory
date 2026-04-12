import type { NextRequest } from 'next/server'
import type { BusinessInput } from '@/types'

// ──────────────────────────────────────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────────────────────────────────────
const mockCreateSite = jest.fn()
const mockNextResponseJson = jest.fn()

jest.mock('@/lib/orchestrator', () => ({
  createSite: mockCreateSite,
}))

jest.mock('next/server', () => ({
  NextResponse: {
    json: mockNextResponseJson,
  },
}))

import { POST } from '@/app/api/generate/route'

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
function createMockRequest(body: unknown): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest
}

// ──────────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────────
describe('app/api/generate/route', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockCreateSite.mockReset()
    mockNextResponseJson.mockReset()
    mockNextResponseJson.mockImplementation((data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      body: data,
    }))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('POST', () => {
    it('should return 200 and success: true for a valid request', async () => {
      const mockSite = { slug: 'barbearia-joao', status: 'published' } as unknown as BusinessInput
      mockCreateSite.mockResolvedValueOnce({
        success: true,
        url: 'https://barbearia-joao.vercel.app',
        site: mockSite,
      })

      await POST(createMockRequest({ business: 'Barbearia do João', city: 'Rio de Janeiro' }))

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      )
    })

    it('should include url and slug in the success response', async () => {
      mockCreateSite.mockResolvedValueOnce({
        success: true,
        url: 'https://barbearia.vercel.app',
        site: { slug: 'barbearia-rj-abc1' },
      })

      await POST(createMockRequest({ business: 'Barbearia', city: 'RJ' }))

      const [responseBody] = mockNextResponseJson.mock.calls[0]
      expect(responseBody).toMatchObject({
        success: true,
        url: 'https://barbearia.vercel.app',
        slug: 'barbearia-rj-abc1',
      })
    })

    it('should return 400 when "business" field is missing', async () => {
      await POST(createMockRequest({ city: 'Rio de Janeiro' }))

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 400 }
      )
      expect(mockCreateSite).not.toHaveBeenCalled()
    })

    it('should return 400 when "city" field is missing', async () => {
      await POST(createMockRequest({ business: 'Barbearia' }))

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 400 }
      )
      expect(mockCreateSite).not.toHaveBeenCalled()
    })

    it('should return 400 when both "business" and "city" are missing', async () => {
      await POST(createMockRequest({}))

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 400 }
      )
    })

    it('should return 400 when business is empty string', async () => {
      await POST(createMockRequest({ business: '', city: 'RJ' }))

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 400 }
      )
    })

    it('should return 400 when city is empty string', async () => {
      await POST(createMockRequest({ business: 'Barbearia', city: '' }))

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 400 }
      )
    })

    it('should return 500 when createSite returns success: false', async () => {
      mockCreateSite.mockResolvedValueOnce({ success: false, error: 'PlannerAgent: timeout' })

      await POST(createMockRequest({ business: 'Barbearia', city: 'RJ' }))

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'PlannerAgent: timeout' }),
        { status: 500 }
      )
    })

    it('should return 500 when request.json() throws', async () => {
      const badRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as NextRequest

      await POST(badRequest)

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'Erro interno no servidor.' }),
        { status: 500 }
      )
    })

    it('should return 500 when createSite throws unexpectedly', async () => {
      mockCreateSite.mockRejectedValueOnce(new Error('Unexpected crash'))

      await POST(createMockRequest({ business: 'Barbearia', city: 'RJ' }))

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 500 }
      )
    })

    it('should pass the full request body to createSite', async () => {
      mockCreateSite.mockResolvedValueOnce({ success: true, url: 'http://x', site: { slug: 's' } })
      const body = { business: 'Barbearia', city: 'RJ', neighborhood: 'Copacabana', whatsapp: '553299999' }

      await POST(createMockRequest(body))

      expect(mockCreateSite).toHaveBeenCalledWith(
        expect.objectContaining({ business: 'Barbearia', city: 'RJ', neighborhood: 'Copacabana' })
      )
    })
  })
})
