import { useEventChat } from '@event-chat/core'
import { describe, expect, rstest, test } from '@rstest/core'
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { Form, FormProps } from 'antd'
import { ComponentProps, FC, PropsWithChildren } from 'react'
import FormEvent from '../src'
import * as utils from '../src/utils'
import Consumer from './components/Consumer'
import ProviderDemo from './components/ProviderDemo'
import { detailInfo, providerDetail } from './fixtures/fields'

const createMockForm = () => {
  const FormMock = ({ children }: PropsWithChildren<FormProps>) => <div>{children}</div>
  const Item: utils.FormBaseInstance<unknown>['Item'] = ({ children }) => (
    <div>{typeof children === 'function' ? 'empty children' : children}</div>
  )

  const List: FC<ComponentProps<typeof Form.List>> = ({ children, ...props }) => (
    <Form.List {...props}>{(fields, options, meta) => children(fields, options, meta)}</Form.List>
  )

  return {
    Form: Object.assign(FormMock, {
      useForm: rstest.fn(() => Form.useForm()),
      useFormInstance: rstest.fn(() => Form.useFormInstance()),
      Item,
      List,
    }),
  }
}

describe('getStringValue', () => {
  test('返回第一个非 undefined 值', () => {
    const result = utils.getStringValue([undefined, 'a', 'b'])
    expect(result).toBe('a')
  })
  test('忽略空数组', () => {
    const result = utils.getStringValue([[], 'a'])
    expect(result).toBe('a')
  })
  test('全部无效返回 undefined', () => {
    const result = utils.getStringValue([undefined, []])
    expect(result).toBeUndefined()
  })
})

describe('useForm', () => {
  test('使用默认的 hooks，不提供任何参数去触发事件', async () => {
    const items = ['item1', ['item2', 'subname']] as const
    const callbackMock1 = rstest.fn()
    const callbackMock2 = rstest.fn()

    const { result: formResult } = renderHook(() => {
      const [formInstance] = utils.useForm()
      const publish = useEventChat(items[0], {
        callback: callbackMock1,
      })

      const subscribe = useEventChat(items[1], {
        callback: callbackMock2,
      })

      return { formInstance, publish, subscribe }
    })

    const { publish, formInstance } = formResult.current
    const { name } = formInstance
    const info = { detail: items.map((itemName) => ({ name: itemName, value: detailInfo })), name }

    await act(() => {
      publish.emit(info)
    })

    await waitFor(() => {
      expect(callbackMock1).toBeCalled()
      expect(callbackMock1).toBeCalledTimes(1)
      expect(callbackMock1).toBeCalledWith(
        expect.objectContaining({ detail: detailInfo, originName: items[0] })
      )

      expect(callbackMock2).toBeCalled()
      expect(callbackMock2).toBeCalledTimes(1)
      expect(callbackMock2).toBeCalledWith(
        expect.objectContaining({ detail: detailInfo, originName: items[1] })
      )
    })
  })
  test('提供参数')
})

describe('useFormCom', () => {
  test('没有提供 Form 的情况下使用项目依赖的 Form', () => {
    const result = utils.useFormCom()
    expect(result).toBe(Form)
  })
  test('提供 Form 的情况下，返回提供的 Form', () => {
    const { Form: FormMock } = createMockForm()
    FormEvent.observer(FormMock)

    const result = utils.useFormCom()
    expect(result).toBe(FormMock)
  })
})

describe('useFormEvent', () => {
  test('没有提供 Provider 情况下得到空对象', () => {
    const { result } = renderHook(() => utils.useFormEvent())
    expect(result.current).toEqual({})
  })
  test('FormItemProvider 继承 context', () => {
    const { detailInfo, group, name, parent } = providerDetail
    const testEmit = rstest.fn()
    render(
      <ProviderDemo emit={testEmit}>
        <Consumer />
      </ProviderDemo>
    )

    const textContent = screen.getByTestId('ctx').textContent
    const button = screen.getByRole('button')

    fireEvent.click(button)

    expect(screen.getByTestId('ctx')).toBeInTheDocument()
    expect(button).toBeInTheDocument()

    expect(textContent).toContain(`"group":"${group}"`)
    expect(textContent).toContain(`"name":"${name}"`)
    expect(textContent).toContain(`"parent":"${parent}"`)

    expect(testEmit).toHaveBeenCalled()
    expect(testEmit).toHaveBeenCalledTimes(1)
    expect(testEmit).toHaveBeenCalledWith(detailInfo)
  })
})

describe('useFormItemEmit', () => {
  test('提供 ref 触发更新', () => {
    const emitMock = rstest.fn()
    const ref = {
      current: {
        emit: emitMock,
      },
    }

    const { result } = renderHook(() => utils.useFormItemEmit(ref))
    const [item, emit] = result.current

    emit(detailInfo)
    expect(item).not.toBeNull()
    expect(emitMock).toBeCalled()
    expect(emitMock).toBeCalledTimes(1)
    expect(emitMock).toBeCalledWith(detailInfo)
  })
  test('使用内部默认的 item', () => {
    // 保留，后面用 FormItem 来模拟
  })
})
