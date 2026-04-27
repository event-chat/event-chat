import { createContext } from 'react'

export const chatItem = 'chat-item'
export const chatName = 'chat'
export const iframeName = 'iframe'
export const GroupProvider = createContext({ group: iframeName })
