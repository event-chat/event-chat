import { TARGET_TYPE_STRINGS } from './fields'

function isSafeBufferSource(data: unknown): data is ArrayBuffer | ArrayBufferView<ArrayBuffer> {
  return (
    data instanceof ArrayBuffer || (ArrayBuffer.isView(data) && data.buffer instanceof ArrayBuffer)
  )
}

class RPCFactory<T extends TargetType = TargetType> {
  private _onconnect: ConnectRecordType = {}

  constructor(
    private _target: T,
    private _options: FactoryOptions = {}
  ) {
    this._onconnect = {
      WebSocketPort: new Promise((resolve) => {
        if (this._target instanceof WebSocket) {
          this._target.onopen = () => {
            resolve(true)
          }

          this._target.onclose = () => {
            resolve(false)
          }
        } else {
          resolve(false)
        }
      }),
    }
  }

  // 通过 Decorator 调用，注销实例顺序：RPCAction - RPCFactory
  // RPCAction 注销前会先 onremove
  destory() {
    if (this._target instanceof BroadcastChannel) {
      this._target.close()
    }

    if (this._target instanceof WebSocket) {
      this._target.onclose = null
      this._target.onopen = null

      if (this._target.readyState === WebSocket.OPEN) this._target.close()
    }

    // window 通过 onremove 注销

    if (this._target instanceof ServiceWorkerContainer) {
      // ServiceWorkerContainer
      // navigator.serviceWorker 是持久进程，这里暂且不注销，外部操作
    }

    if (this._target instanceof SharedWorker) {
      this._target.port.close()
    }

    if (
      typeof SharedWorkerGlobalScope !== 'undefined' &&
      this._target instanceof SharedWorkerGlobalScope
    ) {
      this._onconnect.SharedWorkerGlobalPort?.then((messagePort) => messagePort.close()).catch(
        () => {}
      )
      if (this._onconnect.SharedWorkerGlobalScope) {
        this._target.removeEventListener('connect', this._onconnect.SharedWorkerGlobalScope)
      }
    }

    if (this._target instanceof Worker) {
      this._target.terminate()
    }

    // DedicatedWorkerGlobalScope 内部不用注销

    this._onconnect = {}
  }

  getType() {
    return `${Object.prototype.toString.call(this._target)}`
  }

  is(source: MessageEventSource | null) {
    return this._target === source
  }

  onmessage(listener: (ev: MessageEvent) => unknown) {
    // 同源跨标签 / 窗口
    if (this._target instanceof BroadcastChannel) {
      this._target.addEventListener('message', listener, this._options.message)
    }

    // websocket client
    if (this._target instanceof WebSocket) {
      this._target.onmessage = listener
    }

    // window.parent or iframe.contentWindow
    if (this.getType() === TARGET_TYPE_STRINGS.Window) {
      window.addEventListener('message', listener, this._options.message)
    }

    // 主线程 → ServiceWorker: navigator.serviceWorker
    if (
      typeof ServiceWorkerRegistration !== 'undefined' &&
      this._target instanceof ServiceWorkerRegistration
    ) {
      // ServiceWorkerContainer
      navigator.serviceWorker.addEventListener('message', listener, this._options.message)
    }

    // ServiceWorker - 主线程
    if (
      typeof ServiceWorkerGlobalScope !== 'undefined' &&
      this._target instanceof ServiceWorkerGlobalScope
    ) {
      this._onconnect.ServiceWorkerGlobalScope = (event: ExtendableMessageEvent) => {
        const ports = event.ports.map((i) => i)
        const source = event.source instanceof Client ? null : event.source

        const messageEvent = new MessageEvent('serverWork', { ...event, ports, source })
        listener(messageEvent)
      }
      this._target.addEventListener(
        'message',
        this._onconnect.ServiceWorkerGlobalScope,
        this._options.message
      )
    }

    // 多页面共享一个 Worker 线程
    if (this._target instanceof SharedWorker) {
      this._target.port.addEventListener('message', listener, this._options.message)
      this._target.port.start()
    }

    // 共享 Worker 内部
    if (
      typeof SharedWorkerGlobalScope !== 'undefined' &&
      this._target instanceof SharedWorkerGlobalScope
    ) {
      const SharedWorker = this._target
      this._onconnect.SharedWorkerGlobalPort = new Promise((resolve) => {
        this._onconnect.SharedWorkerGlobalScope = (event: MessageEvent) => {
          const port = event.ports[0]
          resolve(port)

          port.addEventListener('message', listener, this._options.message)
          port.start()
        }

        SharedWorker.addEventListener('connect', this._onconnect.SharedWorkerGlobalScope)
      })
    }

    // 主线程 → 专用 Worker
    if (this._target instanceof Worker) {
      this._target.addEventListener('message', listener, this._options.message)
    }

    // Worker 内部全局对象
    if (
      typeof DedicatedWorkerGlobalScope !== 'undefined' &&
      this._target instanceof DedicatedWorkerGlobalScope
    ) {
      this._target.addEventListener('message', listener, this._options.message)
    }
  }

