import { useFormEvent } from '@event-chat/antd-item'
import { useEventChat } from '@event-chat/core'
import { type FC, useEffect, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'
import z from 'zod'
import { safetyPrint } from '@/utils/fields'
import { scrollEventName } from './utils'

const schema = z.object({
  data: z.looseObject({ time: z.date() }),
  status: z.string(),
  error: z.string().optional(),
})

const styles = tv({
  slots: {
    content: 'flex flex-col gap-2 rounded bg-blue-900 p-2 wrap-break-word break-all',
    errorMsg: 'rounded bg-amber-700 p-4',
    itemGroup: 'flex flex-col gap-1',
    messages: 'flex flex-col gap-4',
    scroll: 'h-48 overflow-y-auto',
    title: 'flex gap-2 text-gray-400',
    type: 'text-amber-400',
  },
})

const { content, errorMsg, itemGroup, messages, scroll, title, type } = styles()

const MessageItem: FC<MessageItemProps> = ({ item }) => {
  const { data, error, status } = item
  return (
    <div className={itemGroup()}>
      <div className={title()}>
        <span className={type()}>[{status}]</span>
        <span>{data.time.toLocaleString()}</span>
      </div>
      <div className={content()}>
        <div>{safetyPrint(data)}</div>
        {error && <div className={errorMsg()}>{error}</div>}
      </div>
    </div>
  )
}

const ScrollMessageList: FC = () => {
  const [list, setList] = useState<ItemType[]>([])
  const messageRef = useRef<HTMLDivElement>(null)
  const { group } = useFormEvent()

  useEventChat(scrollEventName, {
    callback: (record) => setList((current) => current.concat([record.detail])),
    group,
    schema,
  })

  useEffect(() => {
    const { current } = messageRef
    const mutaion = new MutationObserver(() => {
      const { parentElement } = current ?? {}
      if (parentElement)
        parentElement.scrollTop = parentElement.scrollHeight - parentElement.clientHeight
    })

    if (current) mutaion.observe(current, { childList: true })
    return () => {
      if (current) mutaion.disconnect()
    }
  }, [messageRef])

  return (
    <div className={scroll()}>
      <div className={messages()} ref={messageRef}>
        {list.map((item, index) => {
          const keyname = `${item.data.time.getTime()}:${index}`
          return <MessageItem item={item} key={keyname} />
        })}
      </div>
    </div>
  )
}

export default ScrollMessageList

interface MessageItemProps {
  item: ItemType
}

type ItemType = z.infer<typeof schema>
