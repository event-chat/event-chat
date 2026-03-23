import type { EventChatOptions } from '@event-chat/core'
import { type FC, useEffect, useRef } from 'react'
import { safetyPrint } from '@/utils/fields'

// 格式化时间为易读格式
const formatTime = (date: Date) =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)

export const ErrorResultList: FC<ErrorResultListProps> = ({ errors }) => {
  const wrapRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    Promise.resolve()
      .then(() => {
        wrapRef.current?.scrollTo({
          top: wrapRef.current.scrollHeight - wrapRef.current.clientHeight,
          behavior: 'smooth',
        })
      })
      .catch(() => {})
  }, [errors])

  return errors.length === 0 ? (
    <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">暂无错误记录</div>
  ) : (
    <div className="max-h-80 overflow-auto" ref={wrapRef}>
      <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-2">
        {errors.map((error, index) => {
          const keyname = `${index}:${Math.random()}`
          const { time } = error
          return (
            <div
              key={keyname}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-center text-sm text-gray-500">
                <span className="mr-2">🕒</span>
                <span>{formatTime(time)}</span>
              </div>

              <div className="mb-3">
                <p className="mb-1 text-sm font-medium text-gray-700">错误数据：</p>
                <pre className="max-h-20 overflow-auto rounded-md bg-gray-50 p-2 text-xs text-gray-800">
                  {safetyPrint(error.data)}
                </pre>
              </div>

              <div>
                <p className="mb-1 text-sm font-medium text-red-600">错误原因：</p>
                <div className="rounded-md bg-red-50 p-2 text-xs text-red-700">
                  <ul className="list-inside list-disc space-y-1">
                    <li>{error.error?.message}</li>
                  </ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 复用你定义的类型
export type EerrorItem = NonNullable<Parameters<NonNullable<EventChatOptions<string>['debug']>>[0]>

// 错误列表组件
interface ErrorResultListProps {
  errors: EerrorItem[] // 错误列表数据
}

// 组件使用示例
// const demoErrors: ResultType[] = [
//   {
//     data: { username: '', age: 'abc' },
//     time: new Date(),
//     error: { message: 'Validation failed' },
//     issues: [
//       { path: ['username'], message: '用户名不能为空' },
//       { path: ['age'], message: '年龄必须是数字' },
//     ],
//   },
// ];
// <ErrorResultList errors={demoErrors} />
