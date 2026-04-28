/// <reference lib="webworker" />
import { mainCtx, workerChatCtx } from '@/services/workerService'
import { createDedicatedWorkerGlobalScopeRPC } from '@event-chat/rpc/dedicatedWorkerGlobalScope'

const target = self as DedicatedWorkerGlobalScope

workerChatCtx.provider({ name: 'worker:name', page: 'woker' })
createDedicatedWorkerGlobalScopeRPC(target, {
  context: {
    brodcast: workerChatCtx.brodcasts,
    config: { channel: 'worker' },
    consume: mainCtx.actions,
    event: workerChatCtx.actions,
  },
})
