import { NamepathType } from '@event-chat/core'
import { Input, InputProps } from 'antd'
import { FC } from 'react'
import { useFormEvent } from '../../src'

const CustomInput: FC<CustomInputProps> = ({ target, onChange, ...props }) => {
  const { emit } = useFormEvent()
  return (
    <Input
      {...props}
      onChange={(event) => {
        if (target) emit?.({ detail: event.target.value, name: target })
        onChange?.(event)
      }}
    />
  )
}

export default CustomInput

interface CustomInputProps extends InputProps {
  target?: NamepathType
}
