import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import RPCDecorator, { ActionRecord, DecoratorContext } from '../core/RPCDecorator'
import { EntryOptions, FactoryOptions } from '../transports/fields'
import { RPCInstanceContext } from './fields'

const disableKey = ['destroy'] as const
const defaultBrod = () => {}

const useRPC = <EVENT extends ActionRecord, CONSUME extends ActionRecord, TARGET>(
  ops: RPCHooksOptions<EVENT, CONSUME> | RPCDriveOptions<EVENT, CONSUME, TARGET>
) => {
  const { brodcastScope, mount } = useContext(RPCInstanceContext)
  const [connected, setConnected] = useState(false)

  const decoratorRef = useRef<RPCResult<EVENT, CONSUME> | null>(null)
  const processRef = useRef(Promise.resolve<RPCResult<EVENT, CONSUME> | null>(null))
  const opsRef = useRef(ops)

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
    const { config, options, drive, init, name = '', ...opConfig } = opsRef.current

    // 如果是 iframe 不用等待 onload，RPC 会有心跳检测
    // 这里采用外层限制，内部宽松，因为除了 TARGET，createRPC 接受 unknown
    processRef.current = processRef.current
      .then(() => init())
      .then((tar) => (tar instanceof HTMLIFrameElement ? tar.contentWindow : tar))
      .then((tar) => {
        const context = {
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
        }
        return tar
          ? drive(tar as TARGET, {
              context,
              options,
            })
          : RPCDecorator(null, context)
      })
      .then((result) => {
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
    brodcastScope: brodcastScope ?? defaultBrod,
    mount: mounHandle,
    connected,
  })
}

export default useRPC

interface RPCBaseOptions {
  name?: string
  options?: FactoryOptions
}

interface RPCDriveOptions<EVENT extends ActionRecord, CONSUME extends ActionRecord, TARGET>
  extends RPCBaseOptions, DecoratorContext<EVENT, CONSUME> {
  drive: (target: TARGET, config?: EntryOptions<EVENT, CONSUME>) => RPCResult<EVENT, CONSUME>
  init: () => TARGET | null | Promise<TARGET | null>
}

interface RPCHooksOptions<EVENT extends ActionRecord, CONSUME extends ActionRecord>
  extends RPCBaseOptions, DecoratorContext<EVENT, CONSUME> {
  drive: (
    target: unknown,
    context?: EntryOptions<EVENT, CONSUME>
  ) => Promise<RPCResult<EVENT, CONSUME>>
  init: () => TargetInit | Promise<TargetInit>
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
