import { type FC, type ReactNode, useContext } from 'react'
import { tv } from 'tailwind-variants'
import { CheckItemContext } from './utils'

const iconStyles = tv({
  base: 'origin-center scale-0 opacity-0 transition-[opacity,scale] duration-300',
  variants: {
    checked: {
      in: 'animate-check-icon-in',
      out: 'animate-check-icon-out',
    },
  },
})

const BaseIcon: FC<BaseIconProps> = ({ active, indeterminate }) => {
  const { checked } = useContext(CheckItemContext)
  return (
    <svg width="0.78em" height="0.78em" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <g strokeWidth="0" />
      <g strokeLinecap="round" strokeLinejoin="round" />
      <g className={iconStyles({ checked: checked ? 'in' : 'out' })}>{active}</g>
      <g className={iconStyles({ checked: checked ? 'out' : 'in' })}>{indeterminate}</g>
    </svg>
  )
}

export default BaseIcon

interface BaseIconProps {
  active: ReactNode
  indeterminate: ReactNode
}
