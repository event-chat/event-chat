import FormEvent from '@event-chat/antd-item'
import { type FormItemProps, Input } from 'antd'
import type { ComponentProps, ReactNode } from 'react'
import { tv } from 'tailwind-variants'
import type { ZodType } from 'zod'

const styles = tv({
  slots: {
    message: 'rounded bg-gray-800 p-4',
    warp: 'flex max-w-150 flex-col gap-2',
  },
})

const { message, warp } = styles()

const Publisher = <Schema extends ZodType>({
  extra,
  list,
  schema,
  pubDebug,
  subDebug,
}: PublisherProps<Schema>) => (
  <FormEvent labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
    <div className={warp()}>
      <FormEvent.Item extra={extra} label="主控字段" name="publisher" debug={pubDebug}>
        <Input placeholder="" />
      </FormEvent.Item>
      <FormEvent.Item label="受控字段" name="subscriber" schema={schema} debug={subDebug}>
        <Input disabled />
      </FormEvent.Item>
      <div className={message()}>{list}</div>
    </div>
  </FormEvent>
)

export default Publisher

interface PublisherProps<Schema extends ZodType>
  extends
    Pick<ComponentProps<typeof FormEvent<string>>, 'form'>,
    ItemType<Schema>,
    Pick<FormItemProps, 'extra'> {
  list?: ReactNode
}

type FormItemType<Schema extends ZodType> = ComponentProps<typeof FormEvent.Item<Schema, FormValue>>
type FormValue = Record<'publisher' | 'subscriber', string>

type ItemType<Schema extends ZodType> = Pick<FormItemType<Schema>, 'schema'> & {
  pubDebug?: FormItemType<Schema>['debug']
  subDebug?: FormItemType<Schema>['debug']
}
