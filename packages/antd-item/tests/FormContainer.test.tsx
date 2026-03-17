import { Mock, afterEach, beforeEach, describe, expect, rstest, test } from '@rstest/core'
import { fireEvent, render, screen } from '@testing-library/react'
import { Form, FormInstance, Input } from 'antd'
import { ReactNode } from 'react'
import FormEvent from '../src'
import FormContainer from '../src/FormContainer'
import * as utils from '../src/utils'

const renderFromItem = () => {
  const formRef = { current: null } as { current: FormInstance | null }
  const TestComponent = () => {
    const [form] = Form.useForm()
    formRef.current = form
    return (
      <FormEvent form={form}>
        <FormEvent.Item name="test-item">
          <FormContainer>
            <Input data-testid="test-input" />
          </FormContainer>
        </FormEvent.Item>
      </FormEvent>
    )
  }

  const renderResult = render(<TestComponent />)
  return { formRef, renderResult }
}

afterEach(() => {
  rstest.restoreAllMocks()
})

beforeEach(() => {
  rstest.clearAllMocks()

  const mockMediaQueryList = {
    matches: false,
    addEventListener: rstest.fn(),
    removeEventListener: rstest.fn(),
    dispatchEvent: rstest.fn(),
  }

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: rstest.fn().mockReturnValue(mockMediaQueryList),
  })
})

describe('FormContainer', () => {
  // 测试 1：组件基础渲染
  test('组件能正常渲染子组件', () => {
    renderFromItem()

    // expect(screen.getByTestId('form-item')).toBeInTheDocument()
    expect(screen.getByTestId('test-input')).toBeInTheDocument()
    expect(window.matchMedia).toHaveBeenCalled()
  })

  test('测试输入', async () => {
    const { formRef } = renderFromItem()

    const inputElement = screen.getByTestId('test-input')

    const inputValue = '你好，测试内容'
    fireEvent.change(inputElement, {
      target: { value: inputValue }, // 模拟输入框的 value 变化
    })

    expect(inputElement).toHaveValue(inputValue)
    console.log(formRef.current?.getFieldsValue())
  })
})
