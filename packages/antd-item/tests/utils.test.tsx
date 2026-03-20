import { useEventChat } from '@event-chat/core'
import { describe, expect, rstest, test } from '@rstest/core'
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { Form, FormProps } from 'antd'
import { ComponentProps, FC, PropsWithChildren } from 'react'
import FormEvent from '../src'
import * as utils from '../src/utils'
import { BaseForm, CustomInput } from './components/FormInstance'
import { detailInfo, providerDetail } from './fixtures/fields'
import { ItemContextProvider } from './helpers/UnitProvider'

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
  test('提供原始的 form 等初始选项后，将在此基础上扩展', async () => {
    const { group, name } = providerDetail
    const subItem = 'sub-item'

    const callbackMock = rstest.fn()
    const { result } = renderHook(() => {
      const [formInit] = Form.useForm()
      const [formInstance] = utils.useForm({ group, name }, formInit)

      useEventChat(subItem, {
        callback: callbackMock,
        group,
      })

      return Object.freeze({ formInit, formInstance })
    })

    const { formInit: targetInit, formInstance: formIns } = result.current
    await act(() => {
      formIns.emit({ detail: detailInfo, name: subItem })
    })

    expect(formIns).toBe(targetInit)
    expect(formIns.group).toEqual(group)
    expect(formIns.name).toEqual(name)

    await waitFor(() => {
      expect(callbackMock).toBeCalled()
      expect(callbackMock).toBeCalledTimes(1)
      expect(callbackMock).toBeCalledWith(
        expect.objectContaining({
          detail: detailInfo,
          name: subItem, // 接收方原始名称
          origin: name, // 只有 name 表示发送方
          originName: subItem, // 仍旧是接收方原始名称
          rule: subItem, // 转换路径后的接收方名称
          group,
        })
      )
    })
  })
  test('提供一个已经扩展的 form，将沿用此对象', async () => {
    const { group, name } = providerDetail
    const newGruop = 'new-group'
    const newName = 'new-name'
    const subItem = 'sub-item'

    const callbackMock = rstest.fn()
    const { result } = renderHook(() => {
      const [formInit] = Form.useForm()
      const [formInstance] = utils.useForm(
        { group, name },
        Object.assign(formInit, { group: newGruop, name: newName })
      )

      useEventChat(subItem, {
        callback: callbackMock,
        group: newGruop,
      })

      return Object.freeze({ formInit, formInstance })
    })

    const { formInit: targetInit, formInstance: formIns } = result.current
    await act(() => {
      formIns.emit({ detail: detailInfo, name: subItem })
    })

    expect(formIns).toBe(targetInit)
    expect(formIns.group).toEqual(newGruop)
    expect(formIns.name).toEqual(newName)

    await waitFor(() => {
      expect(callbackMock).toBeCalled()
      expect(callbackMock).toBeCalledTimes(1)
      expect(callbackMock).toBeCalledWith(
        expect.objectContaining({
          detail: detailInfo,
          group: newGruop,
          name: subItem, // 接收方原始名称
          origin: newName, // 只有 name 表示发送方
          originName: subItem, // 仍旧是接收方原始名称
          rule: subItem, // 转换路径后的接收方名称
        })
      )
    })
  })
})

describe('useFormInstance', () => {
  test('通过 FormEvent 拿到 form 实例', async () => {
    const { name } = detailInfo
    const formIns: { current: ReturnType<typeof utils.useFormInstance> | null } = {
      current: null,
    }

    render(
      <BaseForm>
        <CustomInput
          onMount={(formTarget) => {
            formIns.current = formTarget
          }}
        />
      </BaseForm>
    )

    const button = screen.getByTestId('test-btn')
    const callbackMock = rstest.fn()

    renderHook(() => {
      useEventChat(name, {
        callback: callbackMock,
      })
    })

    fireEvent.click(button)

    expect(screen.getByTestId('test-input')).toBeInTheDocument()
    expect(button).toBeInTheDocument()

    await waitFor(() => {
      expect(formIns.current).not.toBeNull()
      expect(callbackMock).toBeCalled()
      expect(callbackMock).toBeCalledTimes(1)
      expect(callbackMock).toBeCalledWith(expect.objectContaining(detailInfo))
    })
  })
  test('全部通过 FormEvent 提供上下文', async () => {
    const { group, name } = providerDetail
    const formIns: { current: ReturnType<typeof utils.useFormInstance> | null } = {
      current: null,
    }

    render(
      <BaseForm group={group} name={name}>
        <CustomInput
          onMount={(formTarget) => {
            formIns.current = formTarget
          }}
        />
      </BaseForm>
    )

    await waitFor(() => {
      expect(formIns.current).not.toBeNull()
      expect(formIns.current?.group).toEqual(group)
      expect(formIns.current?.name).toEqual(name)
    })
  })
  test('提供 formInstance 合并 FormEvent 提供上下文', async () => {
    const { group, name } = providerDetail
    const formIns: { current: ReturnType<typeof utils.useFormInstance> | null } = {
      current: null,
    }

    const { result } = renderHook(() =>
      FormEvent.useForm({ group: 'hooks-group', name: 'hooks-name' })
    )

    const [formInit] = result.current
    render(
      <BaseForm form={formInit} group={group} name={name}>
        <CustomInput
          onMount={(formTarget) => {
            formIns.current = formTarget
          }}
        />
      </BaseForm>
    )

    await waitFor(() => {
      expect(formIns.current).not.toBeNull()
      // expect(formIns.current?.group).toEqual(group)
      // expect(formIns.current?.name).toEqual(name)
    })
  })
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
  test('FormItemProvider 继承 context', ItemContextProvider)
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
