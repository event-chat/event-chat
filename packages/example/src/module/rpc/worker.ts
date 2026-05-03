/// <reference lib="webworker" />
import { mainCtx, workerChatCtx } from '@/services/workerService'
import { createDedicatedWorkerGlobalScopeRPC } from '@event-chat/rpc/dedicatedWorkerGlobalScope'
import { itemSchema } from '@/components/chatLine'

const target = self as DedicatedWorkerGlobalScope
const recordRef = {
  name: crypto.randomUUID().toString(),
}

const rpc = createDedicatedWorkerGlobalScopeRPC(target, {
  context: {
    brodcast: workerChatCtx.brodcasts,
    config: { channel: 'worker' },
    consume: mainCtx.actions,
    event: workerChatCtx.actions,
  },
})

workerChatCtx.provider({
  name: `worker:${recordRef.name}`,
  page: 'worker',
  emit: ({ detail }) => {
    const { data, success } = itemSchema.safeParse(detail)
    if (success) {
      rpc
        .request('sendChat', {
          payload: {
            date: new Date(),
            message: `Message read, feedback from worker: ${recordRef.name}`,
            name: data.user,
            receipt: data.receipt,
            recipient: data.receipt,
            status: 'normal',
          },
        })
        .catch(() => {})
    }
  },
  getName: () => `worker:${recordRef.name}`,
  updateName: (name) => {
    recordRef.name = !name ? crypto.randomUUID() : name
    return `worker:${recordRef.name}`
  },
})
