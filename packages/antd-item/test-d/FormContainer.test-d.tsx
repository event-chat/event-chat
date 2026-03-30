import { expectType } from 'tsd'
import FormContainer from '../dist/FormContainer'
import { FormEventContextInstance } from '../dist/utils'

// ==============================================
// 测试 1：组件基础渲染（空 Props，全可选属性合法）
// ==============================================
expectType<JSX.Element>(<FormContainer />)

// ==============================================
// 测试 2：支持 children（PropsWithChildren 生效）
// ==============================================
expectType<JSX.Element>(
  <FormContainer>
    <div>children element</div>
  </FormContainer>
)

// ==============================================
// 测试 3：value 属性（unknown 类型，支持任意值）
// ==============================================
expectType<JSX.Element>(<FormContainer value={123} />)
expectType<JSX.Element>(<FormContainer value="string" />)
expectType<JSX.Element>(<FormContainer value={{ key: 'obj' }} />)
expectType<JSX.Element>(<FormContainer value={undefined} />)

// ==============================================
// 测试 4：onChange 函数参数类型严格匹配
// ==============================================
// 合法 onChange：参数类型完全对齐定义
const validOnChange = (value: unknown, emit: FormEventContextInstance['emit']) =>
  emit?.({ detail: value, name: 'test-name' })

expectType<JSX.Element>(<FormContainer onChange={validOnChange} />)

// ==============================================
// 测试 5：完整 Props 组合
// ==============================================
const fullProps = {
  value: 'test',
  onChange: validOnChange,
}
expectType<JSX.Element>(
  <FormContainer {...fullProps}>
    <div>children element</div>
  </FormContainer>
)
