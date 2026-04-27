import type { useEventChat } from '@event-chat/core'
import {
  type RPCInstanceContextIns,
  TARGET_TYPE_STRINGS,
  createCtx,
  createService,
} from '@event-chat/rpc/react'
import z from 'zod'
import { ChartName, type SendMessage, messageSchema } from '@/components/chatLine'
import { receiptStore } from '@/components/chatLine/receiptStore'

const receiptSchema = z.object({
  ...messageSchema.shape,
  path: z.array(z.string()),
})

const baseChatServer = (
  item: SendMessage,
  { card, name, emit }: Partial<Pick<CtxType, 'card' | 'emit' | 'name'>>
) => {
  const { receipt } = item
  receiptStore.hold(receipt)

  emit?.({
    detail: {
      broadcast: item.status === 'broadcast',
      busy: item.status === 'busy',
      date: item.date,
      message: item.message,
      own: item.name === name,
      user: item.name,
      card,
      receipt,
    },
    name: ChartName,
  })
  return receipt
}

const baseServer = (ctx: Partial<CtxType>) => ({
  getUserInfo: () => ({
    name: ctx.name,
    page: ctx.page,
    status: 'success',
  }),
  sendChat: (item: SendMessage) => baseChatServer(item, ctx),
})

const brodcastServer = (ctx: Partial<CtxType>) => ({
  receipt: (item: unknown) => {
    const { data, success } = receiptSchema.safeParse(item)
    if (!success || !ctx.name) return

    // 当前接受的用户就是原始发起用户
    const { path } = data
    if (path[0] === ctx.name) {
      if (path.length > 1) receiptStore.increasing(data.receipt)
      return
    }

    // 如果没有展示广播
    if (!receiptStore.isHoldId(data.receipt)) {
      baseChatServer(data, ctx)
    }

    // 大于等于 2 则出现了广播回环
    const end = path.slice(-2)[0] === ctx.name ? path.slice(-1)[0] : undefined
    if (end !== undefined && path.filter((name) => name === end).length >= 2) return

    // 继续转发广播
    ctx.brodcastScope?.(
      { payload: { ...data, path: path.concat([ctx.name]) } },
      { include: [TARGET_TYPE_STRINGS.Window] }
    )
  },
})

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

type CtxType = Pick<ReturnType<typeof useEventChat>, 'emit'> &
  Pick<RPCInstanceContextIns, 'brodcastScope'> & {
    card: number
    name: string
    page: string
  }
