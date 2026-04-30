import useOptimistic from '@/hooks/useOptimistic'
import { useEventChat } from '@event-chat/core'
import { type FC, startTransition, useEffect, useRef, useState } from 'react'
import z from 'zod'
import Button from '@/components/Button'
import { serviceUpdate } from './utils'

const group = 'like-group'

const LikeButton: FC = () => {
  const [isLiked, setIsLiked] = useState(false)
  const [optimisticIsLiked, setOptimisticIsLiked, runTransaction] = useOptimistic(isLiked)

  const { emit } = useEventChat('like-button', { group })
  if (optimisticIsLiked !== isLiked) {
    emit({ detail: `✅ rendering optimistic state: ${optimisticIsLiked}`, name: 'like-log' })
  } else {
    emit({ detail: `✅ rendering real value: ${optimisticIsLiked}`, name: 'like-log' })
  }

  return (
    <Button
      variant="outline"
      onClick={() => {
        runTransaction(async () => {
          const newValue = !optimisticIsLiked

          emit({ detail: `⏳ setting optimistic state: ${newValue}`, name: 'like-log' })
          setOptimisticIsLiked(newValue)

          const updatedValue = await serviceUpdate(newValue)
          startTransition(() => {
            emit({ detail: `⏳ setting real state: ${updatedValue}`, name: 'like-log' })
            setIsLiked(updatedValue)
          })
        })
      }}
    >
      {optimisticIsLiked ? '❤️ Unlike' : '🤍 Like'}
    </Button>
  )
}

const LinkLog: FC = () => {
  const [logs, setLogs] = useState<Array<{ detail: string; time: Date }>>([])
  const wrapRef = useRef<HTMLDivElement>(null)

  useEventChat('like-log', {
    schema: z.string(),
    callback: ({ detail, time }) => setLogs((current) => current.concat([{ detail, time }])),
    group,
  })

  useEffect(() => {
    Promise.resolve()
      .then(() => {
        wrapRef.current?.scrollTo({
          top: wrapRef.current.scrollHeight - wrapRef.current.clientHeight,
          behavior: 'smooth',
        })
      })
      .catch(() => {})
  }, [logs])

  return (
    <div className="max-h-80 overflow-auto" ref={wrapRef}>
      <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-2">
        <ul>
          {logs.map((item, i) => {
            const keyname = `${i}:${item.time.toISOString()}`
            return (
              <li key={keyname}>
                {item.detail} - {item.time.toLocaleTimeString()}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

const LikeButtonApp: FC = () => (
  <div data-theme="dark">
    <LikeButton />
    <LinkLog />
  </div>
)

export default LikeButtonApp