  // 只提供监听、移除的方法，记录方法的事件需要外部处理
  onremove(listener: (ev: MessageEvent) => unknown) {
    if (this._target instanceof BroadcastChannel) {
      this._target.removeEventListener('message', listener, this._options.message)
    }

    if (this._target instanceof WebSocket) {
      this._target.onmessage = null
    }

    if (this.getType() === TARGET_TYPE_STRINGS.Window) {
      window.removeEventListener('message', listener, this._options.message)
    }

    if (
      typeof ServiceWorkerRegistration !== 'undefined' &&
      this._target instanceof ServiceWorkerRegistration
    ) {
      // ServiceWorkerContainer
      navigator.serviceWorker.removeEventListener('message', listener, this._options.message)
    }

    if (
      typeof ServiceWorkerGlobalScope !== 'undefined' &&
      this._target instanceof ServiceWorkerGlobalScope &&
      this._onconnect.ServiceWorkerGlobalScope
    ) {
      this._target.removeEventListener(
        'message',
        this._onconnect.ServiceWorkerGlobalScope,
        this._options.message
      )
    }

    if (this._target instanceof SharedWorker) {
      this._target.port.removeEventListener('message', listener, this._options.message)
    }

    if (
      typeof SharedWorkerGlobalScope !== 'undefined' &&
      this._target instanceof SharedWorkerGlobalScope
    ) {
      this._onconnect.SharedWorkerGlobalPort?.then((messagePort) => {
        messagePort.removeEventListener('message', listener, this._options.message)
      }).catch(() => {})
    }

    if (this._target instanceof Worker) {
      this._target.removeEventListener('message', listener, this._options.message)
    }

    if (
      typeof DedicatedWorkerGlobalScope !== 'undefined' &&
      this._target instanceof DedicatedWorkerGlobalScope
    ) {
      this._target.removeEventListener('message', listener, this._options.message)
    }
  }

  postMessage(message: unknown, options?: IframeSerializeOptions) {
    const { transfer, targetOrigin = '*' } = options ?? {}
    if (this._target instanceof BroadcastChannel) {
      this._target.postMessage(message)
    }

    if (this._target instanceof WebSocket) {
      const target = this._target
      this._onconnect.WebSocketPort?.then((open) => {
        if (open)
          target.send(
            isSafeBufferSource(message) || message instanceof Blob ? message : String(message)
          )
      }).catch(() => {})
    }

    if (this.getType() === TARGET_TYPE_STRINGS.Window && 'postMessage' in this._target) {
      this._target.postMessage(message, {
        targetOrigin,
        transfer,
      })
    }

    if (
      typeof ServiceWorkerRegistration !== 'undefined' &&
      this._target instanceof ServiceWorkerRegistration
    ) {
      // ServiceWorkerContainer
      this._target.active?.postMessage(message, { transfer })
    }

    // 待后续优化: 匹配具体 client
    if (
      typeof ServiceWorkerGlobalScope !== 'undefined' &&
      this._target instanceof ServiceWorkerGlobalScope
    ) {
      this._target.clients
        .matchAll()
        .then((clients) => {
          clients.forEach((client) => client.postMessage(message, { transfer }))
        })
        .catch(() => {})
    }

    if (this._target instanceof SharedWorker) {
      this._target.port.postMessage(message, { transfer })
    }

    if (
      typeof SharedWorkerGlobalScope !== 'undefined' &&
      this._target instanceof SharedWorkerGlobalScope
    ) {
      this._onconnect.SharedWorkerGlobalPort?.then((messagePort) => {
        messagePort.postMessage(message, { transfer })
      }).catch(() => {})
    }

    if (this._target instanceof Worker) {
      this._target.postMessage(message, { transfer })
    }

    if (
      typeof DedicatedWorkerGlobalScope !== 'undefined' &&
      this._target instanceof DedicatedWorkerGlobalScope
    ) {
      this._target.postMessage(message, { transfer })
    }
  }

  upset(options: FactoryOptions) {
    this._options = { ...this._options, ...options }
  }
}

export default RPCFactory

export interface FactoryOptions {
  message?: boolean | AddEventListenerOptions
}

export type IframeSerializeOptions = StructuredSerializeOptions & {
  targetOrigin?: string
}

// WindowClient 和 Client 是 ServerWork 内部事件回调方法中的对象，暂且不用
// ServiceWorkerContainer 没办法拿到当前的 active，这里采用 ServiceWorkerRegistration
export type TargetType =
  | BroadcastChannel
  | WebSocket
  | Window
  //   | ServiceWorkerContainer
  | ServiceWorkerRegistration
  | ServiceWorkerGlobalScope
  | SharedWorker
  | SharedWorkerGlobalScope
  | Worker
  | DedicatedWorkerGlobalScope

interface ConnectRecordType {
  SharedWorkerGlobalPort?: Promise<MessagePort>
  WebSocketPort?: Promise<boolean>
  ServiceWorkerGlobalScope?: (event: ExtendableMessageEvent) => void
  SharedWorkerGlobalScope?: (event: MessageEvent) => void
}
