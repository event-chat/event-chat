import { createCtx, createService } from '@event-chat/rpc/react'
import { type CtxType, baseChatServer, baseServer, brodcastServer } from './baseService'

// import type { SendMessage } from '@/components/chatLine'
// import { receiptStore } from '@/components/chatLine/receiptStore'

// const mainChatServer = (
//   item: SendMessage,
//   { card, name, emit }: Partial<Pick<CtxType, 'card' | 'emit' | 'name'>>
// ) => {
//   const { receipt } = item
//   receiptStore.hold(receipt)

//   console.log('a---reback', item, name)
//   if (name) {
//     emit?.({
//       detail: {
//         broadcast: item.status === 'broadcast',
//         busy: item.status === 'busy',
//         date: item.date,
//         message: item.message,
//         own: true,
//         user: item.name,
//         card,
//         receipt,
//       },
//       name,
//     })
//   }
//   return receipt
// }

const mainServer = (ctx: Partial<CtxType>) => ({
  ...baseServer(ctx),
  getRootUser: () => ({ id: 1, name: 'parentAdmin' }),
  // sendChat: (item: SendMessage) => mainChatServer(item, ctx),
})

const workerEvent = createService<WorkerCtxType>()

// 主线程的 event 必须每个 worker 同一个线程不能共享上下文
// 而 consume 线程不一样，自然隔离上下文不需要区分
const generateMainCtx = () => createCtx(mainServer, brodcastServer)

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

export { mainCtx, workerChatCtx, baseChatServer, generateMainCtx }

type WorkerCtxType = CtxType & {
  getName: () => string
  updateName: (name: string) => string
}
