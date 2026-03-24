import { Publisher, ScrollMessageList, scrollEventName } from '@/module/DebugDemo'
import FormEvent from '@event-chat/antd-item'
import { Tag } from 'antd'
import type { FC } from 'react'
import z from 'zod'
import Card from '@/components/Card'

const schema = z
  .string()
  .min(5, { error: '输入的内容最少需要 5 个字符' })
  .refine((value) => !Number.isNaN(Number(value)), {
    error: '只能接受纯数字的文字',
  })

const PublisherInput: FC = () => {
  const [form] = FormEvent.useForm()
  return (
    <Publisher
      form={form}
      list={<ScrollMessageList />}
      schema={schema}
      pubDebug={(detail) => form.emit({ name: scrollEventName, detail })}
    />
  )
}

const DebugLog: FC = () => {
  return (
    <div className="flex flex-col gap-16">
      <div>
        <Tag>debug</Tag> 是 <Tag>@event-chat/core</Tag>{' '}
        默认提供的调试方法，用于开发者方便调试使用；这里为了符合实际开发的情况，使用{' '}
        <Tag>@event-chat/antd-item</Tag> 做演示。
      </div>
      <Card
        title={
          <>
            <Tag>FormContainer</Tag> 用例
          </>
        }
      >
        <div className="py-4">
          <PublisherInput />
        </div>
      </Card>
    </div>
  )
}

export default DebugLog
