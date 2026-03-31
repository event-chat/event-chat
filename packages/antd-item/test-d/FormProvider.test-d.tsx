import { EventDetailType, ExcludeKey } from '@event-chat/core'
import { ComponentProps, NamedExoticComponent, PropsWithChildren } from 'react'
import { expectAssignable, expectType } from 'tsd'
import { FormItemProvider, FormProvider } from '../dist/FormProvider'
import { FormEventContextInstance } from '../dist/utils'

// ==============================================
// 1. 核心测试：校验组件导出类型正确
// ==============================================
expectType<NamedExoticComponent<FormProviderProps>>(FormProvider)
expectType<NamedExoticComponent<FormItemProviderProps>>(FormItemProvider)

// ==============================================
// 2. 测试基础 Props 类型合法性
// ==============================================
const validFormProps: FormProviderProps = {
  group: 'group',
  name: 'form',
  parent: 'provider',
  emit: (result) => {
    expectAssignable<Omit<EventDetailType, ExcludeKey>>(result)
  },
}

const validFormItemProps: FormItemProviderProps = {
  parent: 'provider',
  emit: (result) => {
    expectAssignable<Omit<EventDetailType, ExcludeKey>>(result)
  },
}

expectType<FormProviderProps>(validFormProps)
expectType<FormItemProviderProps>(validFormItemProps)

// ==============================================
// 3. 测试组件
// ==============================================
expectType<JSX.Element>(<FormProvider {...validFormProps} />)

// 支持空 props
expectType<JSX.Element>(<FormProvider />)

// FormItemProvider
expectType<JSX.Element>(<FormItemProvider {...validFormItemProps} />)

// FormItemProvider 仅需要 emit
expectType<JSX.Element>(<FormItemProvider emit={validFormItemProps.emit} />)

// ==============================================
// 4. 支持 children（PropsWithChildren 生效）
// ==============================================
expectType<JSX.Element>(
  <FormProvider>
    <div>children element</div>
  </FormProvider>
)

expectType<JSX.Element>(
  <FormItemProvider {...validFormItemProps}>
    <div>children element</div>
  </FormItemProvider>
)

type FormItemProviderProps = ComponentProps<typeof FormItemProvider>
type FormProviderProps = PropsWithChildren<FormEventContextInstance>
