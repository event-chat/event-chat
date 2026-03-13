import { createContext } from 'react'

export const CheckboxContext = createContext<CheckboxContextInstance>({})
export const CheckItemContext = createContext<{ checked?: boolean }>({})

export interface CheckboxContextInstance {
  disabled?: boolean
  value?: ValueType[]
  onChange?: (field?: ValueType, checked?: boolean) => void
}

export type ValueType = number | string
