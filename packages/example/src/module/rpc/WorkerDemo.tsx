import { mainCtx, workerChatCtx } from '@/services/workerService'
import { useEventChat } from '@event-chat/core'
import { useRPC } from '@event-chat/rpc/react'
import { createWorkerRPC } from '@event-chat/rpc/worker'
import { type FC } from 'react'
import { ChatLine, ChatScroll } from '@/components/chatLine'
import WorkerItem from './WorkerItem'
import { useRecipients } from './createRecipientsStore'

const group = 'worker-panel'

const WorkerDemo: FC = () => {
  const [store, recipients] = useRecipients()
  const { emit } = useEventChat('')
  const {
    connected: connected1,
    rpc: rpc1,
    brodcastScope,
  } = useRPC({
    config: {
      channel: 'worker',
      onConnect: () => {
        store.addRecipient(rpc1)
      },
      onDisconnect: () => {
        store.delRecipient(rpc1)
      },
    },
    brodcast: mainCtx.brodcasts,
    consume: workerChatCtx.actions,
    event: mainCtx.actions,
    name: group,
    drive: createWorkerRPC,
    init: () =>
      new Worker(new URL('./worker.ts', import.meta.url), {
        name: 'my-worker-inner',
      }),
  })

  const stateCtx = { name: group, page: 'root:worker', brodcastScope, emit }
  mainCtx.provider(stateCtx)

  return (
    <div className="grid h-84 grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
      <div className="row-span-2 bg-gray-800">
        <ChatLine disabled={!connected1} name={group} recipients={recipients}>
          <ChatScroll group={group} />
        </ChatLine>
      </div>
      <div>
        <WorkerItem />
      </div>
      <div>
        <WorkerItem />
      </div>
    </div>
  )
}

export default WorkerDemo
