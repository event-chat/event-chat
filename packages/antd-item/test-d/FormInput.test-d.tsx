import { EventChatOptions, EventDetailType, NamepathType, useEventChat } from '@event-chat/core'
import { useRef } from 'react'
import { expectAssignable, expectType } from 'tsd'
import z from 'zod'
import FormInput, { FormInputProps } from '../dist/FormInput'
import { FormInputInstance } from '../dist/utils'

// ==============================================
// 1. 测试泛型约束：Schema 必须是 ZodType 类型
// ==============================================
expectAssignable<FormInputProps<z.ZodString>>({ schema: z.string() })
expectAssignable<FormInputProps<z.ZodNumber>>({ schema: z.number() })
expectAssignable<FormInputProps<z.ZodObject>>({ schema: z.object() })
expectAssignable<FormInputProps<z.ZodObject<{ name: z.ZodString }>>>({
  schema: z.object({ name: z.string() }),
})

// ==============================================
// 2. 测试基础 Props 类型合法性
// ==============================================
type StringInputProps = FormInputProps<z.ZodString>
const validStringProps: StringInputProps = {
  name: 'user-input',
  callback: (target, options) => {
    // 检验 callback 入参类型
    expectType<CallbackRecordType<z.ZodString>>(target)
    expectType<ReturnType<typeof useEventChat>>(options)
  },
  onChange: (detail, options) => {
    expectType<string>(detail)
    expectType<ReturnType<typeof useEventChat>>(options)
  },
}

expectType<StringInputProps>(validStringProps)

// 支持 NamepathType 数组格式
expectAssignable<StringInputProps>({
  name: ['form', 'username'],
})

// ==============================================
// 3. 测试 onChange 回调值类型匹配 Zod Schema
// ==============================================
type NumberInputProps = FormInputProps<z.ZodNumber>
const numberProps: NumberInputProps = {
  onChange: (detail) => {
    expectType<number>(detail)
    detail.toFixed()
  },
}

expectType<NumberInputProps>(numberProps)

// ==============================================
// 4. 测试组件
// ==============================================
const validRef = useRef<FormInputInstance>(null)
expectType<JSX.Element>(<FormInput<z.ZodString> name="test" ref={validRef} schema={z.string()} />)

// 接受无 props
expectType<JSX.Element>(<FormInput />)

// 补全属性
expectType<JSX.Element>(
  <FormInput
    lang={{}}
    name="test"
    ref={validRef}
    schema={z.boolean().refine(() => Promise.resolve(true))}
    callback={(record, options) => {
      expectType<CallbackRecordType<z.ZodBoolean>>(record)
      expectType<ReturnType<typeof useEventChat>>(options)
    }}
    filter={(info) => {
      expectAssignable<EventDetailType<Boolean>>(info)
      return true
    }}
    onChange={(detail, options) => {
      expectType<boolean>(detail)
      expectType<ReturnType<typeof useEventChat>>(options)
    }}
    async
  />
)

type CallbackRecordType<TYPE extends z.ZodType> = Parameters<
  NonNullable<EventChatOptions<NamepathType, TYPE, string, string>['callback']>
>[0]
