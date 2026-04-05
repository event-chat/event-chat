import { describe, expect, rstest, test } from '@rstest/core'
import { act, renderHook } from '@testing-library/react'
import { NamepathType } from '../src'
import { useEventChat } from '../src/hooks'

const renderSubitems = async <T extends NamepathType>(name: T) => {
  const { result } = renderHook(() => useEventChat(name))
  const codeCallback = rstest.fn()
  const itemCallback = rstest.fn()
  const nameCallback = rstest.fn()
  const nickCallback = rstest.fn()

  renderHook(() => {
    useEventChat(['custom', 'list', 0, 'item'], { callback: itemCallback })
    useEventChat('subname[0].nick', { callback: nickCallback })
    useEventChat('x.0.z', { callback: codeCallback })
    useEventChat(['name', '0', 'em'], { callback: nameCallback })
  })

  await act(() => {
    result.current.emit({ name: 'custom.list.0.item', detail: 'input' })
    result.current.emit({ name: ['custom', 'list', '0', 'item'], detail: 'input' })
    result.current.emit({ name: ['custom', 'list', 0, 'item'], detail: 'input' })
    result.current.emit({ name: 'custom.list[0].item', detail: 'input' })

    result.current.emit({ name: 'subname[0].nick', detail: 'input' })
    result.current.emit({ name: ['subname', 0, 'nick'], detail: 'input' })
    result.current.emit({ name: 'subname.0.nick', detail: 'input' })
    result.current.emit({ name: ['subname', '0', 'nick'], detail: 'input' })

    result.current.emit({ name: 'x.0.z', detail: 'input' })
    result.current.emit({ name: ['x', '0', 'z'], detail: 'input' })
    result.current.emit({ name: 'x[0].z', detail: 'input' })
    result.current.emit({ name: ['x', 0, 'z'], detail: 'input' })

    result.current.emit({ name: ['name', '0', 'em'], detail: 'input' })
    result.current.emit({ name: 'name.0.em', detail: 'input' })
    result.current.emit({ name: ['name', 0, 'em'], detail: 'input' })
    result.current.emit({ name: 'name[0].em', detail: 'input' })
  })

  const itemRecords1 = itemCallback.mock.calls
  expect(itemRecords1[0][0]).toMatchObject({
    name: ['custom', 'list', 0, 'item'],
    origin: name,
    originName: 'custom.list.0.item',
    rule: 'custom.list.0.item',
  })
  expect(itemRecords1[1][0]).toMatchObject({
    name: ['custom', 'list', 0, 'item'],
    origin: name,
    originName: ['custom', 'list', '0', 'item'],
    rule: 'custom.list.0.item',
  })
  expect(itemRecords1[2][0]).toMatchObject({
    name: ['custom', 'list', 0, 'item'],
    origin: name,
    originName: ['custom', 'list', 0, 'item'],
    rule: 'custom.list[0].item',
  })
  expect(itemRecords1[3][0]).toMatchObject({
    name: ['custom', 'list', 0, 'item'],
    origin: name,
    originName: 'custom.list[0].item',
    rule: 'custom.list[0].item',
  })

  const nickRecords1 = nickCallback.mock.calls
  expect(nickRecords1[0][0]).toMatchObject({
    name: 'subname[0].nick',
    origin: name,
    originName: 'subname[0].nick',
    rule: 'subname[0].nick',
  })
  expect(nickRecords1[1][0]).toMatchObject({
    name: 'subname[0].nick',
    origin: name,
    originName: ['subname', 0, 'nick'],
    rule: 'subname[0].nick',
  })
  expect(nickRecords1[2][0]).toMatchObject({
    name: 'subname[0].nick',
    origin: name,
    originName: 'subname.0.nick',
    rule: 'subname.0.nick',
  })
  expect(nickRecords1[3][0]).toMatchObject({
    name: 'subname[0].nick',
    origin: name,
    originName: ['subname', '0', 'nick'],
    rule: 'subname.0.nick',
  })

  const codeCallback1 = codeCallback.mock.calls
  expect(codeCallback1[0][0]).toMatchObject({
    name: 'x.0.z',
    origin: name,
    originName: 'x.0.z',
    rule: 'x.0.z',
  })
  expect(codeCallback1[1][0]).toMatchObject({
    name: 'x.0.z',
    origin: name,
    originName: ['x', '0', 'z'],
    rule: 'x.0.z',
  })
  expect(codeCallback1[2][0]).toMatchObject({
    name: 'x.0.z',
    origin: name,
    originName: 'x[0].z',
    rule: 'x[0].z',
  })
  expect(codeCallback1[3][0]).toMatchObject({
    name: 'x.0.z',
    origin: name,
    originName: ['x', 0, 'z'],
    rule: 'x[0].z',
  })

  const nameCallback1 = nameCallback.mock.calls
  expect(nameCallback1[0][0]).toMatchObject({
    name: ['name', '0', 'em'],
    origin: name,
    originName: ['name', '0', 'em'],
    rule: 'name.0.em',
  })
  expect(nameCallback1[1][0]).toMatchObject({
    name: ['name', '0', 'em'],
    origin: name,
    originName: 'name.0.em',
    rule: 'name.0.em',
  })
  expect(nameCallback1[2][0]).toMatchObject({
    name: ['name', '0', 'em'],
    origin: name,
    originName: ['name', 0, 'em'],
    rule: 'name[0].em',
  })
  expect(nameCallback1[3][0]).toMatchObject({
    name: ['name', '0', 'em'],
    origin: name,
    originName: 'name[0].em',
    rule: 'name[0].em',
  })
}

describe('useEventChat 通信路径', () => {
  test('使用不同的路径发起通信: a[0].1', () => {
    renderSubitems('a[0].1')
  })
  test("使用不同的路径发起通信: ['sub', 0, 'age']", () => {
    renderSubitems(['sub', 0, 'age'])
  })
  test("使用不同的路径发起通信: ['w', '0', 'd']", () => {
    renderSubitems(['w', '0', 'd'])
  })
  test('使用不同的路径发起通信: custom.0.name', () => {
    renderSubitems('custom.0.name')
  })
})
