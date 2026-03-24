import { useFormEvent } from '@event-chat/antd-item'
import { useEventChat } from '@event-chat/core'
import type { FC } from 'react'
import { scrollEventName } from './utils'

const ScrollMessageList: FC = () => {
  const { group } = useFormEvent()

  useEventChat(scrollEventName, { group })
  return <div>list</div>
}

export default ScrollMessageList
