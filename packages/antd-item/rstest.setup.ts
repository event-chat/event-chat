import { afterEach, expect } from '@rstest/core'
import * as jestDomMatchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'

expect.extend(jestDomMatchers)

// 每个测试后清理以防止测试污染
afterEach(() => {
  cleanup()
})
