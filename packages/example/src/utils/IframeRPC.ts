import { type ValueOf, isKey } from './fields'

const defaultOptions = {
  allowedOrigins: [],
  heartbeatInterval: 3000,
  heartbeatTimeout: 8000,
  retryTimeout: 5000,
  retryTimes: 2,
} satisfies RPCOptionsType

class IframeRPC {
  private _brodcastListeners: BrodcastItem[] = []
  private _pending = new Map<string, PendingItem>()
  private _handlers: HandlersRecord = {}
  private _heartbeatTimer: number | null = null
  private _isConnected = false
  private _lastHeartbeat = Date.now()
  private _options?: RPCOptionsType = {}
  private _boundMessageHandler = this._messageHandler.bind(this)

  constructor(
    private _target: Window | null,
    options?: RPCOptionsType
  ) {
    this._options = { ...defaultOptions, ...options }
    window.addEventListener('message', this._boundMessageHandler)
    this._startHeartbeat()
  }

  destroy() {
    clearTimeout(this._heartbeatTimer ?? undefined)
    window.removeEventListener('message', this._boundMessageHandler)
    this._pending.clear()

    this._brodcastListeners = []
    this._handlers = {}
    this._heartbeatTimer = null
    this._isConnected = false
  }

  broadcast(data: unknown) {
    if (this._isConnected) {
      this._target?.postMessage({ broadcast: true, payload: data }, '*')
    }
  }

  on(type: PropertyKey, handler: ValueOf<HandlersRecord>) {
    this._handlers[type] = handler
  }

  onBrodcast(listener: BrodcastItem) {
    this._brodcastListeners.push(listener)
  }

  request(type: PropertyKey, payload?: unknown, retry = 0) {
    return new Promise((resolve, reject) => {
      if (!this._isConnected || !this._target) {
        reject(new Error(`[RPC] 连接未建立，无法请求：${type.toString()}`))
        return
      }

      const requestId = this._createRequestId()
      const timer = window.setTimeout(() => {
        this._pending.delete(requestId)
        if (retry < (this._options?.retryTimes ?? defaultOptions.retryTimes)) {
          resolve(this.request(type, payload, retry + 1))
        } else {
          reject(new Error(`[RPC] 请求超时：${type.toString()}`))
        }
      }, this._options?.retryTimeout ?? defaultOptions.retryTimeout)

      this._pending.set(requestId, {
        resolve: (res) => {
          clearTimeout(timer)
          resolve(res)
        },
        reject: (err) => {
          const message = err instanceof Error ? err.message : '[RPC] 处理消息时发生错误'
          clearTimeout(timer)
          reject(new Error(message))
        },
      })

      this._target.postMessage(
        { payload, requestId, type },
        this._options?.allowedOrigins?.[0] ?? '*'
      )
    })
  }

  private _createRequestId(): string {
    const requestId = Math.random().toString(36).slice(2, 10)
    return this._pending.has(requestId) ? this._createRequestId() : requestId
  }

  private _isOriginAllowed(origin: string) {
    return this._options?.allowedOrigins?.some((item) => item === origin || item === '*') ?? false
  }

  private _messageHandler(event: MessageEvent<MessageItem | undefined>) {
    const { origin } = event
    if (!this._isOriginAllowed(origin)) return

    const { data } = event
    const { broadcast, error, heartbeat, requestId, payload, type } = data ?? {}

    // 心跳
    if (heartbeat) {
      this._lastHeartbeat = Date.now()
      // ✅ 心跳恢复：标记连接成功
      if (!this._isConnected) {
        this._isConnected = true
        this._options?.onConnect?.()
      }
      return
    }

    // 广播
    if (broadcast) {
      this._brodcastListeners.forEach((listener) => listener(payload, origin))
      return
    }

    // 响应回调
    const pending = requestId ? this._pending.get(requestId) : undefined
    if (requestId && pending) {
      const { resolve, reject } = pending
      this._pending.delete(requestId)
      if (error) {
        reject(new Error(error))
      } else {
        resolve(payload)
      }
    }

    // 本地方法调用
    const handler = type && isKey(type, this._handlers) ? this._handlers[type] : undefined
    if (handler) {
      Promise.resolve()
        .then(() => handler(payload))
        .then((result) => {
          this._target?.postMessage({ payload: result, requestId, type }, origin)
        })
        .catch((err) => {
          const message = err instanceof Error ? err.message : '[RPC] 处理消息时发生错误'
          this._target?.postMessage({ error: message, payload: '', requestId }, origin)
        })
    }
  }

  private _startHeartbeat() {
    clearInterval(this._heartbeatTimer ?? undefined)
    this._heartbeatTimer = window.setInterval(() => {
      this._target?.postMessage({ heartbeat: true }, '*')

      // ❌ 心跳超时
      if (!this._isConnected) return
      if (
        Date.now() - this._lastHeartbeat >
        (this._options?.heartbeatTimeout ?? defaultOptions.heartbeatTimeout)
      ) {
        this._isConnected = false
        this._options?.onDisconnect?.()

        this._pending.forEach(({ reject }) => reject(new Error('[RPC] 连接已断开，请求已取消')))
        this._pending.clear()
      }
    }, this._options?.heartbeatInterval ?? defaultOptions.heartbeatInterval)
  }
}

export { IframeRPC }

type BrodcastItem = (value: unknown, origin: string) => void

type HandlersRecord = Record<PropertyKey, (value?: unknown) => void>

type MessageItem = {
  payload: unknown
  broadcast?: boolean
  error?: string
  heartbeat?: boolean
  requestId?: string
  type?: PropertyKey
}

type PendingItem = Record<'resolve' | 'reject', (value?: unknown) => void>

type RPCOptionsType = {
  allowedOrigins?: string[]
  heartbeatInterval?: number
  heartbeatTimeout?: number
  retryTimeout?: number
  retryTimes?: number
  onConnect?: () => void
  onDisconnect?: () => void
}
