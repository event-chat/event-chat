import { type EventChatOptions, useEventChat } from '@event-chat/core'
import { Input } from 'antd'
import { type FC, type PropsWithChildren, useState } from 'react'
import z from 'zod'
import { refuseField, refuseGroup } from './utils'

const ReceiveInput: FC<ReceiveInputProps> = ({ token, debug }) => {
  const [value, setValue] = useState<string>()
  useEventChat(refuseField, {
    group: refuseGroup,
    schema: z.string().optional(),
    callback: ({ detail }) => setValue(detail),
    token,
    debug,
  })

  return <Input value={value} />
}

const ErrorList: FC<PropsWithChildren> = ({ children }) => {
  return <div>{children}</div>
}

export { ReceiveInput }

export default ErrorList

interface ReceiveInputProps extends Pick<EventChatOptions<typeof refuseField>, 'debug'> {
  token?: boolean
}
