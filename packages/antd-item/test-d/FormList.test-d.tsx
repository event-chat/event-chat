import { EventChatOptions, EventDetailType, NamepathType, useEventChat } from '@event-chat/core'
import { Form, FormListFieldData, FormListOperation } from 'antd'
import { ComponentProps, ReactNode, useRef } from 'react'
import { expectAssignable, expectType } from 'tsd'
import z from 'zod'
import FormList from '../dist/FormList'
import { FormInputInstance } from '../dist/utils'

const children: ComponentProps<typeof Form.List>['children'] = (fields, options, meta) => {
  expectType<FormListFieldData[]>(fields)
  expectType<FormListOperation>(options)
  expectType<{ errors: ReactNode[]; warnings: ReactNode[] }>(meta)
  return null
}

// ==============================================
// 1. 测试泛型约束：Schema 必须是 SchemaType 类型
// ==============================================
expectAssignable<FormListProps<SchemaType>>({ children })
expectAssignable<FormListProps<SchemaType>>({
  schema: z.array(z.number()),
  children,
})
expectAssignable<FormListProps<SchemaType>>({
  schema: z.array(z.number()).optional(),
  children,
})

// ==============================================
// 2. 测试基础 Props 类型合法性
// ==============================================
type ArrayInputProps = FormListProps<z.ZodArray<z.ZodNumber>>
const itemRef = useRef<FormInputInstance>(null)
const validListProps: ArrayInputProps = {
  async: true,
  initialValue: [3, 54, 2, 1],
  item: itemRef,
  lang: {},
  name: 'list-input',
  schema: z.array(z.number()).refine(() => Promise.resolve(true)),
  callback: (target, options) => {
    // 检验 callback 入参类型
    expectType<CallbackRecordType<z.ZodArray<z.ZodNumber>>>(target)
    expectType<ReturnType<typeof useEventChat>>(options)
  },
  filter: (info) => {
    expectAssignable<EventDetailType<unknown>>(info)
    return true
  },
  onChange: (detail, options) => {
    expectType<number[]>(detail)
    expectType<ReturnType<typeof useEventChat>>(options)
  },
  children,
}

expectType<ArrayInputProps>(validListProps)

// 支持 NamepathType 数组格式
expectAssignable<ArrayInputProps>({
  name: ['form', 'username'],
  children,
})

// ==============================================
// 3. 测试组件
// ==============================================
expectType<JSX.Element>(
  <FormList item={itemRef} name="test" schema={z.array(z.number())} children={children} />
)

// 补全属性
expectType<JSX.Element>(<FormList {...validListProps} />)

// ==============================================
// 4. 支持 children
// ==============================================
// 除了 children 接受无 props
expectType<JSX.Element>(<FormList>{children}</FormList>)

type CallbackRecordType<TYPE extends SchemaType> = Parameters<
  NonNullable<EventChatOptions<NamepathType, TYPE, string, string>['callback']>
>[0]

type FormListProps<Schema extends SchemaType> = ComponentProps<typeof FormList<Schema>>

type SchemaType = z.ZodArray | z.ZodOptional<z.ZodArray>
