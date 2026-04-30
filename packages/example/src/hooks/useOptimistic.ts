import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import useMemoFn from './useMemoFn'

const useOptimistic = <STATE, ACTION>(
  baseState: STATE,
  reduce?: (state: STATE, action: ACTION) => STATE
) => {
  const [optimisticState, setOptimistiState] = useState(baseState)
  const actionRef = useRef<Array<Promise<void>>>([])
  const reduceRef = useMemoFn(reduce)

  const addOptimisticReduce = useCallback(
    (action: ACTION) => {
      if (reduceRef.current) return
      if (actionRef.current.length === 0) {
        console.warn('useOptimistic: Must be called in runTransition')
        return
      }
      startTransition(() => {
        setOptimistiState((current) => reduceRef.current?.(current, action) ?? current)
      })
    },
    [reduceRef]
  )

  const addOptimisticState: typeof setOptimistiState = useCallback((action) => {
    if (actionRef.current.length === 0) {
      console.warn('useOptimistic: Must be called in runTransition')
    }
    startTransition(() => {
      setOptimistiState(action)
    })
  }, [])

  const runTransition = useCallback(
    (callback: () => void | Promise<void>) => {
      const queue = Promise.resolve(callback())
        .then(() => {
          actionRef.current = actionRef.current.filter((item) => !Object.is(item, queue))
        })
        .catch(() => {
          actionRef.current = []
        })
        .finally(() => {
          if (actionRef.current.length === 0) {
            // 针对结束后 baseState 无论发生变化，都要重置 optimisticState
            setOptimistiState(baseState)
          }
        })

      actionRef.current.push(queue)
    },
    [baseState]
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

// 采用和 react19 一样的操作方式，官方默认提供的 useOptimistic 也并严谨
// 例如下面代码，在微任务完成前，即便在 startTransition 外部调用 setOptimisticIsLiked 会被认为合法
// 因为 React 将 hooks 作为一个整体，只在发起微任务时统一执行
//
// startTransition(async () => {
//   console.log('⏳ setting optimistic state: ' + newValue);

//   //   setOptimisticIsLiked(newValue);
//   const updatedValue = await toggleLike(newValue);

//   startTransition(() => {
//     console.log('⏳ setting real state: ' + updatedValue);
//     setIsLiked(updatedValue);
//   });
// });
// setOptimisticIsLiked(newValue);
// setOptimisticIsLiked(newValue);
// setOptimisticIsLiked(newValue);
// setOptimisticIsLiked(newValue);
