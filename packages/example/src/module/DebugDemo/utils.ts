import { tv } from 'tailwind-variants'
import z from 'zod'

export const refuseField = 'refuse-input'
export const refuseGroup = 'refuse-group'

export const schema = z
  .string()
  .min(5, { error: '输入的内容最少需要 5 个字符' })
  .refine((value) => !Number.isNaN(Number(value)), {
    error: '只能接受纯数字的文字',
  })

export const scrollEventName = 'scroll-list-message'
export const styles = tv({
  slots: {
    message: 'rounded bg-gray-800 p-4',
    warp: 'flex max-w-150 flex-col gap-2',
  },
})
