import { useEventChat } from '@event-chat/core'
import { describe, expect, rstest, test } from '@rstest/core'
import { fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { Input } from 'antd'
import z from 'zod'
import FormEvent from '../src'
import RateInput from './components/RateInput'
import { rateNumDetail } from './fixtures/fields'

describe('FormItem', () => {
  test('测试 1：组件能正常渲染子组件', () => {
    render(
      <FormEvent>
        <FormEvent.Item>
          <Input data-testid="test-input" />
        </FormEvent.Item>
      </FormEvent>
    )

    expect(screen.getByTestId('test-input')).toBeInTheDocument()
  })
  test('测试 2：通过 emit 更新表单 & 指定 schema 类型', async () => {
    const getDetail = () => Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000
    const detail1 = Date.now()

    const field1 = 'test-item1'
    const field2 = ['target', 'item-2']
    const group = 'form-item-test-2'
    const input1 = 'test-inpu-1'
    const input2 = 'test-inpu-2'

    render(
      <FormEvent group={group}>
        <FormEvent.Item
          name={field1}
          getValueFromEvent={(param) => (param ? Number(param) : undefined)}
          getValueProps={(value) => ({ value: value || value === 0 ? String(value) : undefined })}
        >
          <Input data-testid={input1} />
        </FormEvent.Item>
        <FormEvent.Item
          initialValue={'0'}
          name={field2}
          schema={z.number()}
          getValueFromEvent={(param) => (param ? Number(param) : undefined)}
          getValueProps={(value) => ({ value: value || value === 0 ? String(value) : undefined })}
        >
          <Input data-testid={input2} />
        </FormEvent.Item>
      </FormEvent>
    )

    const { result } = renderHook(() => useEventChat('publisher', { group }))
    const { emit } = result.current

    expect(screen.getByTestId(input1)).toBeInTheDocument()
    expect(screen.getByTestId(input2)).toBeInTheDocument()

    emit({ detail: detail1, name: field1 })
    await waitFor(() => {
      expect(screen.getByTestId(input1)).toHaveValue(detail1.toString())
    })

    emit({ detail: 'test-fake', name: field2 })
    await waitFor(() => {
      expect(screen.getByTestId(input2)).toHaveValue('0')
    })

    const detail2 = getDetail()
    const detail3 = getDetail()

    emit({ detail: detail2, name: field2 })
    await waitFor(() => {
      expect(screen.getByTestId(input2)).toHaveValue(detail2.toString())
    })

    emit({ detail: detail3, name: field2.join('.') })
    await waitFor(() => {
      expect(screen.getByTestId(input2)).toHaveValue(detail3.toString())
    })
  })
  test('测试 3：联动更新', async () => {
    const { result } = renderHook(() => FormEvent.useForm())
    const [form] = result.current

    render(
      <FormEvent form={form} group="test-group-3">
        <FormEvent.Item name="publisher">
          <Input
            data-testid="publisher-input"
            onChange={({ target }) => form.emit({ detail: target.value, name: 'subscriber' })}
          />
        </FormEvent.Item>
        <FormEvent.Item
          name="subscriber"
          onChange={(value, { emit }) =>
            emit({ detail: value ? `${value}:subscriber` : undefined, name: 'related' })
          }
        >
          <Input data-testid="subscriber-input" />
        </FormEvent.Item>
        <FormEvent.Item name="related">
          <Input data-testid="related-input" />
        </FormEvent.Item>
      </FormEvent>
    )

    const publisher = screen.getByTestId('publisher-input')

    expect(publisher).toBeInTheDocument()
    expect(screen.getByTestId('subscriber-input')).toBeInTheDocument()
    expect(screen.getByTestId('related-input')).toBeInTheDocument()

    const update = Date.now().toString()
    fireEvent.change(publisher, {
      target: { value: update },
    })

    await waitFor(() => {
      expect(screen.getByTestId('publisher-input')).toHaveValue(update)
      expect(screen.getByTestId('subscriber-input')).toHaveValue(update)
      expect(screen.getByTestId('related-input')).toHaveValue(`${update}:subscriber`)
    })
  })
  test('测试 4：监听更新', async () => {
    const options = { group: 'test-group-4', name: 'test-name-4' }
    const { result } = renderHook(() => FormEvent.useForm(options))
    const [form] = result.current

    const dependenFn = rstest.fn(() => null)
    const valuesChangeFn = rstest.fn()

    render(
      <FormEvent form={form} onValuesChange={valuesChangeFn}>
        <FormEvent.Item name="publisher">
          <Input data-testid="publisher-input" />
        </FormEvent.Item>
        <FormEvent.Item dependencies={['publisher']}>{dependenFn}</FormEvent.Item>
      </FormEvent>
    )

    const detail = Date.now().toString()
    form.emit({ name: 'publisher', detail })

    await waitFor(() => {
      expect(screen.getByTestId('publisher-input')).toHaveValue(detail)
      expect(valuesChangeFn).toBeCalled()
      expect(valuesChangeFn).toBeCalledWith({ publisher: detail }, { publisher: detail })
      expect(dependenFn).toBeCalled()
      expect(dependenFn).toBeCalledWith(expect.objectContaining(options))
    })
  })
  test('测试 5：转换字段数据进行渲染', async () => {
    render(
      <FormEvent>
        <FormEvent.Item name="rateInput" schema={rateNumDetail}>
          <RateInput name="rateInput" />
        </FormEvent.Item>
      </FormEvent>
    )
  })
})
