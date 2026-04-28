import type { useEventChat } from '@event-chat/core'
import { type RPCInstanceContextIns, TARGET_TYPE_STRINGS } from '@event-chat/rpc/react'
import z from 'zod'
import { ChartName, type SendMessage, messageSchema } from '@/components/chatLine'
import { receiptStore } from '@/components/chatLine/receiptStore'

const receiptSchema = z.object({
  ...messageSchema.shape,
  path: z.array(z.string()),
})

export const baseChatServer = (
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

export const brodcastServer = (ctx: Partial<CtxType>) => ({
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

export const baseServer = (ctx: Partial<CtxType>) => ({
  getUserInfo: () => ({
    name: ctx.name,
    page: ctx.page,
    status: 'success',
  }),
  sendChat: (item: SendMessage) => baseChatServer(item, ctx),
})

export type CtxType = Pick<ReturnType<typeof useEventChat>, 'emit'> &
  Pick<RPCInstanceContextIns, 'brodcastScope'> & {
    name: string
    page: string
    card?: number
  }
