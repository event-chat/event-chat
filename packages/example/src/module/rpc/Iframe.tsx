import { useEventChat } from '@event-chat/core'
import { TARGET_TYPE_STRINGS, useRPC } from '@event-chat/rpc'
import { type FC, useRef, useState, useSyncExternalStore } from 'react'
import { ChatLine, ChatScroll } from '@/components/chatLine'
import CardSelect from '@/components/chatLine/CardSelect'
import { receiptStore } from '@/components/chatLine/receiptStore'
import { recipientsStore } from './recipientStore'
import { baseChatServer, childIframeCtx, mainCtx } from './service'

const group = 'root'

const Iframe: FC = () => {
  const iframeRef1 = useRef<HTMLIFrameElement>(null)
  const iframeRef2 = useRef<HTMLIFrameElement>(null)

  const recipients = useSyncExternalStore(recipientsStore.subscribe, recipientsStore.getSnapshot)
  const [card, setCard] = useState(0)

  const { emit } = useEventChat('root-bar', { group })
  const {
    connected: connected1,
    rpc: rpc1,
    brodcastScope,
  } = useRPC({
    config: {
      allowedOrigins: ['http://localhost:3000', '*'],
      onConnect: () => {
        recipientsStore.addRecipient(rpc1)
      },
      onDisconnect: () => {
        recipientsStore.delRecipient(rpc1)
      },
    },
    brodcast: mainCtx.brodcasts,
    consume: childIframeCtx.actions,
    event: mainCtx.actions,
    name: group,
    init: () => iframeRef1.current,
  })

  const { connected: connected2, rpc: rpc2 } = useRPC({
    config: {
      allowedOrigins: ['http://localhost:3000', '*'],
      onConnect: () => {
        recipientsStore.addRecipient(rpc2)
      },
      onDisconnect: () => {
        recipientsStore.delRecipient(rpc2)
      },
    },
    brodcast: mainCtx.brodcasts,
    consume: childIframeCtx.actions,
    event: mainCtx.actions,
    name: group,
    init: () => iframeRef2.current,
  })

  const stateCtx = { name: group, page: 'root', card, brodcastScope, emit }
  mainCtx.provider(stateCtx)

  return (
    <div className="grid h-126 grid-cols-1 grid-rows-[3fr_2fr_1fr] gap-x-4 gap-y-3 md:grid-cols-2 md:grid-rows-[2fr_1fr]">
      <div className="row-span-2 bg-gray-800">
        <ChatLine
          card={<CardSelect value={card} onChange={setCard} />}
          disabled={!connected1 && !connected2}
          loading={!connected1 && !connected2}
          name={group}
          recipients={recipients}
          onSend={(item) => {
            baseChatServer(item, stateCtx)
            if (item.status === 'broadcast') {
              brodcastScope(
                { payload: { ...item, path: [group] } },
                { include: [TARGET_TYPE_STRINGS.Window] }
              )
            } else {
              const target = item.recipient
                ? (recipientsStore.getRecipient(item.recipient) ?? rpc1)
                : rpc1

              target
                .request('sendChat', { payload: item })
                .then((result) => receiptStore.increasing(result))
                .catch(() => {})
            }
          }}
        >
          <ChatScroll group={group} />
        </ChatLine>
      </div>
      <div>
        <iframe className="h-full w-full" ref={iframeRef1} src="/iframe" />
      </div>
      <div>
        <iframe className="h-full w-full" ref={iframeRef2} src="/chat" />
      </div>
    </div>
  )
}

export default Iframe
