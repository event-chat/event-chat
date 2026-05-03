import { useEventChat } from '@event-chat/core'
import { type FC } from 'react'
import { ChatLine, ChatScroll } from '@/components/chatLine'
import WorkerItem from './WorkerItem'
import { useRecipients } from './createRecipientsStore'
import { workerNameFilter } from './uitls'

const channel = 'worker-panel'
const items = ['item1', 'item2'] as const
const workerGroup = 'worker-group'

const WorkerDemo: FC = () => {
  const { emit } = useEventChat('', { group: workerGroup })
  const [, recipients] = useRecipients()

  return (
    <div className="grid h-84 grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
      <div className="row-span-2 bg-gray-800">
        <ChatLine
          disabled={recipients.length === 0}
          group={workerGroup}
          name={channel}
          recipients={recipients}
          onSend={(item) => {
            if (item.recipient) {
              emit({ detail: item, name: workerNameFilter(item.recipient) })
            }
          }}
        >
          <ChatScroll group={workerGroup} />
        </ChatLine>
      </div>
      {items.map((keyname) => (
        <div key={keyname}>
          <WorkerItem channel={channel} group={workerGroup} name={keyname} />
        </div>
      ))}
    </div>
  )
}

export default WorkerDemo
