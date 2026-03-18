import { describe, expect, rstest, test } from '@rstest/core'
import { render, screen } from '@testing-library/react'
import { Form, FormInstance, Input } from 'antd'
import { ReactNode } from 'react'
import FormEvent from '../src'
import * as utils from '../src/utils'

const renderFormItem = () => {
  const formRef: { current: FormInstance | null } = { current: null }
  const fieldName = 'test-item'

  const TestComponent = () => {
    const [form] = Form.useForm()
    return (
      <FormEvent form={form}>
        <FormEvent.Item>
          <Input data-testid="test-input" />
        </FormEvent.Item>
      </FormEvent>
    )
  }

  const renderResult = render(<TestComponent />)
  return { fieldName, formRef, renderResult }
}

describe('FormEvent', () => {
  test('测试 1：组件能正常渲染子组件', () => {
    renderFormItem()

    expect(screen.getByTestId('test-input')).toBeInTheDocument()
    expect(window.matchMedia).toHaveBeenCalled()
  })

  //     test('当 form 不匹配时，渲染 FormInitialization', async () => {
  //     // 1. Mock FormInitialization（替换为自定义组件，便于断言）
  //     const MockFormInitialization = rstest.fn(({ children }: { children: ReactNode }) => <div data-testid="mock-initialization">{children}</div>)
  //     rstest.spyOn(FormEvent, 'FormInitialization').mockImplementation(MockFormInitialization)

  //     // 2. 构造不匹配的 form 实例（name/group 不一致）
  //     const mockForm = {
  //       name: 'wrong-name',
  //       group: 'wrong-group',
  //       emit: rstest.fn(),
  //       focusField: rstest.fn(),
  //     }

  //     // 3. 渲染 FormEvent
  //     render(
  //       <FormEvent
  //         form={mockForm}
  //         name="test-name"
  //         group="test-group"
  //       >
  //         <input data-testid="test-child" />
  //       </FormEvent>
  //     )

  //     // 4. 验证核心逻辑
  //     // 验证 MockFormInitialization 被调用
  //     expect(MockFormInitialization).toHaveBeenCalled()
  //     // 验证传递给 FormInitialization 的 props 正确
  //     expect(MockFormInitialization).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         name: 'test-name',
  //         group: 'test-group',
  //         form: mockForm,
  //       }),
  //       expect.anything()
  //     )
  //     // 验证 DOM 中存在 Mock 的 FormInitialization
  //     expect(screen.getByTestId('mock-initialization')).toBeInTheDocument()

  //     // 清理 Mock
  //     utils.FormInitialization.mockRestore()
  //   })
})
