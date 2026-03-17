import FormEvent from '@event-chat/antd-item'
import { Form, Input } from 'antd'
import FormContainer from 'node_modules/@event-chat/antd-item/dist/FormContainer'
import { type FC } from 'react'

FormEvent.observer(Form)

// const FormInput: FC<PropsWithChildren<Pick<InputProps, 'value' | 'onChange'>>> = ({ children, value, onChange }) => {
//     // useEffect(() => {}, [])
//     return (
//   <Form component={false}>
//     <Form.Item name="input">
//       {children}
//     </Form.Item>
//   </Form>
// )
// }

const FormContainerDemo: FC = () => {
  const [form] = Form.useForm()
  return (
    <FormEvent form={form}>
      <FormEvent.Item name="test-item">
        <FormContainer>
          <Input data-testid="test-input" />
        </FormContainer>
      </FormEvent.Item>
      <Form.Item shouldUpdate>
        {() => <pre>{JSON.stringify(form.getFieldsValue(), null, 2)}</pre>}
      </Form.Item>
    </FormEvent>
  )
}

export default FormContainerDemo
