import { baseChatServer, childIframeCtx, mainCtx } from '@/module/rpc/service'
import { useEventChat } from '@event-chat/core'
import { TARGET_TYPE_STRINGS, useRPC } from '@event-chat/rpc'
import { type FC, useEffect, useState, useSyncExternalStore } from 'react'
import { ChatLine, ChatScroll } from '@/components/chatLine'
import CardSelect from '@/components/chatLine/CardSelect'
import { receiptStore } from '@/components/chatLine/receiptStore'
import { isKey } from '@/utils/fields'
import { recipientsStore } from './recipientStore'
import { chatItem, iframeName } from './uitls'

const SubIframe: FC<SubIframeProps> = ({ group = iframeName }) => {
  const recipients = useSyncExternalStore(recipientsStore.subscribe, recipientsStore.getSnapshot)
  const [groupName, setGroupName] = useState(group)
  const [card, setCard] = useState(0)

  const { emit } = useEventChat(chatItem, { group: groupName })
  const { connected, rpc, brodcastScope, mount } = useRPC({
    config: {
      allowedOrigins: ['http://localhost:3000', '*'],
      onConnect: () => {
        recipientsStore.addRecipient(rpc)
      },
      onDisconnect: () => {
        recipientsStore.delRecipient(rpc)
      },
    },
    brodcast: childIframeCtx.brodcasts,
    consume: mainCtx.actions,
    event: childIframeCtx.actions,
    init: () => window.parent,
  })

  const stateCtx = { name: groupName, page: 'child', card, brodcastScope, emit }
  childIframeCtx.provider(stateCtx)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const queryObject = Object.fromEntries(searchParams.entries())

    setGroupName((current) =>
      isKey('name', queryObject)
        ? [queryObject.name, current.split('.').pop()].filter(Boolean).join('.')
        : current
    )
  }, [])

  useEffect(() => {
    if (connected) mount(groupName)
  }, [connected, groupName, mount])

  return (
    <div className="h-full bg-gray-800">
      <ChatLine
        card={<CardSelect value={card} onChange={setCard} />}
        disabled={!connected}
        loading={!connected}
        name={groupName}
        recipients={recipients}
        onSend={(item) => {
          baseChatServer(item, stateCtx)
          if (item.status === 'broadcast') {
            brodcastScope(
              { payload: { ...item, path: [groupName] } },
              { include: [TARGET_TYPE_STRINGS.Window] }
            )
          } else {
            const target = item.recipient
              ? (recipientsStore.getRecipient(item.recipient) ?? rpc)
              : rpc

            target
              .request('sendChat', { payload: item })
              .then((result) => receiptStore.increasing(result))
              .catch(() => {})
          }
        }}
      >
        <ChatScroll group={groupName} />
      </ChatLine>
    </div>
  )
}

export default SubIframe

export interface SubIframeProps {
  group?: string
}
