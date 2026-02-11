import { type FC, useMemo } from 'react'
import { tv } from 'tailwind-variants'
import { isKey } from '@/utils/fields'

const card = tv({
  slots: {
    base: 'flex w-full max-w-md items-start gap-3 rounded-lg border p-4 shadow-md',
    color: 'text-md flex-1',
    icon: 'mt-1 flex h-8 w-8 items-center justify-center rounded-full',
  },
  variants: {
    status: {
      default: {
        base: 'border-gray-200 bg-gray-50',
        color: 'text-gray-700',
        icon: 'bg-gray-100 text-gray-600',
      },
      failed: {
        base: 'border-red-200 bg-red-50',
        color: 'text-red-700',
        icon: 'bg-red-100 text-red-600',
      },
      success: {
        base: 'border-green-200 bg-green-50',
        color: 'text-green-700',
        icon: 'bg-green-100 text-green-600',
      },
      waiting: {
        base: 'border-blue-200 bg-blue-50',
        color: 'text-blue-700',
        icon: 'bg-blue-100 text-blue-600',
      },
    },
  },
  defaultVariants: {
    status: 'default',
  },
})

const iconMap = Object.freeze({
  default: '…',
  failed: '×',
  success: '✓',
  waiting: '○',
})

const StatusCard: FC<StatusCardProps> = ({ code, text, status = 'default' }) => {
  const { base, icon, color } = card({ status })
  const iconText = useMemo(
    () => (isKey(status, iconMap) ? iconMap[status] : iconMap.default),
    [status]
  )

  return (
    <div className={base()}>
      <div className={icon()}>
        <span className="text-lg font-bold">{iconText}</span>
      </div>
      <div className={color()}>
        <div className="text-lg">状态码: {code ?? '--'}</div>
        <p>{text}</p>
      </div>
    </div>
  )
}

export default StatusCard

export interface StatusCardProps {
  code?: 100 | 200 | 300 | 400 | 500
  status?: keyof typeof iconMap
  text?: string
}

// const codeMap = [100, 200, 300, 400, 500] as const

// const numberEnum = <Num extends number, T extends Readonly<Num[]>>(
//   args: T
// ): z.ZodSchema<T[number]> => {
//   return z.custom<T[number]>((val: any) => args.includes(val));
// };

// export const rateObject = z.object({
//     code: numberEnum(codeMap).optional(),
//     status: z.enum(objectKeys(iconMap)).optional(),
//     text: z.string()
// })
