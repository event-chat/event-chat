import FormEvent from '@event-chat/antd-item'
import type { FC } from 'react'
import Publisher from './Publisher'
import ScrollMessageList from './ScrollMessageList'
import { schema, scrollEventName } from './utils'

const SubscriberInput: FC = () => {
  const [form] = FormEvent.useForm({ group: 'subscriber-input' })
  return (
    <Publisher
      extra="只有长度大于 5 的纯数字的字符类型才能触发更新"
      form={form}
      list={<ScrollMessageList />}
      schema={schema}
      subDebug={(detail) => {
        // 放入队列以便组件入栈后收集初始化通知
        Promise.resolve()
          .then(() =>
            form.emit({
              detail: { ...detail, error: detail.error?.issues.slice(-1)[0].message },
              name: scrollEventName,
            })
          )
          .catch(() => ({}))
      }}
    />
  )
}

export default SubscriberInput
