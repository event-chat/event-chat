import { describe, expect, rstest, test } from '@rstest/core'
import { act, renderHook, waitFor } from '@testing-library/react'
import z from 'zod'
import { useEventChat } from '../src/hooks'
import { ResultType } from '../src/utils'
import { customLang, eventName, pubName, testEventData } from './fixtures/fields'

// 由于 hook 做了全局 mock，将一部分单测方到这里
describe('useEventChat 补充测试', () => {
  test('处理异步 schema', async () => {
    const { result } = renderHook(() => useEventChat(pubName, { group: testEventData.group }))
    const refineMock = rstest.fn(() => Promise.resolve(true))

    renderHook(() =>
      useEventChat(testEventData.name, {
        async: true,
        schema: z.object({ message: z.string() }).refine(refineMock),
      })
    )

    await act(() => {
      result.current.emit({ ...testEventData, token: undefined })
    })

    expect(refineMock).toBeCalledTimes(1)
    expect(refineMock).toBeCalledWith(testEventData.detail)
  })
  test('自定义群组和私信错误', async () => {
    const { result } = renderHook(() => useEventChat(pubName, { group: testEventData.group }))
    const debugFn = rstest.fn((record: ResultType) => record)

    renderHook(() => {
      useEventChat('sub-1', {
        group: 'fake-group',
        lang: customLang,
        debug: (record) => {
          if (record.status === 'invalid') debugFn(record)
        },
      })
      useEventChat('sub-2', {
        lang: customLang,
        debug: (record) => {
          if (record.status === 'invalid') debugFn(record)
        },
      })
      useEventChat('sub-3', {
        group: testEventData.group,
        lang: customLang,
        token: true,
        debug: (record) => {
          if (record.status === 'invalid') debugFn(record)
        },
      })
      useEventChat('sub-4', {
        group: testEventData.group,
        lang: customLang,
        debug: (record) => {
          if (record.status === 'invalid') debugFn(record)
        },
      })
      useEventChat('sub-5', {
        lang: customLang,
        debug: (record) => {
          if (record.status === 'invalid') debugFn(record)
        },
        filter: () => false,
      })
    })

    await act(() => {
      result.current.emit({ name: 'sub-1' })
      result.current.emit({ name: 'sub-2' })
      result.current.emit({ name: 'sub-3', token: 'fake-token' })
      result.current.emit({ name: 'sub-4', token: 'fake-token' })
      result.current.emit({ name: 'sub-5', global: true })
    })

    await waitFor(() => {
      const debugRecord = debugFn.mock.calls
      expect(debugRecord[0][0]).toMatchObject({
        data: expect.objectContaining({
          group: testEventData.group,
          name: 'sub-1',
          origin: pubName,
          originName: 'sub-1',
          rule: 'sub-1',
        }),
      })
      expect(debugRecord[0][0].error?.issues.slice(-1)[0].message).toEqual(customLang.groupProvider)
      expect(debugRecord[1][0]).toMatchObject({
        data: expect.objectContaining({
          name: 'sub-2',
          origin: pubName,
          originName: 'sub-2',
          rule: 'sub-2',
        }),
      })
      expect(debugRecord[1][0].error?.issues.slice(-1)[0].message).toEqual(customLang.groupEmpty)
      expect(debugRecord[2][0]).toMatchObject({
        data: expect.objectContaining({
          group: testEventData.group,
          name: 'sub-3',
          origin: pubName,
          originName: 'sub-3',
          rule: 'sub-3',
        }),
      })
      expect(debugRecord[2][0].error?.issues.slice(-1)[0].message).toEqual(customLang.tokenProvider)
      expect(debugRecord[3][0]).toMatchObject({
        data: expect.objectContaining({
          group: testEventData.group,
          name: 'sub-4',
          origin: pubName,
          originName: 'sub-4',
          rule: 'sub-4',
        }),
      })
      expect(debugRecord[3][0].error?.issues.slice(-1)[0].message).toEqual(customLang.tokenEmpty)
      expect(debugRecord[4][0]).toMatchObject({
        data: expect.objectContaining({
          group: testEventData.group,
          name: 'sub-5',
          origin: pubName,
          originName: 'sub-5',
          rule: 'sub-5',
        }),
      })
      expect(debugRecord[4][0].error?.issues.slice(-1)[0].message).toEqual(customLang.customError)
    })
  })
  test('同事件名通过 type 做区分', async () => {
    const { result } = renderHook(() => useEventChat(pubName))
    const callbackMock = rstest.fn()

    renderHook(() => {
      useEventChat(eventName, { type: 'type-1', callback: callbackMock })
      useEventChat(eventName, { type: 'type-2', callback: callbackMock, schema: z.string() })
    })

    await act(() => {
      result.current.emit({ detail: 'test-input', name: eventName })
    })

    const callbackRecord = callbackMock.mock.calls
    expect(callbackMock).toHaveBeenCalledTimes(2)
    expect(callbackRecord[0][0]).toMatchObject({ type: 'type-1' })
    expect(callbackRecord[1][0]).toMatchObject({ type: 'type-2' })
  })
})
