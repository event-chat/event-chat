import { SendOutlined, SyncOutlined } from '@ant-design/icons'
import FormEvent from '@event-chat/antd-item'
import { type EventChatOptions, type NamepathType, useEventChat } from '@event-chat/core'
import { Input, Select, type SelectProps } from 'antd'
import {
  type FC,
  type PropsWithChildren,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { tv } from 'tailwind-variants'
import z from 'zod'
import { useSubmit } from './hooks'
import { receiptStore } from './receiptStore'
import { itemSchema, messageSchema } from './utils'

const ChartName = 'chat-scroll'

const formatter = new Intl.DateTimeFormat('en-US', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const style = tv({
  slots: {
    bar: 'flex h-16 bg-gray-700',
    buttons: 'flex items-center justify-center p-4 pl-0',
    corner:
      'absolute top-0 right-0 rounded-bl-lg bg-gray-600 px-2 text-sm shadow-md select-none text-shadow-lg',
    inputBox: 'flex flex-1 items-center',
    inputLine:
      'w-full p-0 pl-4 focus:outline-none disabled:cursor-not-allowed disabled:placeholder-gray-600',
    itemInner: 'flex flex-col gap-1 py-4',
    itemUser: 'flex items-center gap-2 text-sm text-gray-500 select-none',
    itemWrap:
      'after:block after:h-px after:w-full after:bg-gray-700 after:content-[""] last:after:hidden',
    msg: 'flex gap-2 text-gray-400 select-auto',
    msgtext: '',
    name: 'select-none',
    receiptTag: 'ml-2 text-xs text-gray-600 select-none',
    sendBtn: 'h-9 w-9 cursor-pointer rounded-full bg-gray-900 text-white',
    scroll: 'flex-1 overflow-auto px-4',
    scrollInner: '',
    selectUser: 'flex items-center justify-center',
    tag: 'inline rounded-sm bg-blue-600 px-1 text-white',
    wrap: 'relative flex h-full flex-col',
  },
  variants: {
    card: {
      true: {
        corner: 'pr-0',
        msgtext: 'rounded bg-gray-900 p-2',
      },
    },
    disabled: {
      true: {
        bar: 'bg-gray-800',
        sendBtn: 'cursor-not-allowed bg-gray-600 text-gray-400',
      },
    },
    empty: {
      true: {
        scrollInner: 'py-6 text-center text-gray-600',
      },
    },
    type: {
      broadcast: {
        tag: 'bg-amber-500',
      },
      busy: {
        tag: 'bg-red-500',
      },
      own: {
        msg: 'text-white',
        name: 'text-green-600',
      },
    },
    unRecipient: {
      true: {
        inputBox: 'pl-4',
      },
    },
  },
  compoundVariants: [
    {
      disabled: true,
      class: {
        tag: 'bg-blue-300',
      },
    },
    {
      disabled: true,
      type: 'broadcast',
      class: {
        tag: 'bg-amber-300',
      },
    },
    {
      disabled: true,
      type: 'busy',
      class: {
        tag: 'bg-red-300',
      },
    },
  ],
})

const { itemInner, itemUser, itemWrap, msg, msgtext, name, receiptTag, scrollInner, tag } = style()

const ChatItems: FC<ChatItemProps> = ({ item, receipt }) => {
  const { broadcast, busy, date, message, own, user, card = 0 } = item
  return (
    <div className={itemWrap()}>
      <div className={itemInner()}>
        <div className={itemUser()}>
          {formatter.format(date)} {own && <span className={tag()}>own</span>}{' '}
          {broadcast && <span className={tag({ type: 'broadcast' })}>broadcast</span>}
          {busy && <span className={tag({ type: 'busy' })}>busy</span>}
        </div>
        <div className={msg({ type: own ? 'own' : undefined })}>
          <span className={name({ type: own ? 'own' : undefined })}>{user}: </span>
          <span className={msgtext({ card: card > 0 })}>
            {message}
            {own && (
              <span className={receiptTag()}>
                ({(receipt > 0 ? undefined : '未读') ?? (broadcast ? `已读: ${receipt}` : '已读')})
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

const ChatScroll: FC<ChatScrollProps> = ({ group, debug }) => {
  const [items, setItems] = useState<Array<ChatItemProps['item']>>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useSyncExternalStore(
    receiptStore.subscribe.bind(receiptStore),
    receiptStore.getSnapshot.bind(receiptStore)
  )

  useEventChat(ChartName, {
    schema: itemSchema,
    callback: ({ detail }) => setItems((current) => current.concat(detail)),
    group,
    debug,
  })

  useEffect(() => {
    Promise.resolve()
      .then(() => {
        const container = scrollRef.current?.parentElement
        if (container) {
          container.scrollTo({
            top: container.scrollHeight - container.clientHeight,
            behavior: 'smooth',
          })
        }
      })
      .catch(() => {})
  }, [items])

  return items.length === 0 ? (
    <div className={scrollInner({ empty: true })}>- 没有收到任何消息 -</div>
  ) : (
    <div className={scrollInner()} ref={scrollRef}>
      {items.map((item, index) => {
        const keyname = `${item.date.getTime()}:${index}`
        return (
          <ChatItems item={item} key={keyname} receipt={receiptStore.getReceipt(item.receipt)} />
        )
      })}
    </div>
  )
}

const ChatLine: FC<PropsWithChildren<ChatLineProps>> = ({
  card,
  children,
  disabled,
  loading,
  name: chatName,
  recipients,
  onSend,
}) => {
  const [form] = FormEvent.useForm<'chat-form', 'chat-line', Omit<SendMessage, 'date'>>({
    group: 'chat-line',
    name: 'chat-form',
  })

  const { bar, buttons, corner, inputBox, inputLine, scroll, selectUser, sendBtn, wrap } = style({
    card: Boolean(card),
    unRecipient: (recipients?.length ?? 0) === 0,
    disabled,
  })

  const [submit] = useSubmit(onSend, () => {
    form.emit({ detail: undefined, name: 'message' })
  })

  useEffect(() => {
    form.setFieldsValue({ name: chatName })
  }, [chatName, form])

  useEffect(() => {
    if (recipients && recipients.length > 0) form.setFieldValue('receipt', recipients[0].value)
  }, [form, recipients])

  return (
    <div className={wrap()}>
      <div className={corner()}>
        {chatName} {card && <span>{card}</span>}
      </div>
      <div className={scroll()}>{children}</div>
      <FormEvent
        form={form}
        initialValues={{ status: 'normal' }}
        onFinish={(data) => {
          submit({ ...data, date: new Date(), receipt: receiptStore.addReceipt() })
        }}
      >
        <div className={bar()}>
          <FormEvent.Item name="name" hidden>
            <Input />
          </FormEvent.Item>
          {(recipients?.length ?? 0) > 0 && (
            <div className={selectUser()}>
              <FormEvent.Item dependencies={['status']} noStyle>
                {() => (
                  <FormEvent.Item initialValue={recipients?.[0].value} name="recipient" noStyle>
                    <Select
                      disabled={disabled ? true : form.getFieldValue('status') === 'broadcast'}
                      options={recipients}
                      popupMatchSelectWidth={false}
                      variant="borderless"
                    />
                  </FormEvent.Item>
                )}
              </FormEvent.Item>
            </div>
          )}
          <span className={inputBox()}>
            <FormEvent.Item name="message" noStyle>
              <Input
                autoComplete="off"
                className={inputLine()}
                disabled={disabled}
                placeholder="Please input message"
                variant="borderless"
                style={{ padding: 0 }}
                allowClear
              />
            </FormEvent.Item>
          </span>
          <div className={buttons()}>
            <FormEvent.Item name="status" noStyle>
              <Select<StatusType>
                disabled={disabled}
                options={[
                  {
                    label: <span className={tag({ type: 'broadcast', disabled })}>broadcast</span>,
                    value: 'broadcast',
                  },
                  {
                    label: <span className={tag({ type: 'busy', disabled })}>busy</span>,
                    value: 'busy',
                  },
                  { label: <span className={tag({ disabled })}>normal</span>, value: 'normal' },
                ]}
                popupMatchSelectWidth={false}
                suffixIcon={null}
                variant="borderless"
              />
            </FormEvent.Item>
            <FormEvent.Item dependencies={['message', 'recipient', 'status']} noStyle>
              {() => {
                const message = String(form.getFieldValue('message') ?? '')
                const recipient = String(form.getFieldValue('recipient') ?? '')
                const itemDisabled =
                  String(form.getFieldValue('status') ?? '') !== 'broadcast' &&
                  recipients?.find((item) => item.value === recipient)?.disabled

                return (
                  <button
                    className={sendBtn({ disabled: disabled ? true : !message })}
                    disabled={disabled ? true : itemDisabled}
                    type="button"
                    onClick={() => {
                      if (message) form.submit()
                    }}
                  >
                    {loading ? <SyncOutlined spin /> : <SendOutlined rotate={-20} />}
                  </button>
                )
              }}
            </FormEvent.Item>
          </div>
        </div>
      </FormEvent>
    </div>
  )
}

export { ChatLine, ChartName, ChatScroll }

export default ChatLine

export type SendMessage = z.infer<typeof messageSchema>

interface ChatItemProps {
  item: z.infer<typeof itemSchema>
  receipt: number
}

interface ChatLineProps extends Pick<SendMessage, 'name'> {
  card?: ReactNode
  disabled?: boolean
  loading?: boolean
  recipients?: SelectProps['options']
  onSend?: (item: SendMessage) => void
}

interface ChatScrollProps extends Pick<EventChatOptions<NamepathType>, 'debug'> {
  group?: string
}

type StatusType = SendMessage['status']
