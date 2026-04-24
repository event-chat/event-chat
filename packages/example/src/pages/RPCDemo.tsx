import Iframe from '@/module/rpc/Iframe'
import { RPCProvider } from '@event-chat/rpc'
import type { FC } from 'react'

const RPCDemo: FC = () => {
  return (
    <RPCProvider>
      <Iframe />
    </RPCProvider>
  )
}

export default RPCDemo
