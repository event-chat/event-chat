import { Input } from 'antd'
import { type FC, type PropsWithChildren, useId } from 'react'
import { tv } from 'tailwind-variants'
import { baseStyle } from './utils'

const styles = tv({
  extend: baseStyle,
  variants: {
    variant: {
      simple: {
        bar: 'h-12',
        inputBox: 'pr-4',
        selectUser: 'p-4 text-gray-500',
      },
    },
  },
})

const { bar, inputBox, inputLine, scroll, selectUser, wrap } = styles({ variant: 'simple' })

const WorkerPanel: FC<PropsWithChildren<WorkerPanelProps>> = ({ children, disabled }) => {
  const id = useId()
  //   const [] = useState
  return (
    <div className={wrap({ class: 'bg-gray-800' })}>
      <div className={scroll()}>{children}</div>
      <div className={bar()}>
        <div className={selectUser()}>name:</div>
        <div className={inputBox()}>
          <Input
            autoComplete="off"
            defaultValue={id}
            className={inputLine()}
            disabled={disabled}
            placeholder="Please input name"
            variant="borderless"
            style={{ padding: 0 }}
            allowClear
          />
        </div>
      </div>
    </div>
  )
}

export default WorkerPanel

interface WorkerPanelProps {
  disabled?: boolean
}
