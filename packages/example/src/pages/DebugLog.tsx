import { Publisher, ScrollMessageList, scrollEventName } from '@/module/DebugDemo'
import { FooterTips } from '@/module/form'
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
  const [form] = FormEvent.useForm({ group: 'publisher-input' })
  return (
    <Publisher
      extra="只有长度大于 5 的纯数字的字符类型才能粗发更新"
      form={form}
      list={<ScrollMessageList />}
      schema={schema}
      pubDebug={(detail) => {
        // 放入队列以便组件入栈后收集初始化通知
        Promise.resolve()
          .then(() => form.emit({ name: scrollEventName, detail }))
          .catch(() => ({}))
      }}
    />
  )
}

const SubscriberInput: FC = () => {
  const [form] = FormEvent.useForm({ group: 'subscriber-input' })
  return (
    <Publisher
      extra="只有长度大于 5 的纯数字的字符类型才能粗发更新"
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

const DebugLog: FC = () => {
  return (
    <div className="flex flex-col gap-16">
      <div>
        <Tag>debug</Tag> 是 <Tag>@event-chat/core</Tag>{' '}
        默认提供的调试方法，用于开发者方便调试使用；这里为了符合实际开发的情况，使用{' '}
        <Tag>@event-chat/antd-item</Tag> 做演示。
      </div>
      <Card
        footer={
          <FooterTips>
            <div>
              <p>
                通过 <Tag>useEventChat</Tag> 返回的 <Tag>emit</Tag> 发起的更新，并在自身{' '}
                <Tag>Hooks</Tag> 上通过 <Tag>debug</Tag> 调试日志。
              </p>
              <p>
                当发送信息的事件名，并非 <Tag>emit</Tag> 所属的事件对象时，可以接受到 3 类信息：
              </p>
              <ul className="ml-6 list-disc py-4">
                <li>
                  <Tag>init</Tag>：主控的 <Tag>Hooks</Tag> 初始化后触发
                </li>
                <li>
                  <Tag>emit</Tag>：随每次消息发送而触发，无论发送的消息最终是否会被接收
                </li>
                <li>
                  <Tag>lost</Tag>：发送消息时遇到异常不能继续，通常是路径解析异常，<Tag>emit</Tag>{' '}
                  和 <Tag>lost</Tag> 二者会根据发送情况只能出现其中 1 个
                </li>
              </ul>
              <p>
                常用于主控方发送消息后，受控方没有正常响应时进行调试。因为在发送过程中，尤其{' '}
                <Tag>@event-chat/antd-item</Tag>{' '}
                这样的组件，开发者只能看到提供的路径名，而发送过程中提交的信息、计算的路径可以通过{' '}
                <Tag>debug</Tag> 回调函数中获取
              </p>
              <p>
                在 <Tag>emit</Tag> 类型的消息中，可以看到 4 个名称：
              </p>
              <ul className="ml-6 list-disc py-4">
                <li>
                  <Tag>name</Tag>：接收方名称，在发送方看到的是发送方提供的名称，接收方通过{' '}
                  <Tag>callback</Tag>{' '}
                  拿到的是自身提供事件名，二者经过计算会变为一致的路径名，而发送和接收在定义的时候可能不一样
                </li>
                <li>
                  <Tag>origin</Tag>：发送方名称，用于证明来源的事件名
                </li>
                <li>
                  <Tag>originName</Tag>：发送方提供的接收方名称，不做任何转化
                </li>
                <li>
                  <Tag>rule</Tag>：发送后经过计算的名称
                </li>
              </ul>
            </div>
          </FooterTips>
        }
        title="跟踪发布者"
      >
        <div className="py-4">
          <PublisherInput />
        </div>
      </Card>
      <Card
        footer={
          <FooterTips>
            <div>
              <p>
                在接受事件名的 <Tag>useEventCaht</Tag> 上通过 <Tag>debug</Tag>
                方法获取调试日志，可以接受到 2 类信息：
              </p>
              <ul className="ml-6 list-disc py-4">
                <li>
                  <Tag>init</Tag>：受控的 <Tag>Hooks</Tag> 初始化后触发
                </li>
                <li>
                  <Tag>invalid</Tag>
                  ：发送方通过路径名发送和接受事件名匹配相符，但不符合受控接受规则，例如：组名不符、
                  <Tag>schema</Tag> 不符等，若发送的信息匹配接受规则，会通过 <Tag>callback</Tag>{' '}
                  回调信息，不会触发 <Tag>debug</Tag>
                </li>
              </ul>
              <p>
                常用于主控发送的消息已匹配接收方事件名，但未被接受方匹配的消息；因为开发者只能看到设置的规则，而发送的消息为何没有匹配规则，可以通过{' '}
                <Tag>debug</Tag> 获取具体原因。
              </p>
            </div>
          </FooterTips>
        }
        title="跟踪订阅者"
      >
        <div className="py-4">
          <SubscriberInput />
        </div>
      </Card>
    </div>
  )
}

export default DebugLog
