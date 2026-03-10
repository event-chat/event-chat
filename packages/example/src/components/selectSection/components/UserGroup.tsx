import { RecordsScope, observer } from '@formily/react'
import { Col, Row } from 'antd'
import { type FC, type PropsWithChildren, useMemo } from 'react'
import { useGroupScope } from '../hooks/useSelectCollapse'

const InternalGroup: FC<PropsWithChildren<InternalGroupProps>> = ({ children, schema = {} }) =>
  schema.remove === undefined ? (
    <>{children}</>
  ) : (
    <div className="group-item">
      {children}
      {schema.remove}
    </div>
  )

const UserGroupInner: FC = () => {
  const { group = new Set(), schema = {}, search = '' } = useGroupScope()
  const list = useMemo(
    () => Array.from(group).filter((name) => search === '' || name.toLowerCase().includes(search)),
    [group, search]
  )

  return (
    <Row gutter={[0, 16]}>
      {list.map((name, i) => {
        const keyname = `${name}-${i}`
        return (
          <Col key={keyname} span={24}>
            <RecordsScope getRecords={() => [name]}>
              <InternalGroup schema={schema}>
                {schema.checkbox === undefined ? name : schema.checkbox}
              </InternalGroup>
            </RecordsScope>
          </Col>
        )
      })}
    </Row>
  )
}

const UserGroup = observer(UserGroupInner)

export default UserGroup

interface InternalGroupProps extends Pick<ReturnType<typeof useGroupScope>, 'schema'> {}
