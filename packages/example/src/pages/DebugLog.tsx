import { ErrorDemo, PublisherInput, SingleEvent, SubscriberInput } from '@/module/DebugDemo'
import { FooterTips } from '@/module/form'
import { Tag } from 'antd'
import type { FC } from 'react'
import Card from '@/components/Card'

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
                <Tag>lost</Tag>：发送消息时遇到异常不能继续，通常是路径解析异常，<Tag>emit</Tag> 和{' '}
                <Tag>lost</Tag> 二者会根据发送情况只能出现其中 1 个
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
                拿到的是自身的事件名，二者经过计算会变为一致的路径名，而发送和接收在定义的时候可能不一样
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
          </FooterTips>
        }
        title="跟踪订阅者"
      >
        <div className="py-4">
          <SubscriberInput />
        </div>
      </Card>
      <Card
        footer={
          <FooterTips>
            <p>
              收发都是同一事件名的情况下，不建议在 <Tag>debug</Tag> 中使用 <Tag>emit</Tag>
            </p>
            <ul className="ml-6 list-disc py-4">
              <li>
                如果要 <Tag>emit</Tag> 仅限 <Tag>status</Tag> 为 <Tag>init</Tag> 和{' '}
                <Tag>invalid</Tag> 的调试信息，否则会陷入无限循环
              </li>
              <li>
                其他类型的调试信息，可以创建一个新的 <Tag>emit</Tag> 发送
              </li>
            </ul>
          </FooterTips>
        }
        title="收发一起跟踪"
      >
        <SingleEvent />
      </Card>
      <Card
        footer={
          <FooterTips>
            <p>
              为了便于演示，这里直接通过 <Tag>@event-chat/core</Tag> 进行演示
            </p>
            <p>
              通常验证发送消息的错误信息，通过 <Tag>zod</Tag> 在相应的 <Tag>schema</Tag> 中使用{' '}
              <Tag>error</Tag> 去定义（<Tag>zod v3.0</Tag> 通过 <Tag>message</Tag>{' '}
              定义）。除此之外还内置了 5 个错误信息：
            </p>
            <ul className="ml-6 list-disc py-4">
              <li>
                <Tag>customError</Tag>：自定义错误规则的错误信息，在接收方提供一个 <Tag>filter</Tag>{' '}
                属性方法进行校验
              </li>
              <li>
                <Tag>groupEmpty</Tag>：非群组成员接收到来自群组成员的消息
              </li>
              <li>
                <Tag>groupProvider</Tag>：群组成员接收到来自非群组成员的消息
              </li>
              <li>
                <Tag>tokenEmpty</Tag>：非私信成员接受到私信
              </li>
              <li>
                <Tag>tokenProvider</Tag>：私信成员接受到非私信
              </li>
            </ul>
            <p>
              自定义方法 <Tag>filter</Tag> 接受一个回调参数，来自发送方向接收方提供的{' '}
              <Tag>emit</Tag> 消息对象，详细见 <Tag>callback</Tag>。这 5
              个错误信息默认展示英文，为了便于查看错误信息允许通过属性 <Tag>lang</Tag>{' '}
              自定义对应的信息
            </p>
          </FooterTips>
        }
        title="提示中的错误信息"
      >
        <ErrorDemo />
      </Card>
    </div>
  )
}

export default DebugLog
