import useOptimistic from '@/hooks/useOptimistic'
import { baseChatServer, mainCtx } from '@/services/iframeService'
import { workerChatCtx } from '@/services/workerService'
import { useEventChat } from '@event-chat/core'
import { useRPC } from '@event-chat/rpc/react'
import { createWorkerRPC } from '@event-chat/rpc/worker'
import { type FC, useMemo, useRef, useState } from 'react'
import { ChatScroll, messageSchema } from '@/components/chatLine'
import WorkerPanel from '@/components/chatLine/WorkerPanel'
import { useRecipients } from './createRecipientsStore'
import { workerNameFilter } from './uitls'

const title = 'worker'

const WorkerItem: FC<WorkerItemProps> = ({ channel, group, name }) => {
  const [customName, setCustomName] = useState('')
  const [displayName, dispatch, runTransition] = useOptimistic(customName)
  const workName = useMemo(() => `worker:${!displayName ? name : displayName}`, [displayName, name])

  const ctxRef = useRef<CtxType>({})
  const [store] = useRecipients()

  const { connected, rpc, brodcastScope } = useRPC({
    config: {
      channel: 'worker',
      onConnect: () => {
        // 先改名，再添加到接收对象中
        rpc
          .request('changeName', { payload: name })
          .then(() => {
            store.addRecipient(rpc)
          })
          .catch(() => {})
      },
      onDisconnect: () => {
        store.delRecipient(rpc)
      },
    },
    brodcast: mainCtx.brodcasts,
    consume: workerChatCtx.actions,
    event: mainCtx.actions,
    name: channel,
    drive: createWorkerRPC,
    init: () =>
      new Worker(new URL('./worker.ts', import.meta.url), {
        name: 'my-worker',
      }),
  })

  const { emit } = useEventChat(workerNameFilter(workName), {
    schema: messageSchema,
    callback: ({ detail: item }) => {
      baseChatServer(item, ctxRef.current)
      rpc.request('sendChat', { payload: item }).catch(() => {})

      emit({
        detail: {
          broadcast: item.status === 'broadcast',
          busy: item.status === 'busy',
          date: item.date,
          message: item.message,
          own: item.name === displayName,
          user: item.name,
          // card,
          receipt: item.receipt,
        },
        name: `chat-${name}`,
      })
    },
    group,
  })

  ctxRef.current = { name: `chat-${name}`, page: 'root:worker', brodcastScope, emit }
  mainCtx.provider(ctxRef.current)

  return (
    <WorkerPanel
      value={displayName}
      disabled={!connected}
      maxLength={6}
      max={6}
      name={workName}
      placeholder="Please input name"
      title={title}
      onChange={(event) => {
        const value = event.target.value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6)
        runTransition(() => {
          dispatch(value)
          return rpc.request('changeName', { payload: !value ? name : value }).then((result) => {
            if (result) {
              const displayInput = result.split(':').slice(-1)[0] ?? ''
              setCustomName(displayInput === name ? '' : displayInput)
              emit({ detail: result, name: 'recipient' })
              store.updateRecipientName(rpc, result)
            }
          })
        })
      }}
    >
      <ChatScroll group={group} name={`chat-${name}`} />
    </WorkerPanel>
  )
}

export default WorkerItem

interface WorkerItemProps {
  channel: string
  group: string
  name: string
}

type CtxType = Parameters<typeof mainCtx.provider>[0]
