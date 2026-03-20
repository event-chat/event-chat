import { Button, Input, Space } from 'antd'
import { FC, PropsWithChildren, useEffect } from 'react'
import FormEvent, { FormEventInstance } from '../../src'
import { detailInfo } from '../fixtures/fields'

export const BaseForm: FC<PropsWithChildren<BaseFormProps>> = ({ children, form, group, name }) => (
  <FormEvent form={form} group={group} name={name}>
    <FormEvent.Item name="test-item">{children}</FormEvent.Item>
  </FormEvent>
)

export const CustomInput: FC<CustomInputProps> = ({ onMount }) => {
  const formInstance = FormEvent.useFormInstance()
  useEffect(() => {
    onMount?.(formInstance)
  }, [])

  return (
    <Space.Compact>
      <Input data-testid="test-input" />
      <Button data-testid="test-btn" onClick={() => formInstance.emit?.(detailInfo)}>
        click it
      </Button>
    </Space.Compact>
  )
}

interface BaseFormProps {
  form?: FormEventInstance<string, string | undefined, unknown>
  group?: string
  name?: string
}

interface CustomInputProps {
  onMount?: (form: ReturnType<typeof FormEvent.useFormInstance>) => void
}
