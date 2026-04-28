import { createCtx, createService } from '@event-chat/rpc/react'
import { type CtxType, baseServer, brodcastServer } from './baseService'

const mainServer = (ctx: Partial<CtxType>) => ({
  ...baseServer(ctx),
  getRootUser: () => ({ id: 1, name: 'parentAdmin' }),
})

const workerEvent = createService<CtxType>()

const mainCtx = createCtx(mainServer, brodcastServer)
const workerChatCtx = workerEvent(
  (ctx) => ({
    ...baseServer(ctx),
    getChildInfo: () => ({
      page: 'child-chat',
      status: 'success',
    }),
  }),
  brodcastServer
)

export { mainCtx, workerChatCtx }
