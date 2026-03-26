import { FormEventContext } from '@event-chat/antd-item'
import { useEventChat } from '@event-chat/core'
import { Form, Input } from 'antd'
import { type FC } from 'react'
import ErrorList from './ErrorList'
import ScrollMessageList from './ScrollMessageList'
import { scrollEventName } from './utils'

const options = { group: 'single-group' }
const eventName = 'pubsub-input'

const SingleEvent: FC = () => {
  const { emit: liteEmit } = useEventChat('lite-input', options)
  const { emit } = useEventChat(eventName, {
    ...options,
    filter: () => false,
    debug: (record) => {
      const emitHandle = ['init', 'invalid'].includes(record.status) ? emit : liteEmit
      Promise.resolve()
        .then(() =>
          emitHandle({
            detail: { ...record, error: record.error?.issues.slice(-1)[0].message },
            name: scrollEventName,
          })
        )
        .catch(() => {})
    },
  })

  return (
    <FormEventContext.Provider value={options}>
      <ErrorList list={<ScrollMessageList />}>
        <Form.Item extra="发送任何消息都会触发错误" label="触发自身">
          <Input onChange={({ target }) => emit({ detail: target.value, name: eventName })} />
        </Form.Item>
      </ErrorList>
    </FormEventContext.Provider>
  )
}

export default SingleEvent
