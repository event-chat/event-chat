import { type EventChatOptions, useEventChat, useMemoFn } from '@event-chat/core'
import { Form, type FormItemProps, Input } from 'antd'
import {
  type FC,
  type PropsWithChildren,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react'
import { refuseField, schema, styles } from './utils'

const { message, warp } = styles()

const ErrorList: FC<PropsWithChildren<ErrorListProps>> = ({ children, list }) => {
  return (
    <Form labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
      <div className={warp()}>
        {children}
        <div className={message()}>{list}</div>
      </div>
    </Form>
  )
}

const ReceiveInput: FC<ReceiveInputProps> = ({ label, mount, ...props }) => {
  const [value, setValue] = useState<string>()
  const { token: receiveToken } = useEventChat(refuseField, {
    ...props,
    callback: ({ detail }) => setValue(detail),
    schema,
  })

  const mountHandle = useMemoFn(mount)
  useEffect(() => {
    mountHandle.current?.(receiveToken)
  }, [mountHandle, receiveToken])

  return (
    <Form.Item label={label}>
      <Input value={value} disabled />
    </Form.Item>
  )
}

const SendInput: FC<SendInputProps> = ({ extra, group, label, token, mount }) => {
  const id = useId()
  const fieldName = useMemo(() => `send-input${id}`, [id])
  const { emit } = useEventChat(fieldName, { group })

  const mountHandle = useMemoFn(mount)
  useEffect(() => {
    mountHandle.current?.(fieldName)
  }, [fieldName, mountHandle])

  return (
    <Form.Item extra={extra} label={label} name={fieldName}>
      <Input onChange={({ target }) => emit({ detail: target.value, name: refuseField, token })} />
    </Form.Item>
  )
}

export { ReceiveInput, SendInput }

export default ErrorList

interface BaseProps {
  mount?: (token: string) => void
}

interface ErrorListProps {
  list?: ReactNode
}

interface ReceiveInputProps
  extends
    BaseProps,
    Pick<FormItemProps, 'label'>,
    Pick<EventChatOptions<typeof refuseField>, 'debug' | 'filter' | 'lang'> {
  group?: string
  token?: boolean
}

interface SendInputProps extends BaseProps, Pick<FormItemProps, 'extra' | 'label'> {
  group?: string
  token?: string
}
