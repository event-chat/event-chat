import { RPCProvider } from '@event-chat/rpc/react'
import { type FC, type PropsWithChildren, useRef } from 'react'
import { StoreContext, createRecipientsStore } from './createRecipientsStore'

const RecipientsProvider: FC<PropsWithChildren> = ({ children }) => {
  const storeRef = useRef(createRecipientsStore())
  return (
    <RPCProvider>
      <StoreContext.Provider value={storeRef.current}>{children}</StoreContext.Provider>
    </RPCProvider>
  )
}

export default RecipientsProvider
