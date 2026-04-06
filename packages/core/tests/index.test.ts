import { describe, expect, test } from '@rstest/core'
import z from 'zod'
import { useEventChat } from '../src/hooks'
import * as IndexExports from '../src/index'
import { createToken } from '../src/utils'
import { checkDetail } from '../src/validate'
import { customLang } from './fixtures/fields'

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
})

type UserSchema = typeof userSchema
type CustomDetail = {
  content: string
  timestamp: number
}

describe('index: 出口文件导出验证', () => {
  test('正确导出 useEventChat', () => {
    expect(IndexExports.useEventChat).toBe(useEventChat)
    expect(IndexExports.useEventChat).toBeInstanceOf(Function)
  })

  test('正确导出 checkDetail', () => {
    expect(IndexExports.checkDetail).toBe(checkDetail)
    expect(IndexExports.checkDetail).toBeInstanceOf(Function)
  })

  test('正确导出 createToken', () => {
    expect(IndexExports.createToken).toBe(createToken)
    expect(IndexExports.createToken).toBeInstanceOf(Function)
  })

  test('导出成员完整，无多余或缺失', () => {
    const indexExportNames = Object.keys(IndexExports)
    const expectedValueExports = ['useEventChat', 'createToken', 'checkDetail']

    expect(indexExportNames).toEqual(expect.arrayContaining(expectedValueExports))
    expect(indexExportNames).toHaveLength(expectedValueExports.length)
  })

  test('应正确导出 EventChatOptions 和 EventDetailType 类型', () => {
    const withoSchemaOptions: IndexExports.EventChatOptions<
      'user.created',
      UserSchema,
      'user-items',
      'created',
      boolean
    > = {
      async: false,
      group: 'user-items',
      lang: customLang,
      schema: userSchema,
      token: true,
      type: 'created',
      callback: (record) => record,
      debug: (log) => log,
      filter: (record) => Boolean(record),
    }

    const withoutSchemaOptions: IndexExports.EventChatOptions<
      'message.sent',
      z.ZodType,
      'message',
      'sent'
    > = {
      group: 'message',
      type: 'sent',
    }

    const eventDetail: IndexExports.EventDetailType<CustomDetail, 'chat.message'> = {
      detail: {
        content: 'Hello World',
        timestamp: 1719283645000,
      },
      global: true,
      group: 'chat',
      id: '123456',
      name: 'chat.message',
      origin: 'web-client',
      originName: 'web-client',
      rule: 'chat.message',
      time: new Date(),
      type: 'message',
      token: 'abc-123',
    }

    const ExcludeList: IndexExports.ExcludeKey[] = [
      'group',
      'id',
      'origin',
      'originName',
      'rule',
      'time',
      'type',
    ]

    const dependencies: IndexExports.NamepathType[] = ['name', 1, ['sub', 0, 'name']]

    expect(withoSchemaOptions).toBeDefined()
    expect(withoutSchemaOptions).toBeDefined()
    expect(eventDetail).toBeDefined()
    expect(ExcludeList).toBeDefined()
    expect(dependencies).toBeDefined()
  })
})
