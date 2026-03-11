import { createContext } from 'react'

export const CheckboxContext = createContext<CheckboxContextInstance>({})
export const CheckItemContext = createContext<{ checked?: boolean }>({})

export interface CheckboxContextInstance {
  disabled?: boolean
  value?: ValueType[]
  onChange?: (field?: ValueType, checked?: boolean) => void
}

export type SizeType = '2xl' | 'lg' | 'md' | 'sm' | 'xl' | 'xs'

export type ValueType = number | string
