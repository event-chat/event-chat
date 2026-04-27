import { useRPC } from '@event-chat/rpc/react'
import type { baseServer } from './service'

type RecipientsStore = {
  current: SnapshotItem[]
  addRecipient: (rpc: RPCType) => void
  delRecipient: (rpc: RPCType) => void
  getRecipient: (name: string) => RPCType | null
  getSnapshot: () => SnapshotItem[]
  subscribe: (listener: () => void) => () => void
}

const currentRecipients = new Map<string, RecipientsRecord>()
const pendingRPCList = new Set<RPCType>()

let cachedSnapshot: SnapshotItem[] = []
let listeners: Array<() => void> = []

const computeSnapshot = () => {
  const next: SnapshotItem[] = []
  currentRecipients.forEach(({ online }, value) => {
    next.push({ disabled: !online, label: value, value })
  })

  if (
    next.length !== cachedSnapshot.length ||
    !next.every(
      (item, i) =>
        item.disabled === cachedSnapshot[i].disabled && item.value === cachedSnapshot[i].value
    )
  ) {
    cachedSnapshot = next
  }

  return cachedSnapshot
}

const emitChange = () => {
  for (const listener of listeners) {
    listener()
  }
}

export const recipientsStore: RecipientsStore = {
  get current() {
    return cachedSnapshot
  },
  addRecipient(rpc) {
    if (!pendingRPCList.has(rpc)) {
      pendingRPCList.add(rpc)
      setTimeout(() => {
        rpc
          .request('getUserInfo')
          .then((res) => {
            if (res.name) {
              currentRecipients.set(res.name, { rpc, online: true })
              computeSnapshot()
            }
            emitChange()
          })
          .catch(() => {})
      })
    }
  },
  delRecipient(rpc) {
    if (pendingRPCList.has(rpc)) {
      pendingRPCList.delete(rpc)
      currentRecipients.forEach((value, key) => {
        if (value.rpc === rpc) currentRecipients.set(key, { rpc, online: false })
      })
      computeSnapshot()
      emitChange()
    }
  },
  getRecipient(name) {
    return currentRecipients.get(name)?.rpc ?? null
  },
  getSnapshot() {
    return cachedSnapshot
  },
  subscribe(listener: () => void) {
    listeners = [...listeners, listener]
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
}

export type RPCType = ReturnType<typeof useRPC<ActionType, ActionType, unknown>>['rpc']

type ActionType = ReturnType<typeof baseServer>
type RecipientsRecord = {
  rpc: RPCType
  online: boolean
}

type SnapshotItem = {
  disabled: boolean
  label: string
  value: string
}
