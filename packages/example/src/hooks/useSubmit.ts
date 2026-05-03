import { useMemoFn } from '@event-chat/core'
import { useCallback, useRef } from 'react'

const useSubmit = <T>(handle: T, callback?: () => void) => {
  const submitRef = useRef(false)
  const callbackRef = useMemoFn(callback)

  const submitHandle = useCallback(
    <DATA>(info: DATA, timer = 0) => {
      if (submitRef.current === false && typeof handle === 'function') {
        submitRef.current = true
        handle.call(null, info)
        callbackRef.current?.()
        setTimeout(() => {
          submitRef.current = false
        }, timer)
      }
    },
    [callbackRef, handle]
  )

  return [submitHandle] as const
}

export default useSubmit
