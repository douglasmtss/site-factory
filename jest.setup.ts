/**
 * Global Jest setup — runs once per test file (setupFilesAfterFramework).
 *
 * Suppresses console.error and console.warn for every test suite so noisy
 * internal library messages don't pollute CI output. Individual tests that
 * want to assert on console calls can override the spy with mockImplementation.
 */
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})
