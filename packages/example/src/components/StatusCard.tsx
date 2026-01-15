import { type FC, useMemo } from 'react';
import { cn, tv } from 'tailwind-variants';
import { isKey } from '@/utils/fields';

const card = tv({
  slots: {
    base: 'flex w-full max-w-md items-start gap-3 rounded-lg border p-4 shadow-md',
    color: 'text-md text-gray-700',
    icon: 'mt-1 flex h-8 w-8 items-center justify-center rounded-full',
  },
  variants: {
    status: {
      default: {
        base: 'border-gray-200 bg-gray-50',
      },
      failed: {
        base: 'border-red-200 bg-red-50',
      },
      success: {
        base: 'border-green-200 bg-green-50',
      },
      waiting: {
        base: 'border-blue-200 bg-blue-50',
      },
    },
  },
  compoundVariants: [
    { status: 'default', class: { icon: 'bg-gray-100 text-gray-600' } },
    { status: 'failed', class: { color: 'text-red-700', icon: 'bg-red-100 text-red-600' } },
    { status: 'success', class: { color: 'text-green-700', icon: 'bg-green-100 text-green-600' } },
    { status: 'waiting', class: { color: 'text-blue-700', icon: 'bg-blue-100 text-blue-600' } },
  ],
  defaultVariants: {
    status: 'default',
  },
});

const iconMap = Object.freeze({
  default: '…',
  failed: '×',
  success: '✓',
  waiting: '○',
});

const StatusCard: FC<StatusCardProps> = ({ code, text, status = 'default' }) => {
  const { base, icon, color } = card({ status });
  const iconText = useMemo(
    () => (isKey(status, iconMap) ? iconMap[status] : iconMap.default),
    [status]
  );

  return (
    <div className={base()}>
      <div className={icon()}>
        <span className="text-lg font-bold">{iconText}</span>
      </div>
      <div className="flex-1">
        <div className={cn(color(), 'text-lg')}>状态码: {code ?? '--'}</div>
        <p className={color()}>{text}</p>
      </div>
    </div>
  );
};

export default StatusCard;

export interface StatusCardProps {
  code?: 100 | 200 | 300 | 400 | 500;
  status?: keyof typeof iconMap;
  text?: string;
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
