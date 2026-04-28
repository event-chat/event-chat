import { IframeSerializeOptions, Transport } from '../fields'

abstract class BaseTransport<T extends TargetType = TargetType> implements Transport {
  constructor(
    protected _target: T,
    protected _options: FactoryOptions = {}
  ) {}

  getType() {
    return `${Object.prototype.toString.call(this._target)}`
  }

  // 只有 window 存在 source
  is(source: MessageEventSource | null) {
    return source === null || this._target === source
  }

  upset(options: FactoryOptions) {
    this._options = { ...this._options, ...options }
  }

  // 通过 Decorator 调用，注销实例顺序：RPCAction - BaseTransport
  // RPCAction 注销前会先 onremove
  abstract destory(): void
  abstract onmessage(listener: (ev: MessageEvent) => unknown): void

  // 只提供监听、移除的方法，记录方法的事件需要外部处理
  abstract onremove(listener: (ev: MessageEvent) => unknown): void
  abstract postMessage(message: unknown, options?: IframeSerializeOptions): void
}

export default BaseTransport

export interface FactoryOptions {
  message?: boolean | AddEventListenerOptions
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
