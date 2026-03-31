import { EventChatOptions, EventDetailType, NamepathType, useEventChat } from '@event-chat/core'
import { ComponentProps, useRef } from 'react'
import { expectAssignable, expectType } from 'tsd'
import z from 'zod'
import FormItem from '../dist/FormItem'
import { FormInputInstance } from '../dist/utils'

// ==============================================
// 1. 测试泛型约束：Schema 必须是 ZodType 类型
// ==============================================
expectAssignable<FormItemProps<z.ZodString>>({ schema: z.string() })
expectAssignable<FormItemProps<z.ZodNumber>>({ schema: z.number() })
expectAssignable<FormItemProps<z.ZodObject>>({ schema: z.object() })
expectAssignable<FormItemProps<z.ZodObject<{ name: z.ZodString }>>>({
  schema: z.object({ name: z.string() }),
})

// ==============================================
// 2. 测试基础 Props 类型合法性
// ==============================================
type StringInputProps = FormItemProps<z.ZodString>
const itemRef = useRef<FormInputInstance>(null)
const validStringProps: StringInputProps = {
  async: true,
  initialValue: 'test-init',
  item: itemRef,
  lang: {},
  name: 'user-input',
  schema: z.string().refine(() => Promise.resolve(true)),
  callback: (target, options) => {
    // 检验 callback 入参类型
    expectType<CallbackRecordType<z.ZodString>>(target)
    expectType<ReturnType<typeof useEventChat>>(options)
  },
  filter: (info) => {
    expectAssignable<EventDetailType<unknown>>(info)
    return true
  },
  onChange: (detail, options) => {
    expectType<string>(detail)
    expectType<ReturnType<typeof useEventChat>>(options)
  },
  transform: (value) => value,
}

expectType<StringInputProps>(validStringProps)

// 支持 NamepathType 数组格式
expectAssignable<StringInputProps>({
  name: ['form', 'username'],
})

// ==============================================
// 3. 测试组件
// ==============================================
expectType<JSX.Element>(<FormItem item={itemRef} name="test" schema={z.string()} />)

// 接受无 props
expectType<JSX.Element>(<FormItem />)

// 补全属性
expectType<JSX.Element>(<FormItem {...validStringProps} />)

// ==============================================
// 4. 支持 children（PropsWithChildren 生效）
// ==============================================
expectType<JSX.Element>(
  <FormItem>
    <div>children element</div>
  </FormItem>
)

type CallbackRecordType<TYPE extends z.ZodType> = Parameters<
  NonNullable<EventChatOptions<NamepathType, TYPE, string, string>['callback']>
>[0]

type FormItemProps<Schema extends z.ZodType, ValueType = unknown> = ComponentProps<
  typeof FormItem<Schema, ValueType>
>
