import { expectAssignable, expectType } from 'tsd'
import FormEvent, { FormBaseInstance } from '../dist/index'
import { useForm, useFormInstance } from '../dist/utils'

// ==============================================
// 测试1：FormEvent 是 JSX 组件
// ==============================================
expectType<JSX.Element>(<FormEvent />)
expectType<JSX.Element>(<FormEvent.Container />)
expectType<JSX.Element>(<FormEvent.Item />)
expectType<JSX.Element>(<FormEvent.List children={() => null} />)

// ==============================================
// 测试2：静态属性存在
// ==============================================
expectType<(FormCom: FormBaseInstance) => void>(FormEvent.observer)
expectType<typeof useForm>(FormEvent.useForm)
expectType<typeof useFormInstance>(FormEvent.useFormInstance)

// ==============================================
// 测试3：测试 hooks 返回类型
// ==============================================
const [form] = FormEvent.useForm()
const formInstance = FormEvent.useFormInstance()

expectAssignable<ReturnType<typeof useForm>[0]>(form)
expectAssignable<ReturnType<typeof useFormInstance>>(formInstance)

// ==============================================
// 测试4：返回类型等价
// ==============================================
expectAssignable<readonly [typeof form]>(useForm())
expectAssignable<typeof formInstance>(useFormInstance())

// ==============================================
// 测试5：包含 children
// ==============================================
expectType<JSX.Element>(
  <FormEvent>
    <div>children element</div>
  </FormEvent>
)

expectType<JSX.Element>(
  <FormEvent.Container>
    <div>children element</div>
  </FormEvent.Container>
)

expectType<JSX.Element>(
  <FormEvent.Item>
    <div>children element</div>
  </FormEvent.Item>
)

expectType<JSX.Element>(<FormEvent.List>{() => null}</FormEvent.List>)
