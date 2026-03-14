import { useEventChat } from '@event-chat/core'
import { isField } from '@formily/core'
import { observer, useExpressionScope, useField } from '@formily/react'
import { Input, type InputProps } from 'antd'
import { type FC, useMemo } from 'react'
import { type CollapseLookupType } from '../hooks/useSelectCollapse'

const EventInputInner: FC<InputProps> = (props) => {
  const { $record } = useExpressionScope() as ScopeType
  const { event } = $record
  const field = useField()

  const { group, prefix } = event ?? {}
  const eventName = useMemo(
    () => [prefix, field.address.segments.slice(-1)[0]].filter(Boolean).join('.'),
    [prefix, field.address]
  )

  useEventChat(eventName, {
    group: group === '' ? undefined : group,
    callback: ({ detail }) => {
      if (isField(field)) {
        const value = String(detail)
        field.value = value === '' ? undefined : value
      }
    },
  })

  return <Input {...props} />
}

const EventInput = observer(EventInputInner)

export default EventInput

type ScopeType = { $record: CollapseLookupType['$lookup'] }
