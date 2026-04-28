import { createCtx, createService } from '@event-chat/rpc/react'
import { type CtxType, baseChatServer, baseServer, brodcastServer } from './baseService'

const mainServer = (ctx: Partial<CtxType>) => ({
  ...baseServer(ctx),
  getRootUser: () => ({ id: 1, name: 'parentAdmin' }),
})

const childIframeEvent = createService<CtxType>()
const childChatCtx = childIframeEvent(
  (ctx) => ({
    ...baseServer(ctx),
    getChildInfo: () => ({
      page: 'child-chat',
      status: 'success',
    }),
  }),
  brodcastServer
)

const childIframeCtx = childIframeEvent(
  (ctx) => ({
    ...baseServer(ctx),
    add: ({ a, b }: { a: number; b: number }) => a + b,
    getChildInfo: () => ({
      name: ctx.name,
      page: 'child',
      status: 'success',
    }),
  }),
  brodcastServer
)

const mainCtx = createCtx(mainServer, brodcastServer)

export { childChatCtx, childIframeCtx, mainCtx, baseServer, baseChatServer }
