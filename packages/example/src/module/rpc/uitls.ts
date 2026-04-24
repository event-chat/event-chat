import { createContext } from 'react'
import z from 'zod'
import { messageSchema } from '@/components/chatLine'

export const chatItem = 'chat-item'
export const chatName = 'chat'
export const iframeName = 'iframe'
export const GroupProvider = createContext({ group: iframeName })
export const receiptSchema = z.object({
  ...messageSchema.shape,
  path: z.array(z.string()),
})
