import type { ReactNode } from 'react'
import { Failed, Receive, Send, Waiting } from './ChatMap'

export const chatMap = Object.freeze({
  faild: Failed,
  receive: Receive,
  send: Send,
  waiting: Waiting,
})

export interface ChatItemProps {
  content: ReactNode
  time: Date
  type: keyof typeof chatMap
  footer?: ReactNode
  header?: ReactNode
}
