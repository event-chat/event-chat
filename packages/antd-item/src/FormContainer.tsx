import { FC, PropsWithChildren, useEffect } from 'react'
import { FormEventContextInstance, useFormCom, useFormEvent, useFormInstance } from './utils'

const FormContainer: FC<PropsWithChildren<FormContainerProps>> = ({
  children,
  value,
  onChange,
}) => {
  const Form = useFormCom<{ input: unknown }>()
  const form = useFormInstance<{ input: unknown }>()

  const { focusField, ...formIns } = form
  const { emit } = useFormEvent()

  useEffect(() => {
    form.setFieldValue('input', value)
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
