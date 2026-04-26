import { registerTransport } from '../core/registry'

registerTransport({
  name: 'broadcastChannel',
  match: (t): t is BroadcastChannel =>
    typeof BroadcastChannel !== 'undefined' && t instanceof BroadcastChannel,
  load: () => import('../transports/BroadcastChannelTransport'),
})

registerTransport({
  name: 'dedicatedWorkerGlobalScope',
  match: (t): t is DedicatedWorkerGlobalScope =>
    typeof DedicatedWorkerGlobalScope !== 'undefined' && t instanceof DedicatedWorkerGlobalScope,
  load: () => import('../transports/DedicatedWorkerGlobalScopeTransport'),
})

registerTransport({
  name: 'serviceWorkerGlobalScope',
  match: (t): t is ServiceWorkerGlobalScope =>
    typeof ServiceWorkerGlobalScope !== 'undefined' && t instanceof ServiceWorkerGlobalScope,
  load: () => import('../transports/ServiceWorkerGlobalScopeTransport'),
})

registerTransport({
  name: 'serviceWorkerRegistration',
  match: (t): t is ServiceWorkerRegistration =>
    typeof ServiceWorkerRegistration !== 'undefined' && t instanceof ServiceWorkerRegistration,
  load: () => import('../transports/ServiceWorkerRegistrationTransport'),
})

registerTransport({
  name: 'sharedWorker',
  match: (t): t is SharedWorker => typeof SharedWorker !== 'undefined' && t instanceof SharedWorker,
  load: () => import('../transports/SharedWorkerTransport'),
})

registerTransport({
  name: 'SharedWorkerGlobalScope',
  match: (t): t is SharedWorkerGlobalScope =>
    typeof SharedWorkerGlobalScope !== 'undefined' && t instanceof SharedWorkerGlobalScope,
  load: () => import('../transports/SharedWorkerGlobalScopeTransport'),
})

registerTransport({
  name: 'webSocket',
  match: (t): t is WebSocket => typeof WebSocket !== 'undefined' && t instanceof WebSocket,
  load: () => import('../transports/WebSocketTransport'),
})

registerTransport({
  name: 'window',
  match: (t): t is Window => typeof window !== 'undefined' && String(t) === '[object Window]',
  load: () => import('../transports/WindowTransport'),
})

registerTransport({
  name: 'worker',
  match: (t): t is Worker => typeof Worker !== 'undefined' && t instanceof Worker,
  load: () => import('../transports/WorkerTransport'),
})

export { createRPC } from '../core/registry'
