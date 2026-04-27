import { useEventChat } from '@event-chat/core'
import { useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import { type FC, useContext, useEffect, useRef } from 'react'
import { recipientsStore } from './recipientStore'
import { childChatCtx, childIframeCtx } from './service'
import { GroupProvider, chatItem } from './uitls'

const eventName = 'sub-chat'

const SubChat: FC = () => {
  const { group } = useContext(GroupProvider)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const { emit } = useEventChat(eventName, { group })
  const { connected, rpc, brodcastScope } = useRPC({
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
    consume: childIframeCtx.actions,
    event: childChatCtx.actions,
    drive: createWindowRPC,
    init: () => iframeRef.current,
  })

  const stateCtx = { name: group, page: 'child', card: 0, brodcastScope, emit }
  childChatCtx.provider(stateCtx)

  useEffect(() => {
    emit({ detail: rpc, name: chatItem })
  }, [connected, rpc, emit])

  return (
    <div className="h-full bg-gray-800">
      <iframe className="h-full w-full" ref={iframeRef} src={`/chat?name=${group}`} />
    </div>
  )
}

export default SubChat
