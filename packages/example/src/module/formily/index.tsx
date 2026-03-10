import { createForm } from '@formily/core'
import { FormProvider } from '@formily/react'
import type { FC } from 'react'
import SchemaField from './SchemaField'

const form = createForm()

const FormilyModule: FC = () => (
  <FormProvider form={form}>
    <SchemaField>
      <SchemaField.String
        name="name"
        x-component="Input"
        x-decorator="FormItem"
        x-decorator-props={{ label: 'test' }}
      />
    </SchemaField>
  </FormProvider>
)

export default FormilyModule
