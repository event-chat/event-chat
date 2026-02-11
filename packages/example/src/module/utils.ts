import z from 'zod'
import type { ChatItemProps } from '@/components/chat/utils'

export const statusEnum = z.enum(['error', 'faild', 'success', 'waiting'], {
  error: (issue) => (issue.input === undefined ? '未提供状态信息' : '提供的状态超出范围'),
})

export const subSchema = z.object({
  message: z
    .string({
      error: (issue) => (issue.input === undefined ? '请输入发送的信息' : '发送的信息类型不正确'),
    })
    .min(5, { error: '输入的消息最少 5 个字符' }),
  status: statusEnum,
})

export const pubSchema = z.object(
  {
    ingredients: z.array(z.string(), {
      error: (issue) => (issue.input === undefined ? '请输入原料' : '原料只能是多个字符组成的数组'),
    }),
    status: statusEnum,
    title: z.string({
      error: (issue) => (issue.input === undefined ? '请输入标题' : '标题类型不正确'),
    }),
    description: z.string({ error: '描述类型不正确' }).optional(),
    id: z.string({ error: '编号类型不正确' }).optional(),
  },
  {
    error: '提交的格式和要求的不匹配',
  }
)

export const checkStatus = ({ status }: z.infer<typeof subSchema>, list: ChatItemType[]) => {
  const current = list.slice(-1)[0]?.content.status
  return current ? current === 'waiting' || status === current : status === 'waiting'
}

export type ChatItemType = Omit<ChatItemProps, 'content'> & {
  content: ContentReceiveType | ContentSendType
}

type ContentReceiveType = z.infer<typeof pubSchema> & { message?: never }

type ContentSendType = {
  message: string
  status: z.infer<typeof statusEnum>
  id?: string
}
