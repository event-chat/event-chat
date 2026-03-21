import { EventChatOptions, NamepathType, useEventChat } from '@event-chat/core'
import { describe, expect, rstest, test } from '@rstest/core'
import { act, render, renderHook } from '@testing-library/react'
import { useRef } from 'react'
import { FormInputInstance } from '../src'
import FormInput from '../src/FormInput'
import { detailInfo } from './fixtures/fields'

describe('FormInput', () => {
  test('测试 1：不提供任何上下文，发起通信', async () => {
    const record: { detail: 'test'; name: null | NamepathType } = { detail: 'test', name: null }
    const { name } = detailInfo

    const eventCallbackMock = rstest.fn<NonNullable<EventChatOptions<typeof name>['callback']>>(
      ({ origin }) => {
        record.name = origin
      }
    )

    const { result } = renderHook(() => {
      const inputRef = useRef<FormInputInstance>(null)
      const { emit } = useEventChat(name, {
        callback: eventCallbackMock,
      })

      return [inputRef, emit] as const
    })

    const [targetRef, triggerEmit] = result.current
    const inputCallbackMock = rstest.fn()
    const onChangeMock = rstest.fn()

    render(<FormInput ref={targetRef} callback={inputCallbackMock} onChange={onChangeMock} />)
    await act(() => {
      targetRef.current?.emit({ name })
    })

    expect(eventCallbackMock).toBeCalled()
    expect(eventCallbackMock).toBeCalledTimes(1)
    expect(eventCallbackMock).toBeCalledWith(
      expect.objectContaining({ originName: name, rule: name, name })
    )

    expect(record.name).not.toBeNull()
    await act(() => {
      triggerEmit({ detail: record.detail, name: record.name ?? 'empty-input' })
    })

    expect(inputCallbackMock).toBeCalled()
    expect(inputCallbackMock).toBeCalledTimes(1)
    expect(inputCallbackMock).toBeCalledWith(
      expect.objectContaining({
        detail: 'test',
        name: record.name,
        origin: name,
        originName: record.name,
        rule: Array.isArray(record.name) ? record.name.join('.') : record.name,
      }),
      expect.objectContaining({ emit: targetRef.current?.emit })
    )

    expect(onChangeMock).toBeCalled()
    expect(onChangeMock).toBeCalledTimes(1)
    expect(onChangeMock).toBeCalledWith(
      record.detail,
      expect.objectContaining({ emit: targetRef.current?.emit })
    )
  })
})
