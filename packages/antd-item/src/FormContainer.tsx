import { FC, PropsWithChildren, useEffect } from 'react'
import { FormEventContextInstance, useFormCom, useFormEvent } from './utils'

const getInputData = (input: unknown) =>
  typeof input === 'object' && input !== null ? JSON.stringify(input) : input

const FormContainer: FC<PropsWithChildren<FormContainerProps>> = ({
  children,
  value,
  onChange,
}) => {
  const Form = useFormCom<{ input: unknown }>()
  const [form] = Form.useForm<{ input: unknown }>()

  const { focusField, ...formIns } = form
  const { emit } = useFormEvent()

  useEffect(() => {
    try {
      const { input } = form.getFieldsValue()
      if (getInputData(input) !== getInputData(value)) form.setFieldValue('input', value)
    } catch {
      // 无需额外代码，注释已满足 no-empty 规则
    }
  }, [form, value])

  return (
    <Form
      form={{ ...formIns, focusField: focusField ?? (() => {}) }}
      component={false}
      onValuesChange={({ input }) => onChange?.(input, emit)}
    >
      <Form.Item name="input">{children}</Form.Item>
    </Form>
  )
}

export default FormContainer

interface FormContainerProps {
  value?: unknown
  onChange?: (value: unknown, emit?: FormEventContextInstance['emit']) => void
}
