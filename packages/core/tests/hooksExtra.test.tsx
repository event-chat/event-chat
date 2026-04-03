import { describe, expect, rstest, test } from '@rstest/core'
import { act, renderHook, waitFor } from '@testing-library/react'
import z from 'zod'
import { useEventChat } from '../src/hooks'
import { pubName, testEventData } from './fixtures/fields'

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
    const debugFn = rstest.fn()

    renderHook(() => {
      useEventChat('sub-1', {
        group: 'fake-group',
        debug: (record) => {
          if (record.status === 'invalid') debugFn(record)
        },
      })
      useEventChat('sub-2', {
        debug: (record) => {
          if (record.status === 'invalid') debugFn(record)
        },
      })
      useEventChat('sub-3', {
        group: testEventData.group,
        token: true,
        debug: (record) => {
          if (record.status === 'invalid') debugFn(record)
        },
      })
    })

    await act(() => {
      result.current.emit({ name: 'sub-1' })
      result.current.emit({ name: 'sub-2' })
      result.current.emit({ name: 'sub-3', token: 'fake-token' })
      result.current.emit({ name: 'sub-3' })
    })

    // await waitFor(() => {
    //   const debugRecord = debugFn.mock.calls
    //   console.log('a---', debugRecord)
    // })
  })
})
