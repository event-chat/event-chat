/// <reference lib="webworker" />
import { createDedicatedWorkerGlobalScopeRPC } from '@event-chat/rpc/dedicatedWorkerGlobalScope'

// import { RPCDecorator } from '@event-chat/rpc'

const target = self as DedicatedWorkerGlobalScope

const workerRpc = createDedicatedWorkerGlobalScopeRPC(target)

workerRpc.upset({})

// console.log('a----workerRpc', workerRpc)

self.onmessage = () => {
  // self
}
