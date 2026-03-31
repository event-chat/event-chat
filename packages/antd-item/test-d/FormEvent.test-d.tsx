import { ComponentProps } from 'react'
import { expectAssignable, expectType } from 'tsd'
import FormEvent from '../dist/FormEvent'
import { useForm } from '../dist/utils'

// ==============================================
// 测试 1：组件基础渲染（空 Props，全可选属性合法）
// ==============================================
expectType<JSX.Element>(<FormEvent />)

// ==============================================
// 测试 2：支持 children（PropsWithChildren 生效）
// ==============================================
expectType<JSX.Element>(
  <FormEvent>
    <div>children element</div>
  </FormEvent>
)

// ==============================================
// 测试 3：完整 Props 组合
// ==============================================
const [form] = useForm()
expectType<JSX.Element>(
  <FormEvent form={form} group="group" name="form">
    <div>children element</div>
  </FormEvent>
)

// ==============================================
// 测试 4：FormEvent 的 Props 相当于一个 formInstance
// ==============================================
expectAssignable<FormEventProps<string>>(form)

// ==============================================
// 测试 5：Props 接受的类型
// ==============================================
expectAssignable<FormEventProps<string>>({})

// 全部类型
expectAssignable<FormEventProps<string, string>>({ group: 'group', name: 'form', form })

type FormEventProps<
  Name extends string,
  Group extends string | undefined = undefined,
  ValuesType = unknown,
> = ComponentProps<typeof FormEvent<Name, Group, ValuesType>>
