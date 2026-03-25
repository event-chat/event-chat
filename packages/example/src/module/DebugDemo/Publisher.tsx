import FormEvent, { type FormInputInstance } from '@event-chat/antd-item'
import { type FormItemProps, Input } from 'antd'
import { type ComponentProps, type ReactNode, useRef } from 'react'
import type { ZodType } from 'zod'
import { styles } from './utils'

const subField = 'subscriber'
const { message, warp } = styles()

const Publisher = <Schema extends ZodType>({
  extra,
  form,
  list,
  schema,
  pubDebug,
  subDebug,
}: PublisherProps<Schema>) => {
  const pubRef = useRef<FormInputInstance>(null)
  return (
    <FormEvent form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
      <div className={warp()}>
        <FormEvent.Item
          extra={extra}
          item={pubRef}
          label="主控字段"
          name="publisher"
          debug={pubDebug}
        >
          <Input
            placeholder="请输入主控表单内容"
            onChange={({ target }) =>
              pubRef.current?.emit({ detail: target.value, name: subField })
            }
          />
        </FormEvent.Item>
        <FormEvent.Item label="受控字段" name={subField} schema={schema} debug={subDebug}>
          <Input disabled />
        </FormEvent.Item>
        <div className={message()}>{list}</div>
      </div>
    </FormEvent>
  )
}

export default Publisher

interface PublisherProps<Schema extends ZodType>
  extends
    Pick<ComponentProps<typeof FormEvent<string, string | undefined>>, 'form'>,
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
