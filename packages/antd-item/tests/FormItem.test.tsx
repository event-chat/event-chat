import { useEventChat } from '@event-chat/core'
import { describe, expect, rstest, test } from '@rstest/core'
import { fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { Input } from 'antd'
import { useRef } from 'react'
import z from 'zod'
import FormEvent, { FormInputInstance } from '../src'
import CustomInput from './components/CustomInput'
import RateInput from './components/RateInput'
import TransformItem from './components/TransformItem'
import { rateInputSchema, rateNumDetail } from './fixtures/fields'

const convertCode = (param: unknown) => {
  const { data, success } = rateNumDetail.safeParse(param)
  return success ? `${data.numerator}:${data.denominator}` : undefined
}

const convertData = (value: unknown) => {
  const [numerator = 1, denominator = 1] =
    !value && value !== 0
      ? []
      : String(value)
          .split(':')
          .map(Number)
          .filter((num) => !Number.isNaN(num))

  return {
    denominator: Math.max(denominator, 1),
    numerator: Math.max(numerator, 1),
  }
}

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
  test('测试 5：转换字段类型进行渲染', async () => {
    const { result } = renderHook(() => FormEvent.useForm())
    const [form] = result.current

    render(
      <TransformItem
        form={form}
        group="test-group-5"
        item="rateInput"
        schema={rateInputSchema.transform(convertData)}
        getValueFromEvent={convertCode}
        getValueProps={(value) => ({ value: convertData(value) })}
      >
        <RateInput name="rateInput" />
      </TransformItem>
    )

    expect(screen.getByTestId('rateInput:denominator')).toBeInTheDocument()
    expect(screen.getByTestId('rateInput:numerator')).toBeInTheDocument()

    // 因为初始化会发起 getValueFromEvent
    await waitFor(() => {
      expect(screen.getByTestId('rateInput:denominator')).toHaveValue('1')
      expect(screen.getByTestId('rateInput:numerator')).toHaveValue('1')
    })

    const update1 = '1:2'
    form.emit({ detail: update1, name: 'rateInput' })

    await waitFor(() => {
      expect(screen.getByTestId('rateInput:denominator')).not.toHaveValue('1')
      expect(screen.getByTestId('rateInput:denominator')).toHaveValue('2')
      expect(screen.getByTestId('rateInput:numerator')).toHaveValue('1')
      expect(form.getFieldsValue()).toEqual({ rateInput: update1 })
    })
  })
  test('测试 6：转换字段数据进行渲染', async () => {
    const { result } = renderHook(() => FormEvent.useForm())
    const [form] = result.current

    render(
      <TransformItem
        form={form}
        group="test-group-6"
        item="rateInput"
        schema={rateInputSchema.transform(convertData)}
        transform={convertCode}
      >
        <RateInput name="rateInput" />
      </TransformItem>
    )

    expect(screen.getByTestId('rateInput:denominator')).toBeInTheDocument()
    expect(screen.getByTestId('rateInput:numerator')).toBeInTheDocument()

    const update1 = '1:2'
    form.emit({ detail: update1, name: 'rateInput' })

    await waitFor(() => {
      expect(screen.getByTestId('rateInput:denominator')).not.toHaveValue('1')
      expect(screen.getByTestId('rateInput:denominator')).toHaveValue('2')
      expect(screen.getByTestId('rateInput:numerator')).toHaveValue('1')
      expect(form.getFieldsValue()).toEqual({
        rateInput: {
          denominator: 2,
          numerator: 1,
        },
      })
    })
  })
  test('测试 7：分段 + 异步验证自', async () => {
    const faild = {
      domain: '邮箱地址必须以 @event.chat 结尾',
      format: '请输入有效的邮箱格式',
      reg: '该邮箱已注册，邮箱账号必须数字结尾',
      unknown: '未知错误',
    }

    const debugFn = rstest.fn()
    const fetchFn = rstest.fn((email: string) => {
      return new Promise((resolve) => {
        const result = /.*\d$/.test(email.split('@')[0])
        return resolve(result)
      })
    })

    const { result } = renderHook(() => FormEvent.useForm())
    const [form] = result.current

    render(
      <FormEvent form={form} group="test-group-7">
        <FormEvent.Item
          name="mail-item"
          schema={z.email({ error: faild.format }).pipe(
            z
              .email()
              .refine((email) => email.endsWith('@event.chat'), {
                error: faild.domain,
              })
              .pipe(
                z.email().refine(fetchFn, {
                  error: faild.reg,
                })
              )
          )}
          debug={({ error, status }) => {
            if (status === 'invalid') debugFn(error?.issues.slice(-1)[0].message ?? faild.unknown)
          }}
          async
        >
          <Input data-testid="test-input" />
        </FormEvent.Item>
      </FormEvent>
    )

    form.emit({ detail: 'fake-data', name: 'mail-item' })
    await waitFor(() => {
      expect(fetchFn).not.toBeCalled()
      expect(debugFn).toBeCalledTimes(1)
      expect(debugFn).toBeCalledWith(faild.format)
    })

    form.emit({ detail: 'levi@gmail.com', name: 'mail-item' })
    await waitFor(() => {
      expect(fetchFn).not.toBeCalled()
      expect(debugFn).toBeCalledTimes(2)
      expect(debugFn).toBeCalledWith(faild.domain)
    })

    form.emit({ detail: 'levi@event.chat', name: 'mail-item' })
    await waitFor(() => {
      expect(fetchFn).toBeCalledTimes(1)
      expect(debugFn).toBeCalledTimes(3)
      expect(debugFn).toBeCalledWith(faild.reg)
    })
  })
  test('测试 8：触发字段更新的方式', async () => {
    const { result } = renderHook(() => {
      const [form] = FormEvent.useForm()
      const itemRef = useRef<FormInputInstance>(null)
      return [form, itemRef] as const
    })

    const [form, itemRef] = result.current
    render(
      <FormEvent form={form} group="test-group-8">
        <FormEvent.Item
          name="pub-item-1"
          onChange={(detail, { emit }) => emit({ name: 'sub-item', detail })}
        >
          <Input data-testid="test-input-1" />
        </FormEvent.Item>
        <FormEvent.Item item={itemRef} name="pub-item-2">
          <Input data-testid="test-input-2" />
        </FormEvent.Item>
        <FormEvent.Item name="pub-item-3">
          <CustomInput data-testid="test-input-3" target="sub-item" />
        </FormEvent.Item>
        <FormEvent.Item name="sub-item">
          <Input data-testid="sub-input" />
        </FormEvent.Item>
      </FormEvent>
    )

    expect(screen.getByTestId('test-input-1')).toBeInTheDocument()
    expect(screen.getByTestId('test-input-2')).toBeInTheDocument()
    expect(screen.getByTestId('test-input-3')).toBeInTheDocument()
    expect(screen.getByTestId('sub-input')).toBeInTheDocument()

    form.emit({ detail: '1', name: 'sub-item' })
    await waitFor(() => {
      expect(screen.getByTestId('sub-input')).toHaveValue('1')
    })

    form.emit({ detail: '2', name: 'pub-item-1' })
    await waitFor(() => {
      expect(screen.getByTestId('test-input-1')).toHaveValue('2')
      expect(screen.getByTestId('sub-input')).not.toHaveValue('1')
      expect(screen.getByTestId('sub-input')).toHaveValue('2')
    })

    itemRef.current?.emit({ detail: '3', name: 'sub-item' })
    await waitFor(() => {
      expect(screen.getByTestId('sub-input')).not.toHaveValue('1')
      expect(screen.getByTestId('sub-input')).not.toHaveValue('2')
      expect(screen.getByTestId('sub-input')).toHaveValue('3')
    })

    const input = screen.getByTestId('test-input-3')
    fireEvent.change(input, { target: { value: '4' } })

    await waitFor(() => {
      expect(screen.getByTestId('test-input-3')).toHaveValue('4')
      expect(screen.getByTestId('sub-input')).not.toHaveValue('1')
      expect(screen.getByTestId('sub-input')).not.toHaveValue('2')
      expect(screen.getByTestId('sub-input')).not.toHaveValue('3')
      expect(screen.getByTestId('sub-input')).toHaveValue('4')
    })
  })
})
