import { beforeEach, describe, expect, rstest, test } from '@rstest/core'
import z from 'zod'
import eventBus from '../src/eventBus'
import {
  EventName,
  combinePath,
  createEvent,
  createToken,
  defaultLang,
  getConditionKey,
  getEventName,
  isResultType,
  mountEvent,
} from '../src/utils'
import { testEventData } from './fixtures/fields'

beforeEach(() => {
  rstest.clearAllMocks()
})

describe('工具函数单元测试', () => {
  test('defaultLang: 默认定义的提示对象是固定的不可修改', () => {
    const keys = Object.keys(defaultLang)
    expect(Object.isFrozen(defaultLang)).toBeTruthy()
    expect(keys.length).toBe(5)
    expect(keys).toEqual(
      expect.arrayContaining([
        'customError',
        'groupEmpty',
        'groupProvider',
        'tokenEmpty',
        'tokenProvider',
      ])
    )
  })

  test('EventName: 应该等于预设的自定义事件名称', () => {
    expect(typeof EventName).toBe('string')
    expect(EventName).not.toBe('')
  })

  test('combinePath：eventName 路径计算', () => {
    expect(combinePath('.ab.0.ef', 'x.y.z')).toBe(getEventName(['x', 'y', 'ab', '0', 'ef']))
    expect(combinePath('..ab.0.ef', 'x.y.z')).toBe(getEventName(['x', 'ab', '0', 'ef']))
    expect(combinePath('...ab.0.ef', 'x.y.z')).toBe(getEventName(['ab', '0', 'ef']))
    expect(combinePath('....ab.0.ef', 'x.y.z')).toBe(getEventName(['ab', '0', 'ef']))
    expect(combinePath('.ab.0..ef', 'x.y.z')).toBe(getEventName(['x', 'y', 'ab', '0', 'ef']))
  })

  test('createEvent: 正确配置的 CustomEvent 实例', () => {
    const event = createEvent(testEventData)
    expect(event).toBeInstanceOf(CustomEvent)
    expect(event.type).toBe(EventName)
    expect(event.bubbles).toBeTruthy()
    expect(event.cancelable).toBeTruthy()
    expect(event.detail).toEqual(testEventData)
  })

  test('createToken: 生成一个基于btoa编码的token字符串', () => {
    const testKey = 'test-key'
    const token = createToken(testKey)
    const decodedToken = window.atob(token)
    const [key, random, timestamp] = decodedToken.split(':')

    expect(key).toBe(testKey)
    expect(Number(random)).toBeGreaterThan(0)
    expect(Number(timestamp)).toBeLessThanOrEqual(Date.now())
    expect(typeof token).toBe('string')
  })

  test('getConditionKey: 过滤空值并以连字符拼接参数', () => {
    expect(getConditionKey('name', '123', 'type')).toBe('name-123-type')
    expect(getConditionKey('name', '123', '')).toBe('name-123')
    expect(getConditionKey('name', '123')).toBe('name-123')
    expect(getConditionKey('name', '', 'type')).toBe('name-type')
  })

  test('getEventName：路径换算', () => {
    expect(getEventName('ab.cd.ef')).toBe(getEventName(['ab', 'cd', 'ef']))
    expect(getEventName('ab.cd.ef')).not.toBe(getEventName(['ab.cd', 'ef']))
    expect(getEventName('ab\\.cd.ef')).toBe(getEventName(['ab.cd', 'ef']))

    expect(getEventName('ab.0.ef')).toBe(getEventName(['ab', '0', 'ef']))
    expect(getEventName('ab.0.ef')).not.toBe(getEventName(['ab', 0, 'ef']))
    expect(getEventName('ab[0].ef')).toBe(getEventName(['ab', 0, 'ef']))
    expect(getEventName('ab[0].ef')).not.toBe(getEventName(['ab', '0', 'ef']))

    expect(getEventName('.ab.0.ef')).toBe(getEventName(['', 'ab', '0', 'ef']))
    expect(getEventName('.ab[0].ef')).toBe(getEventName(['', 'ab', 0, 'ef']))
  })

  test('getEventName: 获取事件名', () => {
    expect(getEventName(['test'])).toBe('test')
    expect(getEventName('')).toBe('')
    expect(getEventName(['ab', 'cd', 'ef'])).toBe('ab.cd.ef')
    expect(getEventName(['ab.cd', 'ef'])).toBe('ab\\.cd.ef')
    expect(getEventName(['ab', '0', 'ef'])).toBe('ab.0.ef')
    expect(getEventName(['ab', 0, 'ef'])).toBe('ab[0].ef')
    expect(getEventName(['', 'ab', '0', 'ef'])).toBe('.ab.0.ef')
    expect(getEventName(['', 'ab', 0, 'ef'])).toBe('.ab[0].ef')
  })

  test('getEventName: 自定义过滤方法，不换算路径', () => {
    expect(getEventName(['test.sub', 'ok\\st'], (path) => path)).toBe('test.sub.ok\\st')
  })

  test('isResultType: 获取校验失败的对象', () => {
    const testSchema = z.object({ message: z.string() })
    const options = { group: 'test', schema: testSchema }
    const validResult = {
      success: false,
      error: { issues: [], name: 'ZodError' },
      data: null,
    }

    const validSchema = testSchema.safeParse('string')
    expect(isResultType(validResult)).toBeTruthy()
    expect(isResultType(validSchema)).toBeTruthy()

    expect(isResultType(options)).toBeFalsy()
    expect(isResultType({})).toBeFalsy()
    expect(isResultType({ success: true, data: 'test' })).toBeFalsy()
    expect(isResultType('string')).toBeFalsy()
    expect(isResultType(null)).toBeFalsy()
  })

  test('mountEvent: 通过 eventBus 发送事件', () => {
    const mockCallback = rstest.fn()
    const spyOn = rstest.spyOn(eventBus, 'emit').mockImplementation(mockCallback)
    const event = createEvent(testEventData)

    mountEvent(event)
    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledWith(testEventData)

    spyOn.mockRestore()
  })

  test('mountEvent: 当 rule 为空时不会发送事件', () => {
    const mockCallback = rstest.fn()
    const spyOn = rstest.spyOn(eventBus, 'emit').mockImplementation(mockCallback)
    const event = createEvent({ ...testEventData, rule: '' })

    mountEvent(event)
    expect(mockCallback).toHaveBeenCalledTimes(0)

    spyOn.mockRestore()
  })
})
