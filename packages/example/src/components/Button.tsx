import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { forwardRef } from 'react'
import { cn, tv } from 'tailwind-variants'
import type { PickVariants } from '@/utils/fields'

const styles = tv({
  base: 'inline-flex cursor-pointer items-center justify-center gap-1 border font-medium shadow-sm transition-all duration-200',
  variants: {
    color: {
      danger:
        'border-red-700 bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 disabled:hover:bg-red-600',
      outline:
        'border-gray-900 text-gray-800 hover:border-blue-600 hover:text-blue-600 focus-visible:ring-blue-500 active:bg-gray-50',
      primary:
        'border-blue-700 bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 disabled:hover:bg-blue-600',
      secondary:
        'border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200 focus-visible:ring-gray-500 active:bg-gray-200 disabled:hover:bg-gray-100',
      success:
        'border-green-700 bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 disabled:hover:bg-green-600',
      text: 'border-transparent text-blue-600 shadow-none hover:border-transparent hover:text-blue-500 focus-visible:ring-blue-500 active:text-blue-100',
      warning:
        'border-amber-700 bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-500 disabled:hover:bg-amber-600',
    },
    size: {
      '2xl': 'rounded-2xl border-3 px-8 py-5 text-2xl shadow-2xl',
      lg: 'rounded-lg border-2 px-6 py-2.5 text-lg shadow-lg',
      md: 'rounded-md px-4 py-2 text-base shadow-md',
      sm: 'rounded-md px-3 py-1.5 text-sm',
      xl: 'rounded-xl border-2 px-7 py-3.5 text-xl shadow-xl',
      xs: 'rounded-md px-2 py-1 text-xs',
    },
  },
  compoundVariants: [
    {
      className:
        'hover:shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 active:shadow-none',
    },
    {
      className:
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-sm disabled:active:scale-100',
    },
    {
      color: ['outline'],
      className: 'disabled:hover:border-gray-900 disabled:hover:text-gray-800',
    },
    {
      color: ['outline'],
      className:
        'dark:border-gray-100 dark:text-gray-200 dark:hover:border-blue-400 dark:hover:text-blue-400 dark:active:bg-gray-800/50',
    },
    {
      color: ['outline'],
      className: 'dark:disabled:hover:border-gray-100 dark:disabled:hover:text-gray-200',
    },
    {
      color: ['secondary'],
      className:
        'dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:active:bg-gray-700 dark:disabled:hover:bg-gray-900',
    },
    {
      color: ['text'],
      className: 'hover:shadow-none disabled:hover:bg-transparent disabled:hover:shadow-none',
    },
    {
      color: ['text'],
      className:
        'dark:text-blue-400 dark:hover:text-blue-500 dark:active:text-blue-900/30 dark:disabled:text-blue-500 dark:disabled:hover:bg-transparent',
    },
  ],
})

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled = false,
      loading = false,
      size = 'sm',
      variant = 'primary',
      ...props
    },
    ref
  ) => {
    const base = styles({ color: variant, size })
    return (
      <button {...props} className={cn([base, className])} disabled={disabled || loading} ref={ref}>
        {loading && <FontAwesomeIcon className="animate-spin" icon={faSpinner} />}
        {children}
      </button>
    )
  }
)

if (process.env.NODE_ENV !== 'production') {
  Button.displayName = 'Button'
}

export default Button

// 定义按钮的属性类型
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, Pick<SlotsType, 'size'> {
  loading?: boolean
  variant?: SlotsType['color']
}

type SlotsType = PickVariants<typeof styles, 'color' | 'size'>
