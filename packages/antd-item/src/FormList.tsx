import { checkDetail } from '@event-chat/core'
import { Form as FormRaw } from 'antd'
import { ComponentProps, RefObject, useMemo } from 'react'
import { ZodType } from 'zod'
import FormInput, { FormInputProps } from './FormInput'
import { FormItemProvider } from './FormProvider'
import { FormInputInstance, useFormCom, useFormItemEmit } from './utils'

const isNamepath = (value: unknown): value is number | string =>
  typeof value === 'string' || Number.isInteger(value)

const FormList = <Schema extends ZodType>({
  async,
  initialValue,
  item,
  name,
  rules,
  schema,
  type,
  callback,
  children,
  debug,
  onChange,
  ...props
}: FormListProps<Schema>) => {
  const Form = useFormCom()
  const fieldName = useMemo(
    () =>
      (Array.isArray(name) ? name.filter(isNamepath) : undefined) ??
      (isNamepath(name) ? name : undefined),
    [name]
  )

  const [inputRef, emit] = useFormItemEmit(item)
  return !fieldName ? null : (
    <>
      <Form.List
        {...props}
        initialValue={initialValue}
        name={fieldName}
        rules={
          !schema
            ? rules
            : (rules ?? []).concat([
                {
                  validator: (_, value) => checkDetail(value, { async, schema }),
                },
              ])
        }
      >
        {(fields, options, metas) => (
          <FormItemProvider parent={name} emit={emit}>
            {children(fields, options, metas)}
          </FormItemProvider>
        )}
      </Form.List>
      <Form.Item {...props} name={fieldName} hidden>
        <FormInput
          async={async}
          name={fieldName}
          ref={inputRef}
          schema={schema}
          type={type}
          callback={callback}
          debug={debug}
          onChange={onChange}
        />
      </Form.Item>
    </>
  )
}

export default FormList

interface FormListProps<Schema extends ZodType>
  extends Omit<ComponentProps<typeof FormRaw.List>, 'name'>, FormInputProps<Schema> {
  item?: RefObject<FormInputInstance>
}
