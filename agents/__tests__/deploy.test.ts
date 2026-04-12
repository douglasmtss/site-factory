// ts-jest does not hoist const variables into jest.mock factories.
// Use inline jest.fn() in the factory and access mocks through the imported modules.
jest.mock('fs-extra', () => ({
  ensureDir: jest.fn(),
  writeFile: jest.fn(),
}))

jest.mock('axios', () => ({
  post: jest.fn(),
  default: { post: jest.fn() },
}))

import fs from 'fs-extra'
import axios from 'axios'
import { deployLocal, deployVercel, deployAgent } from '@/agents/deploy'

// Typed references to the mock functions
const mockEnsureDir = (fs as unknown as Record<string, jest.Mock>).ensureDir
const mockWriteFile = (fs as unknown as Record<string, jest.Mock>).writeFile
const mockAxiosPost = (axios as unknown as Record<string, jest.Mock>).post

const SAMPLE_HTML = '<html><body>Test</body></html>'
const SAMPLE_SLUG = 'barbearia-joao-rj-abc1'

describe('agents/deploy', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    process.env = { ...originalEnv }
    delete process.env.VERCEL_TOKEN
    delete process.env.NEXT_PUBLIC_BASE_URL
    mockEnsureDir.mockReset()
    mockWriteFile.mockReset()
    mockAxiosPost.mockReset()
  })

  afterEach(() => {
    process.env = originalEnv
    jest.restoreAllMocks()
  })

  describe('deployLocal', () => {
    it('should return success: true when file system operations succeed', async () => {
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockResolvedValue(undefined)

      const result = await deployLocal(SAMPLE_HTML, SAMPLE_SLUG)

      expect(result.success).toBe(true)
    })

    it('should return provider as "local"', async () => {
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockResolvedValue(undefined)

      const result = await deployLocal(SAMPLE_HTML, SAMPLE_SLUG)

      expect(result.data?.provider).toBe('local')
    })

    it('should return the slug', async () => {
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockResolvedValue(undefined)

      const result = await deployLocal(SAMPLE_HTML, SAMPLE_SLUG)

      expect(result.data?.slug).toBe(SAMPLE_SLUG)
    })

    it('should return a URL containing /s/{slug}', async () => {
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockResolvedValue(undefined)

      const result = await deployLocal(SAMPLE_HTML, SAMPLE_SLUG)

      expect(result.data?.url).toContain(`/s/${SAMPLE_SLUG}`)
    })

    it('should use NEXT_PUBLIC_BASE_URL in the returned URL when set', async () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://meusite.com'
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockResolvedValue(undefined)

      const result = await deployLocal(SAMPLE_HTML, SAMPLE_SLUG)

      expect(result.data?.url).toContain('https://meusite.com')
    })

    it('should fall back to localhost:3000 when NEXT_PUBLIC_BASE_URL is not set', async () => {
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockResolvedValue(undefined)

      const result = await deployLocal(SAMPLE_HTML, SAMPLE_SLUG)

      expect(result.data?.url).toContain('localhost:3000')
    })

    it('should call ensureDir twice (for OUTPUT_DIR and siteDir)', async () => {
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockResolvedValue(undefined)

      await deployLocal(SAMPLE_HTML, SAMPLE_SLUG)

      expect(mockEnsureDir).toHaveBeenCalledTimes(2)
    })

    it('should call writeFile once with the HTML content', async () => {
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockResolvedValue(undefined)

      await deployLocal(SAMPLE_HTML, SAMPLE_SLUG)

      expect(mockWriteFile).toHaveBeenCalledTimes(1)
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('index.html'),
        SAMPLE_HTML,
        'utf-8'
      )
    })

    it('should return success: false when ensureDir throws', async () => {
      mockEnsureDir.mockRejectedValue(new Error('Permission denied'))

      const result = await deployLocal(SAMPLE_HTML, SAMPLE_SLUG)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should return success: false when writeFile throws', async () => {
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockRejectedValue(new Error('Disk full'))

      const result = await deployLocal(SAMPLE_HTML, SAMPLE_SLUG)

      expect(result.success).toBe(false)
    })
  })

  describe('deployVercel', () => {
    it('should fall back to deployLocal when VERCEL_TOKEN is not set', async () => {
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockResolvedValue(undefined)

      const result = await deployVercel(SAMPLE_HTML, SAMPLE_SLUG)

      expect(result.success).toBe(true)
      expect(result.data?.provider).toBe('local')
      expect(mockAxiosPost).not.toHaveBeenCalled()
    })

    it('should call Vercel API when VERCEL_TOKEN is set', async () => {
      process.env.VERCEL_TOKEN = 'vercel_test_token'
      mockAxiosPost.mockResolvedValueOnce({ data: { url: 'test-deploy.vercel.app' } })
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockResolvedValue(undefined)

      await deployVercel(SAMPLE_HTML, SAMPLE_SLUG)

      expect(mockAxiosPost).toHaveBeenCalledTimes(1)
      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://api.vercel.com/v13/deployments',
        expect.any(Object),
        expect.any(Object)
      )
    })

    it('should return the URL from Vercel response when available', async () => {
      process.env.VERCEL_TOKEN = 'vercel_test_token'
      mockAxiosPost.mockResolvedValueOnce({ data: { url: 'my-site.vercel.app' } })
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockResolvedValue(undefined)

      const result = await deployVercel(SAMPLE_HTML, SAMPLE_SLUG)

      expect(result.data?.url).toBe('https://my-site.vercel.app')
    })

    it('should use fallback Vercel URL when response has no url field', async () => {
      process.env.VERCEL_TOKEN = 'vercel_test_token'
      mockAxiosPost.mockResolvedValueOnce({ data: {} })
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockResolvedValue(undefined)

      const result = await deployVercel(SAMPLE_HTML, SAMPLE_SLUG)

      expect(result.data?.url).toContain(SAMPLE_SLUG)
      expect(result.data?.url).toContain('vercel.app')
    })

    it('should return provider "vercel" when Vercel deploy succeeds', async () => {
      process.env.VERCEL_TOKEN = 'vercel_test_token'
      mockAxiosPost.mockResolvedValueOnce({ data: { url: 'my-site.vercel.app' } })
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockResolvedValue(undefined)

      const result = await deployVercel(SAMPLE_HTML, SAMPLE_SLUG)

      expect(result.data?.provider).toBe('vercel')
    })

    it('should fall back to local deploy when Vercel API throws', async () => {
      process.env.VERCEL_TOKEN = 'vercel_test_token'
      mockAxiosPost.mockRejectedValueOnce(new Error('Vercel API error'))
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockResolvedValue(undefined)

      const result = await deployVercel(SAMPLE_HTML, SAMPLE_SLUG)

      expect(result.success).toBe(true)
      expect(result.data?.provider).toBe('local')
    })

    it('should include VERCEL_TEAM_ID in request when set', async () => {
      process.env.VERCEL_TOKEN = 'vercel_test_token'
      process.env.VERCEL_TEAM_ID = 'team_abc123'
      mockAxiosPost.mockResolvedValueOnce({ data: { url: 'my-site.vercel.app' } })
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockResolvedValue(undefined)

      await deployVercel(SAMPLE_HTML, SAMPLE_SLUG)

      const callBody = mockAxiosPost.mock.calls[0][1]
      expect(callBody.teamId).toBe('team_abc123')
    })

    it('should not include teamId when VERCEL_TEAM_ID is not set', async () => {
      process.env.VERCEL_TOKEN = 'vercel_test_token'
      delete process.env.VERCEL_TEAM_ID
      mockAxiosPost.mockResolvedValueOnce({ data: { url: 'my-site.vercel.app' } })
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockResolvedValue(undefined)

      await deployVercel(SAMPLE_HTML, SAMPLE_SLUG)

      const callBody = mockAxiosPost.mock.calls[0][1]
      expect(callBody.teamId).toBeUndefined()
    })
  })

  describe('deployAgent', () => {
    it('should call deployLocal when VERCEL_TOKEN is not set', async () => {
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockResolvedValue(undefined)

      const result = await deployAgent(SAMPLE_HTML, SAMPLE_SLUG)

      expect(result.data?.provider).toBe('local')
      expect(mockAxiosPost).not.toHaveBeenCalled()
    })

    it('should call deployVercel when VERCEL_TOKEN is set', async () => {
      process.env.VERCEL_TOKEN = 'vercel_test_token'
      mockAxiosPost.mockResolvedValueOnce({ data: { url: 'my-site.vercel.app' } })
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockResolvedValue(undefined)

      const result = await deployAgent(SAMPLE_HTML, SAMPLE_SLUG)

      expect(result.data?.provider).toBe('vercel')
    })

    it('should return success: true in both cases', async () => {
      mockEnsureDir.mockResolvedValue(undefined)
      mockWriteFile.mockResolvedValue(undefined)

      const result = await deployAgent(SAMPLE_HTML, SAMPLE_SLUG)

      expect(result.success).toBe(true)
    })
  })
})
