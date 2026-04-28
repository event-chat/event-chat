import Iframe from '@/module/rpc/Iframe'
import RecipientsProvider from '@/module/rpc/RecipientsProvider'
import WorkerDemo from '@/module/rpc/WorkerDemo'
import { Tag } from 'antd'
import type { FC } from 'react'
import Card from '@/components/Card'

const RPCDemo: FC = () => {
  return (
    <div className="flex flex-col gap-16">
      <RecipientsProvider>
        <Card
          title={
            <>
              <Tag>iframe</Tag> 通信演示
            </>
          }
        >
          <Iframe />
        </Card>
      </RecipientsProvider>
      <RecipientsProvider>
        <Card
          title={
            <>
              <Tag>iframe</Tag> 通信演示
            </>
          }
        >
          <WorkerDemo />
        </Card>
      </RecipientsProvider>
    </div>
  )
}

export default RPCDemo
