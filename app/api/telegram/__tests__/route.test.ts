import type { NextRequest } from 'next/server'

// ──────────────────────────────────────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────────────────────────────────────
const mockHandleUpdate = jest.fn()
const mockNextResponseJson = jest.fn()

jest.mock('telegraf', () => ({
  Telegraf: jest.fn().mockImplementation(() => ({
    handleUpdate: mockHandleUpdate,
  })),
}))

jest.mock('next/server', () => ({
  NextResponse: {
    json: mockNextResponseJson,
  },
}))

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
function createMockRequest(body: unknown): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest
}

// ──────────────────────────────────────────────────────────────────────────────
// Tests — module loaded with a valid BOT_TOKEN
// ──────────────────────────────────────────────────────────────────────────────
describe('app/api/telegram/route (with BOT_TOKEN)', () => {
  let POST: (req: NextRequest) => Promise<unknown>

  beforeAll(() => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token'
    // Load the module after the env var is set and mocks are in place
    jest.resetModules()
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const routeModule = require('@/app/api/telegram/route') as {
      POST: (req: NextRequest) => Promise<unknown>
    }
    POST = routeModule.POST
  })

  beforeEach(() => {
    mockHandleUpdate.mockReset()
    mockNextResponseJson.mockReset()
    mockNextResponseJson.mockImplementation(
      (data: unknown, init?: { status?: number }) => ({
        status: init?.status ?? 200,
        body: data,
      })
    )
  })

  afterAll(() => {
    delete process.env.TELEGRAM_BOT_TOKEN
  })

  it('should return { ok: true } when handleUpdate succeeds', async () => {
    mockHandleUpdate.mockResolvedValueOnce(undefined)

    await POST(createMockRequest({ update_id: 1, message: { text: '/start' } }))

    expect(mockNextResponseJson).toHaveBeenCalledWith({ ok: true })
  })

  it('should call bot.handleUpdate with the parsed request body', async () => {
    const body = { update_id: 42, message: { text: 'hello' } }
    mockHandleUpdate.mockResolvedValueOnce(undefined)

    await POST(createMockRequest(body))

    expect(mockHandleUpdate).toHaveBeenCalledWith(body)
  })

  it('should return { ok: false } with status 500 when handleUpdate throws', async () => {
    mockHandleUpdate.mockRejectedValueOnce(new Error('Telegram error'))

    await POST(createMockRequest({ update_id: 2 }))

    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { ok: false },
      { status: 500 }
    )
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Tests — module loaded WITHOUT a BOT_TOKEN
// ──────────────────────────────────────────────────────────────────────────────
describe('app/api/telegram/route (without BOT_TOKEN)', () => {
  let POST: (req: NextRequest) => Promise<unknown>

  beforeAll(() => {
    delete process.env.TELEGRAM_BOT_TOKEN

    jest.resetModules()
    // Re-register mocks so the freshly-loaded module gets them
    jest.mock('telegraf', () => ({
      Telegraf: jest.fn().mockImplementation(() => ({
        handleUpdate: mockHandleUpdate,
      })),
    }))
    jest.mock('next/server', () => ({
      NextResponse: {
        json: mockNextResponseJson,
      },
    }))

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const routeModule = require('@/app/api/telegram/route') as {
      POST: (req: NextRequest) => Promise<unknown>
    }
    POST = routeModule.POST
  })

  beforeEach(() => {
    mockHandleUpdate.mockReset()
    mockNextResponseJson.mockReset()
    mockNextResponseJson.mockImplementation(
      (data: unknown, init?: { status?: number }) => ({
        status: init?.status ?? 200,
        body: data,
      })
    )
  })

  it('should return { ok: false } with status 500 when BOT_TOKEN is missing', async () => {
    await POST(createMockRequest({ update_id: 1 }))

    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { ok: false },
      { status: 500 }
    )
    expect(mockHandleUpdate).not.toHaveBeenCalled()
  })
})
