import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import useMemoFn from './useMemoFn'

const useOptimistic = <STATE, ACTION>(
  baseState: STATE,
  reduce?: (state: STATE, action: ACTION) => STATE
) => {
  const [optimisticState, setOptimistiState] = useState(baseState)
  const actionRef = useRef<Array<() => Promise<void>>>([])
  const queueRef = useRef<Promise<void> | null>(null)
  const reduceRef = useMemoFn(reduce)

  const addOptimisticReduce = useCallback(
    (action: ACTION) => {
      if (reduceRef.current) return
      if (actionRef.current.length > 0) {
        startTransition(() => {
          setOptimistiState((current) => reduceRef.current?.(current, action) ?? current)
        })
        return
      }
      console.warn('useOptimistic: Must be called in runTransition')
    },
    [reduceRef]
  )

  const addOptimisticState: typeof setOptimistiState = useCallback((action) => {
    if (actionRef.current.length > 0) {
      startTransition(() => {
        setOptimistiState(action)
      })
      return
    }
    console.warn('useOptimistic: Must be called in runTransition')
  }, [])

  const doAction = useCallback(() => {
    queueRef.current ??= actionRef.current.reduce(
      (current, item) => current.then(item),
      Promise.resolve()
    )
  }, [])

  const runTransition = useCallback(
    (callback: () => void | Promise<void>) => {
      const queue = () =>
        Promise.resolve(callback())
          .then(() => {
            const index = actionRef.current.findIndex((item) => Object.is(item, queue))
            if (index !== -1) {
              actionRef.current.splice(index, 1)
            }
          })
          .catch(() => {
            actionRef.current = []
          })
          .finally(() => {
            if (actionRef.current.length === 0) {
              // 针对结束后 baseState 无论发生变化，都要重置 optimisticState
              setOptimistiState(baseState)
              queueRef.current = null
            }
          })

      actionRef.current.push(queue)
      doAction()
    },
    [baseState, doAction]
  )

  useEffect(() => {
    // 针对没有队列的情况下 baseState 发生变化的情况，直接更新 optimisticState，用于下次乐观更新的基准状态
    if (actionRef.current.length === 0) setOptimistiState(baseState)
  }, [baseState])

  return [
    optimisticState,
    reduce ? addOptimisticReduce : addOptimisticState,
    runTransition,
  ] as const
}

export default useOptimistic
