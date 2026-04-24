import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import RPCDecorator, { ActionRecord, DecoratorContext } from './RPCDecorator'
import { RPCInstanceContext } from './fields'

const disableKey = ['destroy'] as const
const useRPC = <EVENT extends ActionRecord, CONSUME extends ActionRecord>({
  init,
  ...ops
}: RPCHooksOptions<EVENT, CONSUME>) => {
  const { mount, brodcastScope = () => {} } = useContext(RPCInstanceContext)
  const [connected, setConnected] = useState(false)

  const initRef = useRef(init)
  const opsRef = useRef(ops)

  const decoratorRef = useRef<RPCResult<EVENT, CONSUME> | null>(null)
  const processRef = useRef(Promise.resolve<ReturnType<typeof RPCDecorator> | null>(null))

  const isRPCResult = useCallback(
    (data: RPCResult<EVENT, CONSUME>, key: string): key is keyof RPCResult<EVENT, CONSUME> => {
      return data !== null && key in data
    },
    []
  )

  const rpcIns = useMemo(
    () =>
      new Proxy(
        {},
        {
          get(_, key) {
            const decorator = decoratorRef.current
            const keyname = key.toString()
            if (
              decorator &&
              !disableKey.map(String).includes(keyname) &&
              isRPCResult(decorator, keyname)
            ) {
              return decorator[keyname]
            }
            throw new Error(`outof decorator: ${key.toString()}`)
          },
          has(_, key) {
            const decorator = decoratorRef.current
            const keyname = key.toString()
            return (
              decorator !== null &&
              !disableKey.map(String).includes(keyname) &&
              isRPCResult(decorator, keyname)
            )
          },
          set() {
            throw new Error('decorator is readonly')
          },
        }
      ) as Readonly<Omit<RPCResult<EVENT, CONSUME>, (typeof disableKey)[number]>>,
    [decoratorRef, isRPCResult]
  )

  const mounHandle = useCallback(
    (name: string) => {
      if (decoratorRef.current) mount?.(decoratorRef.current, name)
    },
    [mount]
  )

  useEffect(() => {
    const { config, name = '', ...opConfig } = opsRef.current
    processRef.current = processRef.current.then(initRef.current).then((tar) => {
      // 如果是 iframe 不用等待 onload，RPC 会有心跳检测
      const result = RPCDecorator(tar instanceof HTMLIFrameElement ? tar.contentWindow : tar, {
        ...opConfig,
        config: {
          ...config,
          onConnect() {
            config?.onConnect?.()
            setConnected(true)
          },
          onDisconnect() {
            config?.onDisconnect?.()
            setConnected(false)
          },
        },
      })

      decoratorRef.current = result
      mount?.(result, name)
      return result
    })

    return () => {
      processRef.current = processRef.current.then((result) => {
        setConnected(false)
        if (result) {
          mount?.(result)
          result.destroy()
        }

        decoratorRef.current = null
        return null
      })
    }
  }, [mount])

  return Object.freeze({
    rpc: rpcIns,
    mount: mounHandle,
    connected,
    brodcastScope,
  })
}

export default useRPC

interface RPCHooksOptions<
  EVENT extends ActionRecord,
  CONSUME extends ActionRecord,
> extends DecoratorContext<EVENT, CONSUME> {
  init: () => TargetInit | Promise<TargetInit>
  name?: string
}

type RPCResult<EVENT extends ActionRecord, CONSUME extends ActionRecord> = ReturnType<
  typeof RPCDecorator<EVENT, CONSUME>
>

// hooks 只能在主线程下的 React 中使用，排除非主线程的对象
type TargetInit =
  | BroadcastChannel
  | ServiceWorkerRegistration
  | SharedWorker
  | WebSocket
  | Window
  | Worker
  | HTMLIFrameElement
  | null
