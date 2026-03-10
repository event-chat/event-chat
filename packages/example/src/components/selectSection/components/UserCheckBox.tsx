import { ExpressionScope, observer, useForm } from '@formily/react'
import { Avatar, Checkbox, type CheckboxProps, Col, Row, Space, Typography } from 'antd'
import { type FC, type PropsWithChildren, useMemo } from 'react'
import { cn } from 'tailwind-variants'
import { useGroupScope } from '../hooks/useSelectCollapse'

const { Text } = Typography

const InternalUser: FC<PropsWithChildren<InternalUserProps>> = ({
  children,
  eventName,
  group,
  records,
  values,
  section = '',
  ...props
}) => {
  const form = useForm()
  const checked = useMemo(() => {
    if (!records?.length) {
      const size = group?.size ?? 0
      return size > 0 && size === (values?.size ?? 0)
    } else {
      return Array.from(values ?? []).includes(records[0])
    }
  }, [group, records, values])

  const indeterminate = useMemo(() => {
    const size = values?.size ?? 0
    return !records?.length && size > 0 && size < (group?.size ?? 0)
  }, [group, records, values])

  return (
    <Checkbox
      {...props}
      checked={checked}
      indeterminate={indeterminate}
      onChange={({ target }) => {
        if (eventName)
          form.notify(eventName, {
            checked: target.checked,
            group: !records?.length ? Array.from(group ?? new Set()) : records,
            section,
          })
      }}
    >
      {children}
    </Checkbox>
  )
}

const UserCheckBoxInner: FC<PropsWithChildren<UserCheckProps>> = ({ children, ...props }) => {
  const { group, pattern, records, section, values } = useGroupScope()
  const $section = (records?.length ?? 0) === 0

  return (
    <ExpressionScope value={{ $section }}>
      {pattern === 'readPretty' ? (
        <>{children}</>
      ) : (
        <InternalUser {...props} group={group} records={records} section={section} values={values}>
          {children}
        </InternalUser>
      )}
    </ExpressionScope>
  )
}

const UserFace: FC = () => {
  const { pattern, records = [], userMap = {}, search } = useGroupScope()
  const name = records[0]

  return name === undefined ? null : (
    <Space>
      <Avatar
        src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${name}`}
        style={{ backgroundColor: '#d0e7c5' }}
      />
      {pattern ? (
        <Row>
          <Col span={24}>
            <Text
              className={cn([
                !!search && name.toLowerCase().includes(search) ? 'searchChecked' : undefined,
              ])}
            >
              {name}
            </Text>
          </Col>
          <Col span={24}>{userMap[name] && <Text type="secondary">{userMap[name].mail}</Text>}</Col>
        </Row>
      ) : (
        <Row gutter={[8, 8]}>
          <Col flex="none">
            <Text
              className={cn([
                !!search && name.toLowerCase().includes(search) ? 'searchChecked' : undefined,
              ])}
            >
              {name}
            </Text>
          </Col>
          <Col flex="auto">
            {userMap[name] && <Text type="secondary">({userMap[name].mail})</Text>}
          </Col>
        </Row>
      )}
    </Space>
  )
}

const UserPanel: FC = () => {
  const { group, search, section } = useGroupScope()
  return (
    <>
      <Text
        className={cn([
          !!search && !!section && section.toLowerCase().includes(search)
            ? 'searchChecked'
            : undefined,
        ])}
      >
        {section}
      </Text>{' '}
      <Text type="secondary">({group?.size ?? 0})</Text>
    </>
  )
}

const UserCheckBox = observer(UserCheckBoxInner)

export { UserFace, UserPanel }

export default UserCheckBox

export interface UserCheckProps extends CheckboxProps {
  eventName?: string
}

interface InternalUserProps
  extends
    UserCheckProps,
    Pick<ReturnType<typeof useGroupScope>, 'group' | 'records' | 'section' | 'values'> {}
