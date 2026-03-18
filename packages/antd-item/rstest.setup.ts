import { afterEach, beforeEach, expect, rstest } from '@rstest/core'
import * as jestDomMatchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'

expect.extend(jestDomMatchers)

// 每个测试后清理以防止测试污染
afterEach(() => {
  rstest.restoreAllMocks()
  cleanup()
})

beforeEach(() => {
  rstest.clearAllMocks()

  const mockMediaQueryList = {
    matches: false,
    addEventListener: rstest.fn(),
    removeEventListener: rstest.fn(),
    dispatchEvent: rstest.fn(),
  }

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: rstest.fn().mockReturnValue(mockMediaQueryList),
  })
})
