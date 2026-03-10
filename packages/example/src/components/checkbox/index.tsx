import { type FC, type PropsWithChildren, useEffect, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'

const styles = tv({
  slots: {
    background: `relative inline-block h-5 w-5 rounded border border-gray-900 bg-gray-100 shadow transition-all duration-200`,
    input: 'peer sr-only',
    label:
      'group inline-flex cursor-pointer items-center justify-between gap-1 align-middle text-sm select-none has-disabled:cursor-not-allowed',
    point: `absolute inset-0 flex items-center justify-center opacity-0 peer-disabled:opacity-100`,
    text: 'peer-disabled:text-gray-500',
  },
  variants: {
    disabled: {
      true: '',
    },
    indeterminate: {
      true: '',
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

const CheckPoint: FC<Pick<CheckboxProps, 'checked'>> = ({ checked }) => {
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
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        ref={svgRef}
        id="toggle-shape"
        d="M3 7.5 L5.5 10 L11 4 L11 4 L11 4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <animate
          ref={rectRef}
          id="toRect"
          attributeName="d"
          from="M3 7.5 L5.5 10 L11 4 L11 4 L11 4"
          to="M3 6 L11 6 L11 8 L3 8 L3 6"
          dur="0.3s"
          fill="freeze"
          begin="indefinite"
        />
        <animate
          ref={checkRef}
          id="toCheck"
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
  defaultChecked,
  disabled,
  indeterminate,
  onChange,
}) => {
  const [isChecked, setChecked] = useState(checked ?? defaultChecked ?? false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { background, input, label, point, text } = styles({
    indeterminate: isChecked || indeterminate,
    disabled,
  })

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate ?? false
  }, [inputRef, indeterminate])

  useEffect(() => {
    if (checked !== undefined) setChecked(checked)
  }, [checked])

  return (
    <label className={label()}>
      <input
        checked={isChecked}
        className={input()}
        disabled={disabled}
        ref={inputRef}
        type="checkbox"
        onChange={(e) => {
          if (checked === undefined) setChecked(e.target.checked)
          onChange?.(e.target.checked)
        }}
      />
      <span className={background()}>
        <span className={point()}>
          <CheckPoint checked={isChecked} />
        </span>
      </span>
      <span className={text()}>{children}</span>
    </label>
  )
}

export default Checkbox

interface CheckboxProps {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  indeterminate?: boolean
  onChange?: (value: boolean) => void
}
