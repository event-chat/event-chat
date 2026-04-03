import FormEvent from '@event-chat/antd-item'
import { ConfigProvider, Divider, Rate, Space } from 'antd'
import { type FC, type ReactNode, useCallback, useState } from 'react'
import z from 'zod'
import Button from '@/components/Button'
import { type DebugItem, type EerrorItem, ErrorResultList } from '@/components/ErrorResultList'
import StatusCard, { type StatusCardProps } from '@/components/StatusCard'
import Toast from '@/components/toast'
import { toastOpen } from '@/utils/event'
import { isKey, objectEntries, safetyPrint } from '@/utils/fields'

const baseSchema = z.number().int().min(1).max(5)

const codeMap = Object.freeze({
  1: 100,
  2: 200,
  3: 300,
  4: 400,
  5: 500,
})

const statusMap = Object.freeze({
  1: 'waiting',
  2: 'success',
  3: 'waiting',
  4: 'failed',
  5: 'failed',
})

const textMap = Object.freeze({
  1: '表示临时响应，请求已接收，需要客户端继续操作。',
  2: '表示请求已成功被服务器接收、理解、并接受。',
  3: '表示需要客户端采取进一步的操作才能完成请求。',
  4: '表示客户端看起来可能发生了错误，妨碍了服务器的处理。',
  5: '表示服务器在处理请求的过程中发生了错误。',
})

const customIcons: Record<number, ReactNode> = {
  1: <span>🔵</span>,
  2: <span>✅</span>,
  3: <span>🔄</span>,
  4: <span>❌</span>,
  5: <span>🚨</span>,
}

const convertCode = (param: unknown) => {
  const numval =
    typeof param === 'object' && param && 'code' in param ? Number(param.code ?? 0) : undefined

  const index = numval ? objectEntries(codeMap).find(([, code]) => code === numval) : undefined
  return index ? Number(index[0]) : undefined
}

const convertData = (value: unknown) =>
  Object.freeze({
    code: isKey(value, codeMap) ? codeMap[value] : undefined,
    status: isKey(value, statusMap) ? statusMap[value] : undefined,
    text: isKey(value, textMap) ? textMap[value] : undefined,
  })

const FormButton: FC<{ name: string }> = ({ name }) => {
  const form = FormEvent.useFormInstance()
  return (
    <FormEvent.Item colon={false} label={` `}>
      <Space>
        <Button
          onClick={() => {
            const detail = Math.floor(Math.random() * 10 + 1)
            form.emit?.({ detail, name })
          }}
        >
          随机赋值
        </Button>
        <span>设置的值有可能是错误的</span>
      </Space>
    </FormEvent.Item>
  )
}

const RateInput: FC<RateInputProps> = ({ value, onChange }) => (
  <div className="mb-2">
    <div className="mb-2 inline-block rounded-xl bg-gray-50 px-4 py-2">
      <Rate
        tooltips={Object.values(codeMap).map(String)}
        value={convertCode(value)}
        character={({ index = 0 }) => customIcons[index + 1]}
        onChange={(valueNum) => onChange?.(convertData(valueNum))}
      />
    </div>
    <StatusCard {...value} text={value?.text ?? '请滑动选择...'} />
  </div>
)

const FormRate: FC = () => {
  const [debug, setDebug] = useState<DebugItem[]>([])
  const [form] = FormEvent.useForm({ group: 'form-rate' })

  const debugHandle = useCallback(
    (name: string, log?: EerrorItem) => {
      if (log?.status === 'invalid') {
        const { data } = log
        const { time } = data
        setDebug((current) =>
          current.concat([
            {
              ...log,
              data: `[${name}]: ${safetyPrint(data.detail) ?? ''}`,
              time,
            },
          ])
        )

        form.emit({
          detail: {
            message: '这条 toast 来自 form 实例',
            title: `随机设置 ${name} 失败`,
            type: 'error',
          },
          name: toastOpen,
        })
      }
    },
    [form, setDebug]
  )

  return (
    <ConfigProvider
      theme={{ components: { Rate: { starHoverScale: 'scale(1.5)', starSize: 32 } } }}
    >
      <Toast group={'form-rate'} />
      <div className="max-w-150">
        <FormEvent form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
          <FormButton name="rateInput" />
          <FormEvent.Item
            extra="拿到数值后，只渲染不过滤"
            label="rateInput"
            name="rateInput"
            schema={baseSchema.transform(convertData)}
            getValueFromEvent={convertCode}
            getValueProps={(value) => ({ value: value ? convertData(value) : undefined })}
            debug={(log) => debugHandle('rateInput', log)}
          >
            <RateInput />
          </FormEvent.Item>
          <Divider />
          <FormButton name="transform" />
          <FormEvent.Item
            extra="拿到数值后，过滤数据并渲染"
            label="transform"
            name="transform"
            schema={baseSchema.transform(convertData)}
            debug={(log) => debugHandle('transform', log)}
            transform={(value: unknown) => convertCode(value)}
          >
            <RateInput />
          </FormEvent.Item>
          <FormEvent.Item label="异常监听">
            <div className="rounded-xl bg-gray-800 p-4">
              <ErrorResultList errors={debug} />
            </div>
          </FormEvent.Item>
          <FormEvent.Item colon={false} label={` `} shouldUpdate>
            {() => (
              <pre className="max-h-80 overflow-auto rounded-xl bg-gray-800 p-4 text-sm">
                {JSON.stringify(form.getFieldsValue(), null, 2)}
              </pre>
            )}
          </FormEvent.Item>
        </FormEvent>
      </div>
    </ConfigProvider>
  )
}

export default FormRate

interface RateInputProps {
  value?: StatusCardProps
  onChange?: (value?: StatusCardProps) => void
}
