import { EventDetailType, ExcludeKey, NamepathType } from '@event-chat/core'
import { Form, FormInstance } from 'antd'
import { ComponentProps, FC, RefObject } from 'react'
import { expectAssignable, expectType } from 'tsd'
import {
  AntdCom,
  FormBaseInstance,
  FormEventContext,
  FormEventContextInstance,
  FormEventInstance,
  FormInputInstance,
  FormInsType,
  getStringValue,
  useForm,
  useFormCom,
  useFormEvent,
  useFormInstance,
  useFormItemEmit,
} from '../dist/utils'

// ------------------------------
// 1. 常量类型测试
// ------------------------------
expectType<{ form?: FormBaseInstance }>(AntdCom)
expectAssignable<React.Context<FormEventContextInstance>>(FormEventContext)

// ------------------------------
// 2. 工具函数 getStringValue 测试
// ------------------------------
// 正常入参
expectType<string | undefined>(getStringValue(['name', 'age', 'page.user']))
expectType<undefined>(getStringValue([]))
expectType<number | string[] | undefined>(getStringValue([123, ['a']]))

// ------------------------------
// 3. 核心钩子 useForm 测试
// ------------------------------
// 基础用法
const [form1] = useForm<'form', 'group', { input: string }>({ group: 'group', name: 'form' })
expectType<'group' | undefined>(form1.group)
expectType<string>(form1.name)
expectType<FormInstance<{ input: string }>['validateFields']>(form1.validateFields)
expectType<
  <Detail, CustomName extends NamepathType>(
    record: Omit<EventDetailType<Detail, CustomName>, ExcludeKey>
  ) => void
>(form1.emit)

// 不传值
const [form2] = useForm()
expectType<undefined>(form2.group)
expectType<string>(form2.name)

// ------------------------------
// 4. 钩子 useFormInstance 测试
// ------------------------------
const formInstance = useFormInstance<{ input: string }>()
expectType<string | undefined>(formInstance.group)
expectType<NamepathType | undefined>(formInstance.name)
expectType<FormEventInstance<NamepathType>['emit']>(formInstance.emit)
expectType<FormInstance<{ input: string }>['getFieldsValue']>(formInstance.getFieldsValue)

// ------------------------------
// 5. 钩子 useFormCom 测试
// ------------------------------
const FormCom = useFormCom<{ userName: string }>()
expectAssignable<FormBaseInstance<{ userName: string }>>(FormCom)
expectAssignable<FC>(FormCom.Item)
expectAssignable<
  FC<Pick<ComponentProps<typeof Form.List>, 'children' | 'initialValue' | 'name' | 'rules'>>
>(FormCom.List)

// ------------------------------
// 6. 钩子 useFormEvent 测试
// ------------------------------
const formEvent = useFormEvent()
expectType<FormEventContextInstance>(formEvent)
expectType<string | undefined>(formEvent.group)
expectType<NamepathType | undefined>(formEvent.name)

// ------------------------------
// 7. 钩子 useFormItemEmit 测试
// ------------------------------
const originRef = { current: { emit: () => {} } }
const [itemRef, emitFn] = useFormItemEmit(originRef)
expectType<RefObject<FormInputInstance>>(itemRef)
expectType<FormInputInstance['emit']>(emitFn)

// 无参调用
const [emptyRef, emptyEmit] = useFormItemEmit()
expectType<RefObject<FormInputInstance>>(emptyRef)
expectType<FormInputInstance['emit']>(emptyEmit)

// ------------------------------
// 8. 接口/类型 可分配性测试
// ------------------------------
// FormBaseInstance
expectAssignable<FormBaseInstance>(Form)

// FormEventContextInstance
expectAssignable<FormEventContextInstance>({
  group: 'test-group',
  name: 'test-name',
  parent: 'test-parent',
  emit: () => {},
})

// 空对象兼容
expectAssignable<FormEventContextInstance>({})

// FormEventInstance
expectAssignable<FormEventInstance<string, 'group', { input: string }>>(form1)

// FormInputInstance
expectAssignable<FormInputInstance>({ emit: () => {} })

// FormInsType
expectAssignable<FormInsType<{ input: string }>>(formInstance)
