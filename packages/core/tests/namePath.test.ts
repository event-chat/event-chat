import { describe, expect, rstest, test } from '@rstest/core'
import { act, renderHook } from '@testing-library/react'
import { useEventChat } from '../src'

describe('namePath: 路径系统', () => {
  test('事件路径', async () => {
    const detail = 'input'
    const group = 'group-1'

    const { result } = renderHook(() => useEventChat('pub', { group }))
    const callbackFn1 = rstest.fn()
    const callbackFn2 = rstest.fn()

    renderHook(() => {
      useEventChat(['a', 0, 'b'], { callback: callbackFn1, group })
      useEventChat('e[0].f', { callback: callbackFn2, group })
    })

    await act(() => {
      result.current.emit({ name: ['a', 0, 'b'], detail })
      result.current.emit({ name: ['a', '0', 'b'], detail })
      result.current.emit({ name: 'a[0].b', detail })
      result.current.emit({ name: 'a.0.b', detail })

      result.current.emit({ name: ['e', 0, 'f'], detail })
      result.current.emit({ name: ['e', '0', 'f'], detail })
      result.current.emit({ name: 'e[0].f', detail })
      result.current.emit({ name: 'e.0.f', detail })
    })

    const record1 = callbackFn1.mock.calls
    expect(record1[0][0]).toMatchObject({ originName: ['a', 0, 'b'] })
    expect(record1[1][0]).toMatchObject({ originName: ['a', '0', 'b'] })
    expect(record1[2][0]).toMatchObject({ originName: 'a[0].b' })
    expect(record1[3][0]).toMatchObject({ originName: 'a.0.b' })

    const record2 = callbackFn2.mock.calls
    expect(record2[0][0]).toMatchObject({ originName: ['e', 0, 'f'] })
    expect(record2[1][0]).toMatchObject({ originName: ['e', '0', 'f'] })
    expect(record2[2][0]).toMatchObject({ originName: 'e[0].f' })
    expect(record2[3][0]).toMatchObject({ originName: 'e.0.f' })
  })

  test('下标路径', async () => {
    const group = 'group-2'
    const { result } = renderHook(() => useEventChat(['a', 0, 'b'], { group }))

    const callbackFn = rstest.fn()
    renderHook(() => {
      useEventChat(['a', 1, 'b'], { callback: callbackFn, group })
      useEventChat(['a', 2, 'b'], { callback: callbackFn, group })
      useEventChat(['a', 5, 'b'], { callback: callbackFn, group })
    })

    await act(() => {
      result.current.emit({ detail: 'input1', name: '..[+].b' })
      result.current.emit({ detail: 'input2', name: '..[+2].b' })
      result.current.emit({ detail: 'input3', name: '..[+5].b' })
    })

    const record = callbackFn.mock.calls
    expect(record[0][0]).toMatchObject({ detail: 'input1', name: ['a', 1, 'b'] })
    expect(record[1][0]).toMatchObject({ detail: 'input2', name: ['a', 2, 'b'] })
    expect(record[2][0]).toMatchObject({ detail: 'input3', name: ['a', 5, 'b'] })
  })

  test('全局和局部匹配', async () => {
    const group = 'group-3'
    const pubAll = 'pub-match-all'
    const pubPart = 'pub-match-part'

    const { result: matchAll } = renderHook(() =>
      useEventChat(pubAll, { filter: ({ origin }) => origin !== pubAll, group })
    )

    const { result: matchPart } = renderHook(() =>
      useEventChat(pubPart, { filter: ({ origin }) => origin !== pubPart, group })
    )

    const callbackAll = rstest.fn()
    const callbackPart = rstest.fn()
    renderHook(() => {
      useEventChat('part.origin.all.1', { callback: callbackAll, group })
      useEventChat('part.origin.all.2', { callback: callbackAll, group })

      useEventChat('part.origin.partial.1', { callback: callbackPart, group })
      useEventChat('part.input.partial.2', { callback: callbackPart, group })
    })

    await act(() => {
      matchAll.current.emit({ detail: 'input1', name: '*' })
      matchPart.current.emit({ detail: 'input2', name: 'part.*.partial.*' })
    })

    const recordAll = callbackAll.mock.calls
    expect(callbackAll).toBeCalledTimes(2)
    expect(recordAll[0][0]).toMatchObject({
      detail: 'input1',
      name: 'part.origin.all.1',
      origin: pubAll,
      originName: '*',
    })

    expect(recordAll[1][0]).toMatchObject({
      detail: 'input1',
      name: 'part.origin.all.2',
      origin: pubAll,
      originName: '*',
    })

    const recordPart = callbackPart.mock.calls
    expect(callbackPart).toBeCalledTimes(4)
    expect(recordPart[0][0]).toMatchObject({
      detail: 'input1',
      name: 'part.origin.partial.1',
      origin: pubAll,
      originName: '*',
    })

    expect(recordPart[1][0]).toMatchObject({
      detail: 'input1',
      name: 'part.input.partial.2',
      origin: pubAll,
      originName: '*',
    })

    expect(recordPart[2][0]).toMatchObject({
      detail: 'input2',
      name: 'part.origin.partial.1',
      origin: pubPart,
      originName: 'part.*.partial.*',
    })

    expect(recordPart[3][0]).toMatchObject({
      detail: 'input2',
      name: 'part.input.partial.2',
      origin: pubPart,
      originName: 'part.*.partial.*',
    })
  })

  test('广播和反向匹配', async () => {
    const fields = ['aa.*(bb,kk,dd,ee.*(oo,gg).gg).cc', '*(!aa,bb,cc)']
    const group = 'group-4'

    const { result } = renderHook(() => useEventChat('aa', { group }))
    const callback = rstest.fn()

    renderHook(() => {
      useEventChat('kk', { group, callback })
      useEventChat('aa.bb.cc', { group, callback })
      useEventChat('aa.kk.cc', { group, callback })
      useEventChat('aa.dd.cc', { group, callback })
      useEventChat('aa.ee.oo.gg.cc', { group, callback })
      useEventChat('aa.ee.gg.gg.cc', { group, callback })
    })

    await act(() => {
      result.current.emit({ detail: 'input', name: fields[0] })
      result.current.emit({ detail: 'input', name: fields[1] })
    })

    const record = callback.mock.calls
    expect(record[0][0]).toMatchObject({ name: 'aa.bb.cc', originName: fields[0] })
    expect(record[1][0]).toMatchObject({ name: 'aa.kk.cc', originName: fields[0] })
    expect(record[2][0]).toMatchObject({ name: 'aa.dd.cc', originName: fields[0] })
    expect(record[3][0]).toMatchObject({ name: 'aa.ee.oo.gg.cc', originName: fields[0] })
    expect(record[4][0]).toMatchObject({ name: 'aa.ee.gg.gg.cc', originName: fields[0] })

    expect(record[5][0]).toMatchObject({ name: 'kk', originName: fields[1] })
    expect(record[6][0]).toMatchObject({ name: 'aa.bb.cc', originName: fields[1] })
    expect(record[7][0]).toMatchObject({ name: 'aa.kk.cc', originName: fields[1] })
    expect(record[8][0]).toMatchObject({ name: 'aa.dd.cc', originName: fields[1] })
    expect(record[9][0]).toMatchObject({ name: 'aa.ee.oo.gg.cc', originName: fields[1] })
    expect(record[10][0]).toMatchObject({ name: 'aa.ee.gg.gg.cc', originName: fields[1] })
  })

  test('扩展和范围路径', async () => {
    const fields = ['test~', 'aa.*[1:2].bb', 'aa.*[1:].bb', 'aa.*[:100].bb']
    const group = 'group-5'

    const { result } = renderHook(() => useEventChat('aa', { group }))
    const callback = rstest.fn()

    renderHook(() => {
      useEventChat('test_111', { group, callback })
      useEventChat('test_222', { group, callback })
      useEventChat('aa.1.bb', { group, callback })
      useEventChat('aa.2.bb', { group, callback })
      useEventChat('aa.3.bb', { group, callback })
      useEventChat('aa.1000.bb', { group, callback })
    })

    await act(() => {
      fields.forEach((name) => result.current.emit({ detail: 'input', name }))
    })

    const record = callback.mock.calls
    expect(record[0][0]).toMatchObject({ name: 'test_111', originName: fields[0] })
    expect(record[1][0]).toMatchObject({ name: 'test_222', originName: fields[0] })

    expect(record[2][0]).toMatchObject({ name: 'aa.1.bb', originName: fields[1] })
    expect(record[3][0]).toMatchObject({ name: 'aa.2.bb', originName: fields[1] })

    expect(record[4][0]).toMatchObject({ name: 'aa.1.bb', originName: fields[2] })
    expect(record[5][0]).toMatchObject({ name: 'aa.2.bb', originName: fields[2] })
    expect(record[6][0]).toMatchObject({ name: 'aa.3.bb', originName: fields[2] })
    expect(record[7][0]).toMatchObject({ name: 'aa.1000.bb', originName: fields[2] })

    expect(record[8][0]).toMatchObject({ name: 'aa.1.bb', originName: fields[3] })
    expect(record[9][0]).toMatchObject({ name: 'aa.2.bb', originName: fields[3] })
    expect(record[10][0]).toMatchObject({ name: 'aa.3.bb', originName: fields[3] })
  })

  test('转义路径', async () => {
    const group = 'group-6'
    const { result } = renderHook(() => useEventChat('aa', { group }))

    const callback = rstest.fn()
    renderHook(() => {
      useEventChat(['target', '\\,', 'input'], { group, callback })
    })

    await act(() => {
      result.current.emit({ detail: 'input', name: 'target.\\\\,.input' })
    })

    expect(callback).toBeCalledWith(
      expect.objectContaining({
        name: ['target', '\\,', 'input'],
        originName: 'target.\\\\,.input',
      })
    )
  })
})
