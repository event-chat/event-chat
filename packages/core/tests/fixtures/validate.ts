import { expect } from '@rstest/core'
import z from 'zod'
import { EventDetailType } from '../../src/utils'

const getPath = (data: unknown, path: string): unknown => {
  const namePath = path.split('.')
  const propert = namePath.shift()

  if (data instanceof Object && data && propert) {
    const target = Reflect.get(data, propert)
    return namePath.length === 0 ? target : getPath(target, namePath.join('.'))
  }
  return undefined
}

export const config = Object.freeze({
  group: 'test-group',
  token: 'test-token-456',
})

export const message = 'hello validation'
export const name = 'test-event' as const
export const baseTestData: EventDetailType<{ message: string }> = {
  ...config,
  detail: { message },
  id: 'test-id-123',
  origin: 'test-origin',
  originName: 'test-origin',
  rule: name,
  time: new Date(),
  type: 'test-type',
  name,
}

export const testErrorTips = '消息长度不能少于3个字符'
export const options = {
  ...config,
  schema: z.object({
    message: z.string().min(3, { error: testErrorTips }),
  }),
  token: true,
}

export const printFirstError = (error: unknown) => {
  const { cause } = error instanceof Error ? error : {}
  expect(cause).toMatchObject({ success: false })

  return (path: string, tips: string) => {
    const issue = getPath(cause, path)
    expect(issue).toBe(tips)
  }
}
