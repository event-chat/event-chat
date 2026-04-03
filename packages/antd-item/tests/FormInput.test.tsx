import { EventChatOptions, NamepathType, useEventChat } from '@event-chat/core'
import { describe, expect, rstest, test } from '@rstest/core'
import { act, render, renderHook, waitFor } from '@testing-library/react'
import { useRef } from 'react'
import z from 'zod'
import FormEvent, { FormInputInstance } from '../src'
import FormInput from '../src/FormInput'
import { FormItemProvider } from '../src/FormProvider'
import { detailInfo, providerDetail } from './fixtures/fields'

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
  test('测试 2：提供 name、schema、上下文，发起通信', async () => {
    const { group, name } = providerDetail
    const errorDetail = { price: 2, type: 'strawberry' }

    const callbackMock = rstest.fn()
    const debugMock = rstest.fn()

    const { result } = renderHook(() => {
      const { emit: targgerEmit } = useEventChat(detailInfo.name, { group })
      const inputRef = useRef<FormInputInstance>(null)

      return [inputRef, targgerEmit] as const
    })

    const [targetRef, emit] = result.current
    render(
      <FormEvent group={group}>
        <FormInput
          name={name}
          ref={targetRef}
          schema={z.object({
            price: z.number().min(1).max(100),
            type: z.union([z.literal('apple'), z.literal('banana'), z.literal('origin')]),
          })}
          callback={callbackMock}
          debug={debugMock}
        />
      </FormEvent>
    )

    await waitFor(() => {
      expect(debugMock).toBeCalledTimes(1)
      expect(debugMock).toBeCalledWith(expect.objectContaining({ status: 'init' }))
    })

    await act(() => {
      emit({ detail: { price: 5, type: 'origin' }, name })
    })

    expect(callbackMock).toBeCalledTimes(1)
    expect(callbackMock).toBeCalledWith(
      expect.objectContaining({ detail: { price: 5, type: 'origin' }, name }),
      expect.objectContaining({ emit: targetRef.current?.emit })
    )

    await act(() => {
      emit({ detail: errorDetail, name })
    })

    expect(debugMock).toBeCalledTimes(2)
    expect(debugMock).toBeCalledWith(expect.objectContaining({ status: 'invalid' }))
    expect(debugMock.mock.calls.slice(-1)[0][0]).toMatchObject({ data: { detail: errorDetail } })
  })
  test('测试 3：提供 parent 会自动组合上下文，发起通信', async () => {
    const { group, name } = providerDetail
    const callbackMock = rstest.fn()

    const { result } = renderHook(() => {
      const { emit: targgerEmit } = useEventChat(detailInfo.name, { group })
      const inputRef = useRef<FormInputInstance>(null)

      return [inputRef, targgerEmit] as const
    })

    const [targetRef, emit] = result.current
    const sendInfo = { detail: 'test', name: [detailInfo.name, name] }

    render(
      <FormEvent group={group}>
        <FormItemProvider parent={detailInfo.name} emit={() => {}}>
          <FormInput name={name} ref={targetRef} callback={callbackMock} />
        </FormItemProvider>
      </FormEvent>
    )

    await act(() => {
      emit(sendInfo)
    })

    expect(callbackMock).toBeCalledTimes(1)
    expect(callbackMock).toBeCalledWith(
      expect.objectContaining(sendInfo),
      expect.objectContaining({ emit: targetRef.current?.emit })
    )
  })
  test('测试 4：不同的组，不能相互通信', async () => {
    const { group, name } = providerDetail
    const callbackMock = rstest.fn()

    const { result } = renderHook(() => {
      const { emit: targgerEmit } = useEventChat(detailInfo.name)
      const inputRef = useRef<FormInputInstance>(null)

      return [inputRef, targgerEmit] as const
    })

    const [targetRef, emit] = result.current
    const sendInfo = { detail: 'test', name: [detailInfo.name, name] }

    render(
      <FormEvent group={group}>
        <FormItemProvider parent={detailInfo.name} emit={() => {}}>
          <FormInput name={name} ref={targetRef} callback={callbackMock} />
        </FormItemProvider>
      </FormEvent>
    )

    await act(() => {
      emit(sendInfo)
    })

    expect(callbackMock).not.toBeCalled()
  })
})
