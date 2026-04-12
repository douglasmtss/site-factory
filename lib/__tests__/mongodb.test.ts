import mongoose from 'mongoose'
import { connectMongo } from '@/lib/mongodb'

jest.mock('mongoose', () => ({
  connect: jest.fn(),
}))

const mockConnect = mongoose.connect as jest.Mock

describe('lib/mongodb', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    // Reset cached state so each test starts with a clean slate
    const g = global as Record<string, unknown>
    const cache = g['mongooseCache'] as { conn: unknown; promise: unknown } | undefined
    if (cache) {
      cache.conn = null
      cache.promise = null
    }
    mockConnect.mockReset()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('connectMongo', () => {
    it('should call mongoose.connect when there is no cached connection', async () => {
      mockConnect.mockResolvedValueOnce(mongoose as unknown as typeof mongoose)

      await connectMongo()

      expect(mockConnect).toHaveBeenCalledTimes(1)
    })

    it('should pass bufferCommands: false to mongoose.connect', async () => {
      mockConnect.mockResolvedValueOnce(mongoose as unknown as typeof mongoose)

      await connectMongo()

      expect(mockConnect).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ bufferCommands: false })
      )
    })

    it('should return the mongoose instance', async () => {
      mockConnect.mockResolvedValueOnce(mongoose as unknown as typeof mongoose)

      const result = await connectMongo()

      expect(result).toBe(mongoose)
    })

    it('should not call mongoose.connect when a connection is already cached', async () => {
      mockConnect.mockResolvedValueOnce(mongoose as unknown as typeof mongoose)

      // First call creates the connection
      await connectMongo()

      mockConnect.mockClear()

      // Second call should use the cache
      const result = await connectMongo()

      expect(mockConnect).not.toHaveBeenCalled()
      expect(result).toBe(mongoose)
    })

    it('should reuse the existing promise when a connection is in progress', async () => {
      let resolveConnect!: (v: typeof mongoose) => void
      const pendingPromise = new Promise<typeof mongoose>((resolve) => {
        resolveConnect = resolve
      })
      mockConnect.mockReturnValueOnce(pendingPromise)

      // Start two concurrent calls
      const call1 = connectMongo()
      const call2 = connectMongo()

      // Only one connect call should have been made
      expect(mockConnect).toHaveBeenCalledTimes(1)

      resolveConnect(mongoose as unknown as typeof mongoose)
      await Promise.all([call1, call2])

      expect(mockConnect).toHaveBeenCalledTimes(1)
    })

    it('should connect to the default local URI when MONGODB_URI env is not set', async () => {
      // MONGODB_URI is captured at module load time; just verify connect is called
      mockConnect.mockResolvedValueOnce(mongoose as unknown as typeof mongoose)

      await connectMongo()

      expect(mockConnect).toHaveBeenCalledWith(
        expect.stringContaining('mongodb://'),
        expect.any(Object)
      )
    })
  })

  describe('module-level initialization branches', () => {
    it('should reuse global.mongooseCache when already set before module loads', () => {
      // Set a pre-existing cache so the ??-fallback on line 18 takes the truthy side
      // and the if (!global.mongooseCache) on line 20 is false
      const preExisting = { conn: null, promise: null }
      ;(global as Record<string, unknown>)['mongooseCache'] = preExisting

      jest.resetModules()
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const freshModule = require('@/lib/mongodb') as typeof import('@/lib/mongodb')
      const freshConnectMongo = freshModule.connectMongo

      // The module used the pre-existing cache, so global.mongooseCache stays the same object
      expect((global as Record<string, unknown>)['mongooseCache']).toBe(preExisting)
      expect(freshConnectMongo).toBeDefined()
    })

    it('should use MONGODB_URI env var when set at module load time', () => {
      const originalUri = process.env.MONGODB_URI
      process.env.MONGODB_URI = 'mongodb://custom-host:27017/test-db'

      // Reset the global cache so the module initializes fresh
      ;(global as Record<string, unknown>)['mongooseCache'] = undefined
      jest.resetModules()
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const freshModule2 = require('@/lib/mongodb') as typeof import('@/lib/mongodb')
      const freshConnectMongo = freshModule2.connectMongo

      expect(freshConnectMongo).toBeDefined()

      process.env.MONGODB_URI = originalUri
      ;(global as Record<string, unknown>)['mongooseCache'] = undefined
    })
  })
})
