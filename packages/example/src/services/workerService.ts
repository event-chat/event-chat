import { createCtx, createService } from '@event-chat/rpc/react'
import type { SendMessage } from '@/components/chatLine'
import { receiptStore } from '@/components/chatLine/receiptStore'
import { type CtxType, baseChatServer, baseServer, brodcastServer } from './baseService'

const mainChatServer = (
  item: SendMessage,
  { card, name, emit }: Partial<Pick<CtxType, 'card' | 'emit' | 'name'>>
) => {
  const { receipt } = item
  receiptStore.hold(receipt)

  if (name) {
    emit?.({
      detail: {
        broadcast: item.status === 'broadcast',
        busy: item.status === 'busy',
        date: item.date,
        message: item.message,
        own: true,
        user: item.name,
        card,
        receipt,
      },
      name,
    })
  }
  return receipt
}

const mainServer = (ctx: Partial<CtxType>) => ({
  ...baseServer(ctx),
  getRootUser: () => ({ id: 1, name: 'parentAdmin' }),
  sendChat: (item: SendMessage) => mainChatServer(item, ctx),
})

const workerEvent = createService<WorkerCtxType>()

const mainCtx = createCtx(mainServer, brodcastServer)
const workerChatCtx = workerEvent(
  (ctx) => ({
    ...baseServer(ctx),
    changeName: (name: string) => {
      return ctx.updateName?.(name)
    },
    getUserInfo: () => ({
      name: ctx.getName?.() ?? ctx.name,
      page: ctx.page,
      status: 'success',
    }),
    getChildInfo: () => ({
      page: 'child-chat',
      status: 'success',
    }),
  }),
  brodcastServer
)

export { mainCtx, workerChatCtx, baseChatServer }

type WorkerCtxType = CtxType & {
  getName: () => string
  updateName: (name: string) => string
}
