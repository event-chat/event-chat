import { usePrefixCls } from '@formily/antd-v5/lib/__builtins__'
import { type FieldDataSource, isField } from '@formily/core'
import { RecordScope, observer, useField } from '@formily/react'
import { ConfigProvider, type ConfigProviderProps } from 'antd'
import { type FC, type PropsWithChildren, useMemo } from 'react'
import { cn } from 'tailwind-variants'
import type { EventType } from '../event'
import type { SectionItem } from '../hooks/useFakeService'
import useStyle from '../styles/section'
import { isKey, objectKeys } from '../utils/fields'

const transformItem = (item: FieldDataSource[number]): SectionItem => {
  const record = { mail: '', name: '', section: '' }
  objectKeys(record).forEach((key) => {
    record[key] = isKey(key, item) ? String(item[key]).trim() : ''
  })

  return record
}

const UserMapRecordInner: FC<PropsWithChildren<UserMapRecordProps>> = ({
  children,
  className,
  group,
  prefix,
  index = 1,
  ...props
}) => {
  const field = useField()
  const record = !isField(field) ? [] : (field.dataSource ?? [])

  const prefixCls = usePrefixCls('section')
  const [wrapSSR, hashId] = useStyle(prefixCls)

  const event = useMemo(() => ({ group, prefix }), [group, prefix])
  const userMap = record.reduce<Record<string, SectionItem>>((current, item) => {
    const recordItem = transformItem(item)
    const { name, section } = recordItem

    return name === '' || section === ''
      ? current
      : {
          ...current,
          [name]: recordItem,
        }
  }, {})

  return wrapSSR(
    <RecordScope getRecord={() => ({ userMap, event })} getIndex={() => index}>
      <ConfigProvider {...props}>
        <div className={cn([hashId, prefixCls, className])}>{children}</div>
      </ConfigProvider>
    </RecordScope>
  )
}

const UserMapRecord = observer(UserMapRecordInner)

export default UserMapRecord

export interface UserMapRecordProps extends ConfigProviderProps, EventType {
  className?: string
  index?: number
}
