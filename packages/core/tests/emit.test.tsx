import { describe, expect, rstest, test } from '@rstest/core'
import { act, renderHook, waitFor } from '@testing-library/react'
import z from 'zod'
import { useEventChat } from '../src/hooks'
import { getEventName } from '../src/utils'

const schema = z.object({
  age: z.number().min(0),
  email: z.email(),
  name: z.string(),
})

describe('useEventChat 通信', () => {
  test('回调处理应该触发回调函数 - 无 schema', async () => {
    const mockCallback = rstest.fn()
    renderHook(() => useEventChat('sub-mox', { callback: mockCallback }))

    const { result } = renderHook(() => useEventChat('pub-mox'))
    const record = {
      detail: { message: 'test' },
      name: 'sub-mox',
    }

    await act(() => {
      result.current.emit(record)
    })

    // 等待订阅者的 useEffect 执行完成（事件总线订阅生效）
    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining(record))
  })

  test('事件名不匹配时不触发回调', async () => {
    const mockCallback = rstest.fn()
    renderHook(() => useEventChat('sub-mox', { callback: mockCallback }))

    const { result } = renderHook(() => useEventChat('pub-mox'))
    await act(() => {
      result.current.emit({ detail: { message: 'test' }, name: 'sub-mox-test' })
    })

    expect(mockCallback).not.toHaveBeenCalled()
  })

  test('Zod schema 验证-有效数据处理', async () => {
    const mockCallback = rstest.fn()
    renderHook(() => useEventChat('sub-schema', { callback: mockCallback, schema }))

    const { result } = renderHook(() => useEventChat('pub-schema'))
    const record = {
      detail: {
        age: 25,
        email: 'john@example.copm',
        name: 'John Doe',
      },
      name: 'sub-schema',
    }

    await act(() => {
      result.current.emit(record)
    })

    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining(record))
  })

  test('Zod schema 验证-无效数据处理', async () => {
    const mockCallback = rstest.fn()
    const { result } = renderHook(() => {
      useEventChat('sub-schema-log', {
        debug: mockCallback,
        schema,
      })
      return useEventChat('pub-schema')
    })

    const record = {
      detail: {
        age: -25,
        email: 'john@example.copm',
        name: 'nvalid-email',
      },
      name: 'sub-schema-log',
    }

    expect(mockCallback).toHaveBeenCalledTimes(1)
    await act(() => {
      result.current.emit(record)
    })

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledTimes(2)
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          data: record.detail,
        })
      )
    })
  })

  test('群发消息测试', async () => {
    const mockGroupCallback = rstest.fn()
    const mockGlobalCallback = rstest.fn()

    renderHook(() => useEventChat('sub-mox', { callback: mockGroupCallback, group: 'form-item' }))
    renderHook(() => useEventChat('sub-mox', { callback: mockGlobalCallback }))

    const { result } = renderHook(() => useEventChat('pub-mox', { group: 'form-item' }))
    const record = { name: 'sub-mox' }

    await act(() => {
      result.current.emit(record)
    })

    expect(mockGroupCallback).toHaveBeenCalledTimes(1)
    expect(mockGlobalCallback).toHaveBeenCalledTimes(0)

    // 追加一个群成员不接收公屏的消息
    renderHook(() =>
      useEventChat('sub-mox', {
        group: 'form-item',
        callback: (record) => {
          if (!record.global) mockGroupCallback(record)
        },
      })
    )

    await act(() => {
      result.current.emit(record)
    })

    expect(mockGroupCallback).toHaveBeenCalledTimes(3)
    expect(mockGlobalCallback).toHaveBeenCalledTimes(0)

    // 向公屏发送消息
    await act(() => {
      result.current.emit({ ...record, global: true })
    })

    expect(mockGroupCallback).toHaveBeenCalledTimes(4)
    expect(mockGlobalCallback).toHaveBeenCalledTimes(1)
    expect(mockGlobalCallback).toBeCalledWith(expect.objectContaining({ ...record, global: true }))
  })

  test('用 token 发送私信', async () => {
    const mockCallback = rstest.fn()
    const { result: subResult } = renderHook(() =>
      useEventChat('sub-mox', { token: true, callback: mockCallback })
    )

    const { result } = renderHook(() => useEventChat('pub-mox'))
    const record = { name: 'sub-mox' }

    // 没有提供 token
    await act(() => {
      result.current.emit(record)
    })

    expect(mockCallback).toHaveBeenCalledTimes(0)

    // 提供 token
    await act(() => {
      result.current.emit({ ...record, token: subResult.current.token })
    })

    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({ ...record, token: subResult.current.token })
    )
  })

  test('options 变化时回调函数应该更新', async () => {
    const mockCallback1 = rstest.fn()
    const mockCallback2 = rstest.fn()

    const { result } = renderHook(() => useEventChat('pub-mox'))
    const { rerender } = renderHook(({ callback }) => useEventChat('sub-mox', { callback }), {
      initialProps: { callback: mockCallback1 },
    })

    // 第一次回调
    await act(() => {
      result.current.emit({ name: 'sub-mox' })
    })

    expect(mockCallback1).toBeCalledTimes(1)
    expect(mockCallback2).toBeCalledTimes(0)

    // 更新 props
    rerender({ callback: mockCallback2 })
    await act(() => {
      result.current.emit({ name: 'sub-mox' })
    })

    expect(mockCallback1).toBeCalledTimes(1)
    expect(mockCallback2).toBeCalledTimes(1)
  })

  test('回调函数接收的参数类型: 数据事件名', async () => {
    const group = 'test-group'
    const name = ['sub-mox', 'list', 0, 'name'] as const
    const origin = ['pub-mox', 0, 'test'] as const
    const type = 'type'

    const mockCallback = rstest.fn()
    renderHook(() => useEventChat(name, { callback: mockCallback, group }))

    const { result } = renderHook(() => useEventChat(origin, { group, type }))
    const record = {
      detail: { message: 'test' },
      name,
    }

    await act(() => {
      result.current.emit(record)
    })

    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        ...record,
        originName: name, // 采用 detail.name
        rule: getEventName(name),
        group,
        origin,
        type,
      })
    )
  })

  test('回调函数接收的参数类型: 字符事件名', async () => {
    const group = 'test-group'
    const name = 'sub-mox'
    const origin = 'pub-mox'
    const type = 'type'

    const mockCallback = rstest.fn()
    renderHook(() => useEventChat(name, { callback: mockCallback, group }))

    const { result } = renderHook(() => useEventChat(origin, { group, type }))
    const record = {
      detail: { message: 'test' },
      name,
    }

    await act(() => {
      result.current.emit(record)
    })

    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        ...record,
        originName: name, // 采用 detail.name
        rule: getEventName(name),
        group,
        origin,
        type,
      })
    )
  })
})
