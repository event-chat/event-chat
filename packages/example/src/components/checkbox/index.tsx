import {
  type FC,
  type PropsWithChildren,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { tv } from 'tailwind-variants'
import { CheckItemContext, CheckboxContext, type CheckboxContextInstance } from './utils'

const styles = tv({
  slots: {
    background: `relative inline-block h-5 w-5 rounded border border-gray-900 bg-gray-100 shadow transition-all duration-200`,
    input: 'peer sr-only',
    label:
      'group inline-flex cursor-pointer items-center justify-between gap-1 align-middle text-sm select-none has-disabled:cursor-not-allowed',
    point: `absolute inset-0 flex items-center justify-center fill-white stroke-white opacity-0 peer-disabled:opacity-100`,
    text: 'peer-disabled:text-gray-500',
  },
  variants: {
    color: {
      red: {
        background: 'border-red-600 bg-red-100',
      },
    },
    disabled: {
      true: '',
    },
    indeterminate: {
      true: '',
    },
    size: {
      '2xl': {
        background: 'h-9 w-9 rounded-lg border-2 text-3xl',
        label: 'gap-2 text-2xl',
      },
      lg: {
        background: 'h-7 w-7 rounded-lg border-2 text-2xl',
        label: 'gap-2 text-lg',
      },
      md: {
        background: 'h-6 w-6 rounded-md border-2 text-2xl',
        label: 'text-md gap-1.5',
      },
      sm: {
        background: 'h-5 w-5 text-xl',
      },
      xl: {
        background: 'h-8 w-8 rounded-lg border-2 text-3xl',
        label: 'gap-2 text-xl',
      },
      xs: {
        background: 'h-4 w-4 text-base',
      },
    },
  },
  compoundSlots: [
    {
      slots: ['background'],
      className: 'peer-checked:border-gray-900 peer-checked:bg-gray-900',
    },
    {
      slots: ['background'],
      className: 'peer-indeterminate:border-gray-900 peer-indeterminate:bg-gray-900',
    },
    {
      slots: ['background'],
      className: 'peer-disabled:border-gray-300 peer-disabled:bg-gray-200',
    },
    {
      slots: ['background'],
      className: 'dark:border-gray-500 dark:bg-gray-900',
    },
    {
      slots: ['background'],
      className: 'dark:peer-checked:border-gray-400 dark:peer-indeterminate:border-gray-400',
    },
    {
      slots: ['background'],
      className: 'dark:peer-disabled:border-gray-600 peer-disabled:dark:bg-gray-700',
    },
    {
      slots: ['background'],
      color: 'red',
      className: 'peer-checked:border-red-600 peer-checked:bg-red-600',
    },
    {
      slots: ['background'],
      color: 'red',
      className: 'peer-indeterminate:border-red-600 peer-indeterminate:bg-red-600',
    },
    {
      slots: ['background'],
      color: 'red',
      className: 'peer-disabled:border-red-200 peer-disabled:bg-red-100',
    },
    {
      slots: ['background'],
      color: 'red',
      className: 'dark:border-red-800 dark:bg-red-950',
    },
    {
      slots: ['background'],
      color: 'red',
      className: 'dark:peer-checked:border-red-900 dark:peer-indeterminate:border-red-600',
    },
    {
      slots: ['background'],
      color: 'red',
      className:
        'peer-disabled:opacity-60 dark:peer-disabled:border-red-950 peer-disabled:dark:bg-red-900',
    },
    {
      slots: ['label'],
      disabled: true,
      className: 'cursor-not-allowed',
    },
    {
      slots: ['point'],
      indeterminate: true,
      className: 'opacity-100',
    },
  ],
})

const CheckPoint: FC<CheckPointProps> = ({ checked }) => {
  const svgRef = useRef<SVGPathElement>(null)
  const rectRef = useRef<SVGAnimationElement>(null)
  const checkRef = useRef<SVGAnimationElement>(null)

  useEffect(() => {
    svgRef.current?.querySelectorAll('animate').forEach((anim) => anim.endElement())
    if (!checked) {
      rectRef.current?.beginElement()
    } else {
      checkRef.current?.beginElement()
    }
  }, [checked])

  return (
    <svg
      width="0.7em"
      height="0.7em"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        ref={svgRef}
        d="M3 7.5 L5.5 10 L11 4 L11 4 L11 4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <animate
          ref={rectRef}
          attributeName="d"
          from="M3 7.5 L5.5 10 L11 4 L11 4 L11 4"
          to="M3 6 L11 6 L11 8 L3 8 L3 6"
          dur="0.3s"
          fill="freeze"
          begin="indefinite"
        />
        <animate
          ref={checkRef}
          attributeName="d"
          from="M3 6 L11 6 L11 8 L3 8 L3 6"
          to="M3 7.5 L5.5 10 L11 4 L11 4 L11 4"
          dur="0.3s"
          fill="freeze"
          begin="indefinite"
        />
      </path>
    </svg>
  )
}

const Checkbox: FC<PropsWithChildren<CheckboxProps>> = ({
  checked,
  children,
  color,
  defaultChecked,
  disabled,
  icon,
  indeterminate,
  value,
  onChange,
  size = 'sm',
}) => {
  const {
    disabled: groupDisabled,
    value: groupValue,
    onChange: itemOnChange,
  } = useContext(CheckboxContext)
  const [isChecked, setChecked] = useState<boolean | undefined>(() => {
    if (groupValue === undefined) {
      return checked ?? defaultChecked
    }
    return value ? groupValue?.includes(value) : false
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const { background, input, label, point, text } = styles({
    indeterminate: isChecked ?? indeterminate,
    color,
    disabled,
    size,
  })

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate ?? false
  }, [inputRef, indeterminate])

  useEffect(() => {
    if (checked !== undefined) setChecked(checked)
  }, [checked])

  useEffect(() => {
    if (groupValue) setChecked(value ? groupValue?.includes(value) : false)
  }, [groupValue, value])

  return (
    <label className={label()}>
      <input
        checked={isChecked ?? false}
        className={input()}
        disabled={disabled ?? groupDisabled}
        ref={inputRef}
        type="checkbox"
        onChange={(e) => {
          if (checked === undefined) setChecked(e.target.checked)
          if (itemOnChange) {
            itemOnChange?.(value, e.target.checked)
          } else {
            onChange?.(e.target.checked)
          }
        }}
      />
      <span className={background()}>
        <span className={point()}>
          <CheckItemContext.Provider value={{ checked: isChecked }}>
            {icon ?? <CheckPoint checked={isChecked} />}
          </CheckItemContext.Provider>
        </span>
      </span>
      <span className={text()}>{children}</span>
    </label>
  )
}

export default Checkbox

interface CheckboxProps extends Pick<CheckboxContextInstance, 'disabled'> {
  checked?: boolean
  color?: 'red'
  defaultChecked?: boolean
  icon?: ReactNode
  indeterminate?: boolean
  size?: '2xl' | 'lg' | 'md' | 'sm' | 'xl' | 'xs'
  value?: string | number
  onChange?: (value: boolean) => void
}

interface CheckPointProps extends Pick<CheckboxProps, 'checked'> {}
