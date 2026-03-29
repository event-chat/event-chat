import { ComponentProps, PropsWithChildren } from 'react'
import { ZodType } from 'zod'
import FormEvent from '../../src'
import RateInput from './RateInput'

const TransformItem = <Schema extends ZodType>({
  children,
  form,
  group,
  item,
  schema,
  ...props
}: PropsWithChildren<TransformItemProps<Schema>>) => (
  <FormEvent form={form} group={group}>
    <FormEvent.Item {...props} name={item} schema={schema}>
      {children}
    </FormEvent.Item>
  </FormEvent>
)

export default TransformItem

interface TransformItemProps<Schema extends ZodType>
  extends
    Pick<ComponentProps<typeof FormEvent>, 'form' | 'group'>,
    Pick<
      ComponentProps<typeof FormEvent.Item<Schema>>,
      'schema' | 'getValueFromEvent' | 'getValueProps' | 'transform'
    > {
  item: string
}
