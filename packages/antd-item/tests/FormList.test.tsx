import { useEventChat } from '@event-chat/core'
import { describe, expect, rstest, test } from '@rstest/core'
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import z from 'zod'
import { BaseListDemo, SimpleListDemo } from './components/FormListDemo'
import {
  errorMessage,
  listBaseInitial,
  listBaseSchema,
  listFieldName,
  renderItemTestid,
} from './fixtures/fields'

const group = 'form-list-schema'

describe('FormList', () => {
  test('测试 1：组件能正常渲染列表中的子组件', () => {
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
      expect(screen.getByTestId(renderItemTestid(0))).toHaveValue(firstDate)
      expect(screen.getByTestId(renderItemTestid(1))).toHaveValue(firstDate)
    })

    const addBtn = screen.getByTestId('test-add-btn')
    expect(addBtn).toBeInTheDocument()

    fireEvent.click(addBtn)
    await waitFor(() => {
      expect(screen.getByTestId('test-input')).toHaveValue('3')
      expect(screen.getByTestId(renderItemTestid(2))).toBeInTheDocument()
    })

    const secondInput = screen.getByTestId(renderItemTestid(1))
    const secondDate = Date.now().toString()

    fireEvent.change(secondInput, {
      target: { value: secondDate },
    })

    await waitFor(() => {
      expect(screen.getByTestId(renderItemTestid(1))).toHaveValue(secondDate)
      expect(screen.getByTestId(renderItemTestid(2))).toHaveValue(secondDate)
    })
  })
  test('测试 4：list 只响应有效的数组类型', async () => {
    const { result } = renderHook(() => useEventChat('send-list-update', { group }))
    const { emit } = result.current

    render(<SimpleListDemo group={group} />)
    await waitFor(() => {
      expect(screen.getByTestId('test-input')).toHaveValue('0')
    })

    // 使用错误的数据发起更新
    await act(() => {
      emit({ detail: 'fake data', name: listFieldName.list })
      emit({ detail: ['fake item'], name: listFieldName.list })
    })

    await waitFor(() => {
      expect(screen.getByTestId('test-input')).toHaveValue('0')
    })

    // 使用正确的数据发起更新
    emit({
      detail: Array.from({ length: 3 }, (_, index) => ({
        itemDemo: `${Date.now()}:${index}`,
      })),
      name: listFieldName.list,
    })

    await waitFor(() => {
      expect(screen.getByTestId('test-input')).toHaveValue('3')
    })
  })
  test('测试 5：保留 list 原有的特性', async () => {
    const onFinish = rstest.fn()
    const onFinishFailed = rstest.fn()

    const { result } = renderHook(() => useEventChat('send-list-update', { group }))
    const { emit } = result.current

    const error = '列表中最少需要添加 3 项字段'
    const detail = Array.from({ length: 3 }, (_, index) => ({
      itemDemo: `${Date.now()}:${index}`,
    }))

    render(
      <SimpleListDemo
        group={group}
        schema={listBaseSchema.min(3, { error })}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      />
    )

    const submit = screen.getByTestId('test-submit-btn')
    expect(submit).toBeInTheDocument()

    fireEvent.click(submit)
    await waitFor(() => {
      expect(onFinishFailed).toHaveBeenCalledTimes(1)
      expect(onFinishFailed).toHaveBeenCalledWith(
        expect.objectContaining({ message: errorMessage['list'] })
      )
    })

    const addBtn = screen.getByTestId('test-add-btn')
    expect(addBtn).toBeInTheDocument()

    fireEvent.click(addBtn)
    await waitFor(() => {
      expect(screen.getByTestId('test-input')).toHaveValue('1')
    })

    fireEvent.click(submit)
    await waitFor(() => {
      expect(onFinishFailed).toHaveBeenCalledTimes(2)
      expect(onFinishFailed).toHaveBeenCalledWith(expect.objectContaining({ message: error }))
    })

    emit({
      name: listFieldName.list,
      detail,
    })

    await waitFor(() => {
      expect(screen.getByTestId('test-input')).toHaveValue('3')
    })

    fireEvent.click(submit)
    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledTimes(1)
      expect(onFinish).toHaveBeenCalledWith({ [listFieldName.list]: detail })
    })
  })
})
