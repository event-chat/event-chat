import { describe, expect, rstest, test } from '@rstest/core'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import z from 'zod'
import { BaseListDemo } from './components/FormListDemo'
import { listBaseInitial, listBaseSchema, listFieldName, renderItemTestid } from './fixtures/fields'

describe('FormList', () => {
  test('测试 1：组件能正常渲染子组件', () => {
    render(<BaseListDemo />)
    listBaseInitial.forEach(({ itemDemo }, index) => {
      const targetNode = screen.getByTestId(renderItemTestid(index))
      expect(targetNode).toBeInTheDocument()
      expect(targetNode).toHaveValue(itemDemo)
    })
  })
  test('测试 2：像 list 发送更新，触发依赖响应', async () => {
    const record: { current: z.infer<typeof listBaseSchema> } = { current: [] }
    const updateMock = rstest.fn(() => {
      const recordData = Array.from({ length: 3 }, (_, index) => ({
        itemDemo: `${Date.now()}:${index}`,
      }))

      record.current = recordData
      return record.current
    })

    render(<BaseListDemo update={updateMock} />)
    const button = screen.getByTestId('test-btn')

    expect(screen.getByTestId('test-input')).toHaveValue('2')
    expect(button).toBeInTheDocument()

    fireEvent.click(button)

    expect(record.current).not.toBeNull()
    expect(updateMock).toBeCalledTimes(1)

    await waitFor(() => {
      expect(screen.getByTestId('test-input')).toHaveValue('3')
      record.current.forEach(({ itemDemo }, index) => {
        const targetNode = screen.getByTestId(renderItemTestid(index))
        expect(targetNode).toBeInTheDocument()
        expect(targetNode).toHaveValue(itemDemo)
      })
    })
  })
  test('测试 3：联动更新 list 相对表单项', async () => {
    render(<BaseListDemo />)

    const firstInput = screen.getByTestId(renderItemTestid(0))
    const firstDate = Date.now().toString()

    fireEvent.change(firstInput, {
      target: { value: firstDate },
    })

    await waitFor(() => {
      expect(screen.getByTestId(renderItemTestid(1))).toHaveValue(firstDate)
    })
  })
})
