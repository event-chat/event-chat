const receipts: string[] = []
let record: Record<string, number> = {}
let listeners: Array<() => void> = []

function createId(): string {
  const id = Math.random().toString(36).slice(2, 10)
  return receiptStore.isHoldId(id) ? createId() : id
}

const emitChange = () => {
  for (const listener of listeners) {
    listener()
  }
}

export const receiptStore = {
  addReceipt() {
    const id = createId()
    record = { ...record, [id]: 0 }

    emitChange()
    return id
  },
  getReceipt(id: string) {
    return id in record ? record[id] : 0
  },
  getSnapshot() {
    return record
  },
  hold(id: string) {
    // 仅用于接受消息 id 占位，避免广播时重复消息
    if (!receiptStore.isHoldId(id)) receipts.push(id)
  },
  increasing(id: string) {
    if (id in record) {
      record = { ...record, [id]: record[id] + 1 }
      emitChange()
    }
  },
  isHoldId(id: string) {
    return id in record || receipts.includes(id)
  },
  isReceipt(id: string) {
    return id in record
  },
  subscribe(listener: () => void) {
    listeners = [...listeners, listener]
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
}
