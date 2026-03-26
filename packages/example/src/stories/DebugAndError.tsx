import { ErrorDemo, PublisherInput, SingleEvent, SubscriberInput } from '@/module/DebugDemo'
import type { FC } from 'react'

const demoMap = Object.freeze({
  ErrorDemo,
  PublisherInput,
  SingleEvent,
  SubscriberInput,
})

const DebugAndError: FC<DebugAndErrorProps> = ({ name }) => {
  const Component = demoMap[name]
  return <Component />
}

export default DebugAndError

export interface DebugAndErrorProps {
  /* 演示类型 */
  name: keyof typeof demoMap
}
