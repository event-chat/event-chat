import { useMemo, useRef } from 'react'

const useMemoFn = <T>(fn: T) => {
  const methodRef = useRef<T>(fn)
  methodRef.current = fn

  return useMemo(
    () => ({
      get current() {
        return methodRef.current
      },
    }),
    []
  )
}

export default useMemoFn
