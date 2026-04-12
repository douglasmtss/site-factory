// ──────────────────────────────────────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────────────────────────────────────
const mockLean = jest.fn()
const mockLimit = jest.fn(() => ({ lean: mockLean }))
const mockSort = jest.fn(() => ({ limit: mockLimit }))
const mockSelect = jest.fn(() => ({ sort: mockSort }))
const mockFind = jest.fn(() => ({ select: mockSelect }))
const mockConnectMongo = jest.fn()
const mockNextResponseJson = jest.fn()

jest.mock('@/lib/mongodb', () => ({
  connectMongo: mockConnectMongo,
}))

jest.mock('@/models/Site', () => ({
  Site: {
    find: mockFind,
  },
}))

jest.mock('next/server', () => ({
  NextResponse: {
    json: mockNextResponseJson,
  },
}))

import { GET } from '@/app/api/sites/route'

// ──────────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────────
describe('app/api/sites/route', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockConnectMongo.mockReset()
    mockFind.mockReset()
    mockSelect.mockReset()
    mockSort.mockReset()
    mockLimit.mockReset()
    mockLean.mockReset()
    mockNextResponseJson.mockReset()

    // Restore the chain after each reset
    mockFind.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ sort: mockSort })
    mockSort.mockReturnValue({ limit: mockLimit })
    mockLimit.mockReturnValue({ lean: mockLean })

    mockNextResponseJson.mockImplementation((data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      body: data,
    }))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET', () => {
    it('should return success: true with a list of sites', async () => {
      mockConnectMongo.mockResolvedValueOnce(undefined)
      const fakeSites = [
        { slug: 'barbearia-rj', businessName: 'Barbearia', city: 'RJ', niche: 'Barbearia' },
        { slug: 'hamburgeria-sp', businessName: 'Burguer', city: 'SP', niche: 'Hamburgeria' },
      ]
      mockLean.mockResolvedValueOnce(fakeSites)

      await GET()

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, total: 2, sites: fakeSites })
      )
    })

    it('should return an empty sites array when there are no sites', async () => {
      mockConnectMongo.mockResolvedValueOnce(undefined)
      mockLean.mockResolvedValueOnce([])

      await GET()

      const [body] = mockNextResponseJson.mock.calls[0]
      expect(body.success).toBe(true)
      expect(body.total).toBe(0)
      expect(body.sites).toEqual([])
    })

    it('should call connectMongo before querying', async () => {
      const order: string[] = []
      mockConnectMongo.mockImplementation(() => { order.push('connect'); return Promise.resolve() })
      mockLean.mockImplementation(() => { order.push('lean'); return Promise.resolve([]) })

      await GET()

      expect(order).toEqual(['connect', 'lean'])
    })

    it('should call Site.find with an empty filter', async () => {
      mockConnectMongo.mockResolvedValueOnce(undefined)
      mockLean.mockResolvedValueOnce([])

      await GET()

      expect(mockFind).toHaveBeenCalledWith({})
    })

    it('should call .select with the expected fields', async () => {
      mockConnectMongo.mockResolvedValueOnce(undefined)
      mockLean.mockResolvedValueOnce([])

      await GET()

      expect(mockSelect).toHaveBeenCalledWith(
        expect.stringContaining('slug')
      )
    })

    it('should call .sort with createdAt descending', async () => {
      mockConnectMongo.mockResolvedValueOnce(undefined)
      mockLean.mockResolvedValueOnce([])

      await GET()

      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 })
    })

    it('should call .limit(100)', async () => {
      mockConnectMongo.mockResolvedValueOnce(undefined)
      mockLean.mockResolvedValueOnce([])

      await GET()

      expect(mockLimit).toHaveBeenCalledWith(100)
    })

    it('should return total matching the length of sites', async () => {
      mockConnectMongo.mockResolvedValueOnce(undefined)
      mockLean.mockResolvedValueOnce(new Array(25).fill({ slug: 'x' }))

      await GET()

      const [body] = mockNextResponseJson.mock.calls[0]
      expect(body.total).toBe(25)
    })

    it('should return 500 when connectMongo throws', async () => {
      mockConnectMongo.mockRejectedValueOnce(new Error('MongoDB unavailable'))

      await GET()

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'Erro ao buscar sites.' }),
        { status: 500 }
      )
    })

    it('should return 500 when Site.find().lean() throws', async () => {
      mockConnectMongo.mockResolvedValueOnce(undefined)
      mockLean.mockRejectedValueOnce(new Error('Query failed'))

      await GET()

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 500 }
      )
    })
  })
})
