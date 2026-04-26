import FormEvent from '@event-chat/antd-item'
import { Form, Input } from 'antd'
import { type FC } from 'react'

const FormContainerDemo: FC = () => {
  const [form] = Form.useForm()
  return (
    <FormEvent form={form}>
      <FormEvent.Item name="test-item">
        <FormEvent.Container>
          <Input data-testid="test-input" />
        </FormEvent.Container>
      </FormEvent.Item>
      <Form.Item shouldUpdate>
        {() => <pre>{JSON.stringify(form.getFieldsValue(), null, 2)}</pre>}
      </Form.Item>
    </FormEvent>
  )
}

export default FormContainerDemo
