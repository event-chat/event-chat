import { describe, expect, rstest, test } from '@rstest/core'
import { fireEvent, render, screen } from '@testing-library/react'
import { Form, FormInstance, Input } from 'antd'
import FormEvent from '../src'
import * as utils from '../src/utils'

const renderFromItem = (
  initialValues?: Record<string, unknown>,
  onChange?: (value: unknown, emit?: utils.FormEventContextInstance['emit']) => void
) => {
  const formRef: { current: FormInstance | null } = { current: null }
  const fieldName = 'test-item'

  const TestComponent = () => {
    const [form] = Form.useForm()
    formRef.current = form
    return (
      <FormEvent form={form} initialValues={initialValues}>
        <FormEvent.Item name={fieldName}>
          <FormEvent.Container onChange={onChange}>
            <Input data-testid="test-input" />
          </FormEvent.Container>
        </FormEvent.Item>
      </FormEvent>
    )
  }

  const renderResult = render(<TestComponent />)
  return { fieldName, formRef, renderResult }
}

describe('FormContainer', () => {
  test('测试 1：组件能正常渲染子组件', () => {
    const useFormCom = rstest.spyOn(utils, 'useFormCom').mockReturnValue(Form)
    renderFromItem()

    expect(screen.getByTestId('test-input')).toBeInTheDocument()
    expect(window.matchMedia).toHaveBeenCalled()

    // FormEvent、FormInitialization、FormEvent.Item、FormEvent.Container
    expect(useFormCom).toHaveBeenCalledTimes(4)
    useFormCom.mockRestore()
  })

  test('测试 2：测试输入，触发表单更新', () => {
    const onChangeFn = rstest.fn()
    const mockEmit = rstest.fn()

    const useFormEventSpy = rstest.spyOn(utils, 'useFormEvent').mockReturnValue({
      emit: mockEmit,
    })

    const { fieldName, formRef } = renderFromItem(undefined, onChangeFn)
    const inputElement = screen.getByTestId('test-input')

    const inputValue = '你好，测试内容'
    fireEvent.change(inputElement, {
      target: { value: inputValue }, // 模拟输入框的 value 变化
    })

    expect(inputElement).toHaveValue(inputValue)
    expect(formRef.current).not.toBeNull()
    expect(formRef.current?.getFieldsValue()).toEqual({ [fieldName]: inputValue })

    expect(onChangeFn).toHaveBeenCalled()
    expect(onChangeFn).toHaveBeenCalledTimes(1)
    expect(onChangeFn).toHaveBeenCalledWith(inputValue, mockEmit)

    expect(mockEmit).not.toHaveBeenCalled()

    useFormEventSpy.mockRestore()
  })

  test('测试 3：设置表单初始值', () => {
    const inputValue = '表单默认值'
    const { formRef } = renderFromItem({ ['test-item']: inputValue })
    const inputElement = screen.getByTestId('test-input')

    expect(inputElement).toBeInTheDocument()
    expect(inputElement).toHaveValue(inputValue)

    expect(formRef.current).not.toBeNull()
    expect(formRef.current?.getFieldsValue()).toEqual({ ['test-item']: inputValue })
  })

  test('测试 4：测试执行过程', () => {
    const setFieldValueMock = rstest.fn(
      (name: Parameters<FormInstance['setFieldValue']>[0], value: unknown) => [name, value]
    )

    const useFormMock = rstest.fn(<Value,>(value?: FormInstance<Value>) => {
      const [formInstance] = Form.useForm(value)
      return [
        Object.assign({}, formInstance, {
          setFieldValue: (name: Parameters<FormInstance['setFieldValue']>[0], value: unknown) => {
            setFieldValueMock(name, value)
            return formInstance.setFieldValue(name, value)
          },
        }),
      ]
    })

    const useFormCom = rstest.spyOn(utils, 'useFormCom').mockReturnValue(
      Object.assign({}, Form, {
        useForm: useFormMock,
      })
    )

    const initValue = '初始化数据'
    render(
      <FormEvent.Container value={initValue}>
        <Input />
      </FormEvent.Container>
    )

    expect(useFormCom).toHaveBeenCalledTimes(1)
    expect(useFormMock).toHaveBeenCalledTimes(1)
    expect(setFieldValueMock).toHaveBeenCalledTimes(1)
    expect(setFieldValueMock).toHaveBeenCalledWith('input', initValue)

    useFormCom.mockRestore()
  })
})
