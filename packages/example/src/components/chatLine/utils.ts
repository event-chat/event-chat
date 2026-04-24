import z from 'zod'

export const itemSchema = z.object({
  date: z.date(),
  message: z.string(),
  receipt: z.string(),
  user: z.string(),
  broadcast: z.boolean().optional(),
  busy: z.boolean().optional(),
  card: z.number().optional(),
  own: z.boolean().optional(),
})

export const messageSchema = z.object({
  ...itemSchema.pick({
    date: true,
    message: true,
    receipt: true,
  }).shape,
  name: z.string(),
  status: z.enum(['broadcast', 'busy', 'normal']),
  recipient: z.string().optional(),
})
