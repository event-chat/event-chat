import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { usePrefixCls } from '@formily/antd-v5/lib/__builtins__'
import { observer, useExpressionScope, useField } from '@formily/react'
import { Avatar, Flex, Space, Tooltip, Typography } from 'antd'
import { type FC, useMemo, useRef } from 'react'
import { cn } from 'tailwind-variants'
import type { SectionItem } from '../hooks/useFakeService'
import type { CollapseLookupType } from '../hooks/useSelectCollapse'
import useStyle from '../styles/sectionFace'
import { filterValue } from '../utils/fields'

const { Text } = Typography

const UserItem: FC<UserItemProps> = ({ checked, mail, name, section, onCancel }) => {
  const tips = [section, name, mail]
  return (
    <li className={cn([checked ? 'checked' : undefined])}>
      <Tooltip title={tips.filter((i) => i).join('-')}>
        <Space direction="vertical" size={0} onClick={() => onCancel(!checked)}>
          <div className="face">
            <Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${name}`} />
            <span className="choices choices-check">
              <CheckOutlined />
            </span>
            <span className="choices choices-close">
              <CloseOutlined />
            </span>
          </div>
          <Text className="tips-text" ellipsis>
            {name}
          </Text>
        </Space>
      </Tooltip>
    </li>
  )
}

const RecentChoicesInner: FC<RecentChoicesType> = ({
  className,
  eventName,
  hidden = false,
  limit = 20,
}) => {
  const recordRef = useRef<UserState[]>([])
  const field = useField()

  const { $record = {} } = useExpressionScope() as { $record?: CollapseLookupType['$lookup'] }
  const { userMap = {} } = $record

  const data = useMemo(() => filterValue(field.data) ?? [], [field.data])
  const prefixCls = usePrefixCls('recent-choices')
  const [wrapSSR, hashId] = useStyle(prefixCls)

  const record = useMemo(() => {
    const update = [...data].reverse()
    const items = recordRef.current.reduce<Record<string, UserState>>((current, item) => {
      const { name, section } = item
      return {
        ...current,
        [`${section}-${name}`]: { ...item, checked: false },
      }
    }, {})

    const newItems: UserState[] = []
    update.forEach((row) => {
      const newData = row || {}
      const { name = '', section = '' } = newData

      const point = name && section ? `${section}-${name}` : ''
      if (point === '') return

      const target = { ...newData, checked: true }
      if (items[point] !== undefined) {
        items[point] = target
      } else {
        newItems.push(target)
      }
    })

    recordRef.current = newItems.concat(Object.values(items)).splice(0, limit)
    return recordRef.current.filter(({ checked }) => !hidden || checked)
  }, [data, hidden, limit])

  return wrapSSR(
    <div className={cn([hashId, prefixCls, className])}>
      {record.length === 0 ? (
        <Flex align="center" justify="center">
          <Text type="secondary">请先选择部门或员工</Text>
        </Flex>
      ) : (
        <ul>
          {record.map((user, i) => {
            const { name, section } = user
            const keyname = `${name}-${i}`
            return (
              <UserItem
                {...user}
                key={keyname}
                mail={userMap[name]?.mail ?? ''}
                onCancel={(checked) => {
                  if (eventName)
                    field.form.notify(eventName, {
                      group: [name],
                      checked,
                      section,
                    })
                }}
              />
            )
          })}
        </ul>
      )}
    </div>
  )
}

const RecentChoices = observer(RecentChoicesInner)

export default RecentChoices

export interface RecentChoicesType {
  className?: string
  eventName?: string
  hidden?: boolean
  limit?: number
}

interface UserItemProps extends UserState {
  onCancel: (checked: boolean) => void
}

type UserState = SectionItem & { checked?: boolean }
