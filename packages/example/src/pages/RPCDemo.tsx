import Iframe from '@/module/rpc/Iframe'
import WorkerDemo from '@/module/rpc/WorkerDemo'
import { RPCProvider } from '@event-chat/rpc'
import { Tag } from 'antd'
import type { FC } from 'react'
import Card from '@/components/Card'

const RPCDemo: FC = () => {
  return (
    <div className="flex flex-col gap-16">
      <RPCProvider>
        <Card
          title={
            <>
              <Tag>iframe</Tag> 通信演示
            </>
          }
        >
          <Iframe />
        </Card>
        <Card
          title={
            <>
              <Tag>iframe</Tag> 通信演示
            </>
          }
        >
          <WorkerDemo />
        </Card>
      </RPCProvider>
    </div>
  )
}

export default RPCDemo
