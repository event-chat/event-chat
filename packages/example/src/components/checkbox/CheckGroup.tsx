import {
  type FC,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react'
import Checkbox, { type SizeType } from '.'
import { useMemoFn } from '../selectSection/utils/fields'
import { CheckboxContext, type CheckboxContextInstance, type ValueType } from './utils'

const CheckGroup: FC<PropsWithChildren<CheckGroupProps>> = ({
  children,
  defaultValue,
  disabled,
  options,
  size,
  value,
  onChange,
}) => {
  const [groupValue, setGroupValue] = useState<ValueType[]>(value ?? defaultValue ?? [])
  const changeRef = useMemoFn(onChange)

  const changeHandle = useCallback<NonNullable<CheckboxContextInstance['onChange']>>(
    (field, changeValue) => {
      if (field) {
        const updateItems = groupValue
          .filter((item) => item !== field)
          .concat(changeValue ? [field] : [])

        if (value === undefined) setGroupValue(updateItems)
        changeRef.current?.(updateItems)
      }
    },
    [groupValue, changeRef, value]
  )

  useEffect(() => {
    const updateItems = value ?? defaultValue ?? []
    setGroupValue((items) => {
      if (items.length !== updateItems.length) return updateItems

      const filterList = items.filter((dataVal) => !updateItems.includes(dataVal))
      return filterList.length === 0 ? items : updateItems
    })
  }, [defaultValue, value])

  return (
    <CheckboxContext.Provider value={{ value: groupValue, onChange: changeHandle, disabled }}>
      {children ??
        options?.map((item, i) => {
          const keyname = `${item.value}:${i}`
          return (
            <Checkbox disabled={item.disabled} key={keyname} size={size} value={item.value}>
              {item.label}
            </Checkbox>
          )
        })}
    </CheckboxContext.Provider>
  )
}

export default CheckGroup

export interface CheckGroupProps extends Omit<CheckboxContextInstance, 'onChange'> {
  defaultValue?: ValueType[]
  options?: ItemType[]
  size?: SizeType
  onChange?: (value?: ValueType[]) => void
}

type ItemType = {
  value: ValueType
  disabled?: boolean
  label?: ReactNode
}
