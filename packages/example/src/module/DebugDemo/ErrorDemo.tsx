import { FormEventContext } from '@event-chat/antd-item'
import { useEventChat } from '@event-chat/core'
import { Form, Tag } from 'antd'
import { type FC, useMemo, useState } from 'react'
import Switch from '@/components/Switch'
import ErrorList, { ReceiveInput, SendInput } from './ErrorList'
import ScrollMessageList from './ScrollMessageList'
import { refuseGroup, scrollEventName } from './utils'

const ErrorDemo: FC = () => {
  const [customField, setCustom] = useState<string>()
  const [group, setGroup] = useState(true)
  const [keyname, setKeyname] = useState<string>()
  const [token, setToken] = useState(false)

  const options = useMemo(() => (group ? { group: refuseGroup } : {}), [group])
  const { emit } = useEventChat('debug-trigger', options)

  return (
    <FormEventContext.Provider value={options}>
      <ErrorList list={<ScrollMessageList />}>
        <Form.Item label="接收的消息来自">
          <div className="flex gap-6">
            <div className="flex gap-3">
              <Switch checked={group} onChange={({ target }) => setGroup(target.checked)} />
              <span>{group ? '群组' : '非群组'}</span>
            </div>
            <div className="flex">
              <span className="after:ms-0.5 after:me-2 after:content-[':']">密钥</span>
              <div className="flex gap-3">
                <Switch checked={token} onChange={({ target }) => setToken(target.checked)} />
                <span>{token ? '已加密' : '不加密'}</span>
              </div>
            </div>
          </div>
        </Form.Item>
        <SendInput
          extra={
            <div className="pt-1">
              输入任意值都将触发 <Tag>group</Tag> 相关的错误
            </div>
          }
          label={group ? '无群组主控' : '群组内主控'}
          group={group ? undefined : refuseGroup}
          token={token ? keyname : undefined}
        />
        <SendInput
          extra={
            <div className="pt-1">
              输入任意值都将触发 <Tag>token</Tag> 相关的错误
            </div>
          }
          label={token ? '无密钥' : '发私信'}
          group={options.group}
          token={token ? undefined : keyname}
        />
        <SendInput
          extra={<div className="pt-1">无论输入什么都触发自定义错误</div>}
          label="自定义错误"
          group={options.group}
          token={token ? keyname : undefined}
          mount={(fieldName) => setCustom(fieldName)}
        />
        <SendInput
          extra={<div className="pt-1">只有长度大于 5 的纯数字的字符类型才能触发更新</div>}
          label="按规则更新"
          group={options.group}
          token={token ? keyname : undefined}
        />
        <ReceiveInput
          group={options.group}
          label="受控字段"
          lang={{
            customError: '不在自定义接收范围',
            groupEmpty: '不能能接受群组消息',
            groupProvider: '接收到来自非组内成员的消息',
            tokenEmpty: '不能接受私信',
            tokenProvider: '只能接受私信',
          }}
          token={token}
          debug={(record) => {
            Promise.resolve()
              .then(() =>
                emit({
                  detail: { ...record, error: record.error?.issues.slice(-1)[0].message },
                  name: scrollEventName,
                })
              )
              .catch(() => {})
          }}
          filter={({ origin }) => origin !== customField}
          mount={(tokenKey) => setKeyname(tokenKey)}
        />
      </ErrorList>
    </FormEventContext.Provider>
  )
}

export default ErrorDemo
